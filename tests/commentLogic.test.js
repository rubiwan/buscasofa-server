const { saveCommentLogic } = require('../services/commentService');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(() => { throw new Error('Token inválido') })
}));

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

    it('debería rechazar si el token es inválido', async () => {
        const input = {
            token: 'token-falso',
            station_id: '1234',
            comment: 'Un comentario de prueba'
        };
        const db = {};

        const result = await saveCommentLogic(input, db);

        expect(jwt.verify).toHaveBeenCalledWith('token-falso', expect.any(String));
        expect(result.status).toBe(401);
        expect(result.body).toEqual({ message: 'Token inválido' });
    });
});