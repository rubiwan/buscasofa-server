const jwt = require('jsonwebtoken');
const SECRET = require('../secret').secret;

async function saveCommentLogic({ token, station_id, comment }, db) {
    if (!token || !station_id || !comment) {
        return {
            status: 400,
            body: { message: 'Datos incompletos' }
        };
    }

    let payload;
    try {
        payload = jwt.verify(token, SECRET);
    } catch {
        return {
            status: 401,
            body: { message: 'Token inválido' }
        };
    }

    await new Promise((resolve, reject) =>
        db.run(
            'INSERT INTO comments (station_id, user_id, username, comment) VALUES (?, ?, ?, ?)',
            [station_id, payload.id, payload.username, comment],
            (err) => (err ? reject(err) : resolve())
        )
    );

    return {
        status: 201,
        body: { message: 'Comentario guardado' }
    };
}

module.exports = { saveCommentLogic };
