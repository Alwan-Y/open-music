const mapDBToModel = ({
    songs_id,
    title,
    performer,
}) => ({
    id: songs_id,
    title,
    performer,
});

module.exports = { mapDBToModel };
