const { registerUserLogic } = require('../services/userService');

function registerUser(req, res, db) {
    registerUserLogic(req.body, db)
        .then(({ status, body }) => res.status(status).json(body))
        .catch(() => res.status(500).json({ message: 'Error en el servidor' }));
}

module.exports = { registerUser };
