function registerUser(req, res, db) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    db.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email],
        (err, row) => {
            if (row) {
                return res.status(409).json({ message: 'Usuario o email ya existe' });
            }

            // pendiente de implementacion
        }
    );
}

module.exports = {
    registerUser
};