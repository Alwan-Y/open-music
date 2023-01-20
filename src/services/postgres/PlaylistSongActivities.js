const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongActivities {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylistSongActivity({
        playlistId, songId, credentialId, action,
    }) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date().toISOString();
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, credentialId, action, time],
        };
        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist Activities gagal ditambahkan');
        }

        return result.rows[0].id;
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
                users.username,
                songs.title
            FROM playlist_song_activities
            LEFT JOIN users ON playlist_song_activities.user_id = users.id
            LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
            WHERE playlist_song_activities.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist Activities tidak ditemukan');
        }

        return result.rows;
    }
}

module.exports = PlaylistSongActivities;
