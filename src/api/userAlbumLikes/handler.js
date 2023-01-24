const autoBind = require('auto-bind');

class UserAlbumLikeHandler {
    constructor(userAlbumLikesService, albumsService) {
        this._userAlbumLikesService = userAlbumLikesService;
        this._albumsService = albumsService;

        autoBind(this);
    }

    async postUserLikeAlbumHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.verifyAlbumExists(albumId);
        const isLiked = await this._userAlbumLikesService
            .checkUserAlbumLikes(credentialId, albumId);

        if (!isLiked) {
            await this._userAlbumLikesService.addUserAlbumLikes(credentialId, albumId);

            const response = h.response({
                status: 'success',
                message: 'Berhasil menyukai album',
            });
            response.code(201);
            return response;
        }

        await this._userAlbumLikesService.deleteUserAlbumLikes(credentialId, albumId);
        const response = h.response({
            status: 'success',
            message: 'Berhasil menghapus suka album',
        });
        response.code(201);
        return response;
    }

    async getUserLikeAlbumCountHandler(request, h) {
        const { id: albumId } = request.params;
        const result = await this._userAlbumLikesService.getTotalLikesAlbum(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes: result.count,
            },
        });
        response.header('X-Data-Source', result.source);
        response.code(200);
        return response;
    }
}
module.exports = UserAlbumLikeHandler;
