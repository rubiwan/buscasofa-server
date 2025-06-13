const { saveCommentLogic, getCommentsLogic } = require('../services/commentService');

function saveComment(req, res, db) {
    saveCommentLogic(req.body, db)
        .then(({ status, body }) => res.status(status).json(body))
        .catch(() => res.status(500).json({ message: 'Error al guardar comentario' }));
}

function getComments(req, res, db) {
    getCommentsLogic(req.params.station_id, db)
        .then(({ status, body }) => res.status(status).json(body))
        .catch(() => res.status(500).json({ message: 'Error al obtener comentarios' }));
}

module.exports = {
    saveComment,
    getComments
};