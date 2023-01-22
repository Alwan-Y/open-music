/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_to_playlists.id',
        'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_to_playlists.id');
};
