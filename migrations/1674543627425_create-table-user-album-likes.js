/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('user_album_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            foreignKeys: true,
            reference: 'users(id)',
        },
        album_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            foreignKeys: true,
            reference: 'albums(id)',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('user_album_likes');
};
