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

module.exports = { mapDBToModel, mapDbToModelActivities };
