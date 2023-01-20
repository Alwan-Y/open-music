const autoBind = require('auto-bind');

class PlaylistSongActivitiesHandler {
    constructor(service) {
        this._service = service;

        autoBind(this);
    }

    async postPlaylistSongActivityHandler({
        playlistId, songId, userId, action,
    }) {
        const insertToActivities = await this._service.addPlaylistSongActivity({
            playlistId, songId, userId, action,
        });

        return insertToActivities;
    }

    async getPlaylistSongActivitiesHandler(request) {
        const { playlistId } = request.params;
        const activities = await this._service.getPlaylistSongActivities(playlistId);

        return {
            status: 'success',
            data: {
                activities,
            },
        };
    }
}

module.exports = PlaylistSongActivitiesHandler;
