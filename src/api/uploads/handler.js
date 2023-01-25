class UploadsHandler {
    constructor(storageService, albumsService, validator) {
        this._storageService = storageService;
        this._albumsService = albumsService;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
    }

    async postUploadImageHandler(request, h) {
        const { cover } = request.payload;
        const { id } = request.params;

        this._validator.validateImageHeaders(cover.hapi.headers);

        await this._albumsService.verifyAlbumExists(id);

        const fileLocation = await this._storageService.writeFile(cover, cover.hapi);

        await this._albumsService.addAlbumCover(id, fileLocation);

        const response = h.response({
            status: 'success',
            message: 'Gambar berhasil diunggah',
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;
