const bcrypt = require('bcryptjs');

function registerUser(req, res, db) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email],
        async (err, row) => {
            if (row) {
                return res.status(409).json({ message: 'Usuario o email ya existe' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error al insertar usuario' });
                    }

                    return res.status(201).json({ message: 'Usuario registrado correctamente' });
                }
            );
        }
    );
}

module.exports = {
    registerUser
};
