const { registerUserLogic } = require('../services/userService');

function registerUser(req, res, db) {
    registerUserLogic(req.body, db)
        .then(({ status, body }) => res.status(status).json(body))
        .catch(() => res.status(500).json({ message: 'Error en el servidor' }));
}

module.exports = { registerUser };

function loginUser(req, res, db) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    //implementacion futura
}

module.exports = {
    registerUser,
    loginUser
};
