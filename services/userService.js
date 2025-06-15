const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = require('../secret').secret;

async function registerUserLogic({ username, email, password }, db) {
    if (!username || !email || !password) {
        return {
            status: 400,
            body: { message: 'Todos los campos son obligatorios' }
        };
    }

    const userExists = await new Promise((resolve, reject) =>
        db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    );

    if (userExists) {
        return {
            status: 409,
            body: { message: 'Usuario o email ya existe' }
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertedId = await new Promise((resolve, reject) =>
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        )
    );

    const user = await new Promise((resolve, reject) =>
        db.get('SELECT * FROM users WHERE id = ?', [insertedId], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );

    const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: '1h' }
    );

    return {
        status: 201,
        body: {
            message: 'Usuario registrado correctamente',
            token,
            username: user.username
        }
    };
}



/**
 * Lógica de negocio para login
 */
async function loginUserLogic({ email, password }, db) {
    if (!email || !password) {
        return { status: 400, body: { message: 'Todos los campos son obligatorios' } };
    }

    const user = await new Promise((resolve, reject) =>
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) =>
            err ? reject(err) : resolve(row)
        )
    );

    if (!user) {
        return { status: 401, body: { message: 'Credenciales incorrectas' } };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return { status: 401, body: { message: 'Credenciales incorrectas' } };
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: '1h' }
    );

    return {
        status: 200,
        body: {
            message: 'Login correcto',
            token,
            username: user.username
        }
    };
}


module.exports = { registerUserLogic, loginUserLogic };




