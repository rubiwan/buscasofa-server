const { saveCommentLogic } = require('../services/commentService');

describe('saveCommentLogic', () => {
    it('debería rechazar si faltan datos obligatorios', async () => {
        const input = {
            token: '',
            station_id: '',
            comment: ''
        };
        const db = {};

        const result = await saveCommentLogic(input, db);

        expect(result.status).toBe(400);
        expect(result.body).toEqual({ message: 'Datos incompletos' });
    });
});