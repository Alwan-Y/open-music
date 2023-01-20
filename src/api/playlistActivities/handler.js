const autoBind = require('auto-bind');
const { mapDbToModelActivities } = require('../../utils');

class PlaylistSongActivitiesHandler {
    constructor(playlistSongActivitiesService, playlistsService) {
        this._playlistSongActivitiesService = playlistSongActivitiesService;
        this._playlistsService = playlistsService;

        autoBind(this);
    }

    async getPlaylistSongActivitiesHandler(request) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        const activities = await this._playlistSongActivitiesService
            .getPlaylistSongActivities(playlistId);

        const playlistID = activities[0].playlist_id;
        const mapActivities = activities.map(mapDbToModelActivities);

        console.log(mapActivities);

        return {
            status: 'success',
            data: {
                playlistId: playlistID,
                activities: mapActivities,
            },
        };
    }
}

module.exports = PlaylistSongActivitiesHandler;
