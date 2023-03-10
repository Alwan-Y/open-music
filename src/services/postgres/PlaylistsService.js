const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel } = require('../../utils');

class PlaylistsService {
    constructor(collaborationService, playlistSongActivitiesService, cacheService) {
        this._pool = new Pool();

        this._collaborationService = collaborationService;
        this._playlistSongActivitiesService = playlistSongActivitiesService;
        this._cacheService = cacheService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists."name", users.username 
            FROM playlists
            LEFT JOIN collaborations on collaborations.playlist_id = playlists.id 
            LEFT JOIN users on playlists."owner" = users.id
            WHERE playlists.owner = $1 or collaborations.user_id = $1`,
            values: [owner],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Playlist  tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async addSongToPlaylist({
        playlistId, songId, credentialId, action,
    }) {
        const id = `playlistsong-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        this._playlistSongActivitiesService.addPlaylistSongActivity({
            playlistId, songId, credentialId, action,
        });
        await this._cacheService.delete(`playlist:${playlistId}`);
        return result.rows[0].id;
    }

    async getSongsFromPlaylist(playlistId) {
        try {
            const result = await this._cacheService.get(`playlist:${playlistId}`);
            return JSON.parse(result);
        } catch (error) {
            const query = {
                text: `SELECT 
                            playlists.id,
                            playlists."name",
                            users.username,
                            songs.id as songs_id,
                            songs.title,
                            songs.performer 
                        FROM playlists  
                        LEFT JOIN playlist_songs on playlists.id = playlist_songs.playlist_id 
                        LEFT JOIN songs on playlist_songs.song_id = songs.id 
                        LEFT JOIN users on playlists."owner" = users.id
                        WHERE playlist_songs.playlist_id = $1`,
                values: [playlistId],
            };

            const result = await this._pool.query(query);
            const songs = result.rows.map(mapDBToModel);

            const playlist = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                username: result.rows[0].username,
                songs,
            };

            await this._cacheService.set(`playlist:${playlistId}`, JSON.stringify(playlist));

            return playlist;
        }
    }

    async deleteSongFromPlaylist({
        playlistId, songId, credentialId, action,
    }) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
        }

        await this._cacheService.delete(`playlist:${playlistId}`);

        this._playlistSongActivitiesService.addPlaylistSongActivity({
            playlistId, songId, credentialId, action,
        });
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
            // throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifySongsIdIsExist(songId) {
        const query = {
            text: 'SELECT id FROM songs WHERE id = $1',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Lagu gagal ditambahkan ke playlist. songs tidak ditemukan');
        }
    }

    async getPlaylistSongActivities(playlistId) {
        const query = {
            text: `SELECT 
                playlist_song_activities.id, 
                playlist_song_activities.playlist_id, 
                playlist_song_activities.song_id, 
                playlist_song_activities.user_id, 
                playlist_song_activities.action, 
                playlist_song_activities.time, 
                users.username
            FROM playlist_song_activities
            LEFT JOIN users ON playlist_song_activities.user_id = users.id
            WHERE playlist_song_activities.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist Activities tidak ditemukan');
        }

        return result.rows;
    }
}

module.exports = PlaylistsService;
