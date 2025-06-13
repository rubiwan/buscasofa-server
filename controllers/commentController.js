const { saveCommentLogic } = require('../services/commentService');

function saveComment(req, res, db) {
    saveCommentLogic(req.body, db)
        .then(({ status, body }) => res.status(status).json(body))
        .catch(() => res.status(500).json({ message: 'Error al guardar comentario' }));
}

module.exports = {
    saveComment
};