const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDbToModelAlbums } = require('../../utils');

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT id, name, year FROM albums');
        return result.rows;
    }

    async getAlbumById(id) {
        const queryAlbum = {
            text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
            values: [id],
        };

        const querySongs = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN albums ON songs.album_id = albums.id WHERE albums.id = $1',
            values: [id],
        };

        const resultAlbum = await this._pool.query(queryAlbum);
        const resultSongs = await this._pool.query(querySongs);

        if (!resultAlbum.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return {
            ...resultAlbum.rows.map(mapDbToModelAlbums)[0],
            songs: resultSongs.rows,
        };
    }

    async updateAlbumById(id, { name, year }) {
        const updateAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updateAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async addAlbumCover(playlistId, cover) {
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
            values: [cover, playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal menambahkan cover. Album tidak ditemukan');
        }
    }

    async verifyAlbumExists(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }
    }
}

module.exports = AlbumsService;
