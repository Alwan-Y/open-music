// utils/config.js

const config = {
    app: {
        host: process.env.HOST,
        port: process.env.PORT,
    },
    postgres: {
        user: process.env.PGUSER,
        pass: process.env.PGPASSWORD,
        db: process.env.PGDATABASE,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
    },
    jwt: {
        token: {
            access: process.env.ACCESS_TOKEN_KEY,
            refresh: process.env.REFRESH_TOKEN_KEY,
        },
        age: process.env.ACCESS_TOKEN_AGE,
    },
    s3: {
        bucketName: process.env.AWS_BUCKET_NAME,
    },
    rabbitMq: {
        server: process.env.RABBITMQ_SERVER,
    },
    redis: {
        host: process.env.REDIS_SERVER,
    },
};

module.exports = config;
