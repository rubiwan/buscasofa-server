const { registerUserLogic } = require('../services/userService');
const bcrypt = require('bcryptjs');

function registerUser(req, res, db) {
    registerUserLogic(req.body, db)
        .then(({ status, body }) => res.status(status).json(body))
        .catch(() => res.status(500).json({ message: 'Error en el servidor' }));
}

module.exports = { registerUser };
module.exports = { registerUser, loginUser };

function loginUser(req, res, db) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // aún no generamos el token (siguiente paso)
    });
}

module.exports = {
    registerUser,
    loginUser
};
