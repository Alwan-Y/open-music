const Jwt = require('@hapi/jwt');
const config = require('../utils/config');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
    generateAccessToken: (payload) => Jwt.token.generate(payload, config.jwt.token.access),
    generateRefreshToken: (payload) => Jwt.token.generate(payload, config.jwt.token.refresh),
    verifyRefreshToken: (refreshToken) => {
        try {
            const artifacts = Jwt.token.decode(refreshToken);
            Jwt.token.verifySignature(artifacts, config.jwt.token.refresh);
            const { payload } = artifacts.decoded;
            return payload;
        } catch (error) {
            throw new InvariantError('Refresh token tidak valid');
        }
    },
};

module.exports = TokenManager;
