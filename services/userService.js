const bcrypt = require('bcryptjs');

/**
 * Lógica de negocio para registrar usuario
 */
async function registerUserLogic({ username, email, password }, db) {
    if (!username || !email || !password) {
        return { status: 400, body: { message: 'Todos los campos son obligatorios' } };
    }

    const userExists = await new Promise((resolve, reject) =>
        db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );

    if (userExists) {
        return { status: 409, body: { message: 'Usuario o email ya existe' } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) =>
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err) => (err ? reject(err) : resolve())
        )
    );

    return { status: 201, body: { message: 'Usuario registrado correctamente' } };
}

module.exports = { registerUserLogic };
