function saveCommentLogic({ token, station_id, comment }, db) {
    if (!token || !station_id || !comment) {
        return Promise.resolve({
            status: 400,
            body: { message: 'Datos incompletos' }
        });
    }

}

module.exports = { saveCommentLogic };