const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({
        title,
        year,
        performer,
        genre,
        duration,
        albumId,
    }) {
        const id = `song-${nanoid(16)}`;
        const createdAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId, createdAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getSongs(title, performer) {
        let query = '';

        if (title && performer) {
            query = `WHERE lower(title) LIKE '%${title.toLowerCase()}%' AND lower(performer) LIKE '%${performer.toLowerCase()}%'`;
        }

        if (title && !performer) {
            query = `WHERE lower(title) LIKE '%${title.toLowerCase()}%'`;
        }

        if (!title && performer) {
            query = `WHERE lower(performer) LIKE '%${performer.toLowerCase()}%'`;
        }

        const querySong = 'SELECT id, title, performer FROM songs'.concat(' ', query);

        const { rows } = await this._pool.query(querySong);

        return rows;
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const { rows, rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return rows[0];
    }

    async editSongById(id, {
        title,
        year,
        performer,
        genre,
        duration,
        albumId,
    }) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 ,updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, performer, genre, duration, albumId, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsService;
