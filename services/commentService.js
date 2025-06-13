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

    // pendiente persistencia
}

module.exports = { saveCommentLogic };
