class ExportsHandler {
    constructor(ProducerService, PlaylistsService, validator) {
        this._producerService = ProducerService;
        this._playlistService = PlaylistsService;
        this._validator = validator;

        this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
    }

    async postExportNotesHandler(request, h) {
        this._validator.validateExportNotesPayload(request.payload);

        await this._playlistService
            .verifyPlaylistOwner(request.params.playlistId, request.auth.credentials.id);

        const message = {
            playlistId: request.params.playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
