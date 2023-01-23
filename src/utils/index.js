const mapDBToModel = ({
    songs_id,
    title,
    performer,
}) => ({
    id: songs_id,
    title,
    performer,
});

const mapDbToModelActivities = ({
    username,
    title,
    action,
    time,
}) => ({
    username,
    title,
    action,
    time,
});

const mapDbToModelAlbums = ({
    id,
    name,
    year,
    cover,
}) => ({
    id,
    name,
    year,
    coverUrl: cover,
});

module.exports = { mapDBToModel, mapDbToModelActivities, mapDbToModelAlbums };
