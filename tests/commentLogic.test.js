const { saveCommentLogic, getCommentsLogic, editCommentLogic } = require('../services/commentService');
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

    it('debería guardar el comentario y devolver 201 si los datos son válidos', async () => {
        // simulando que el token es valido, asi
        jwt.verify.mockImplementation(() => ({ id: 10, username: 'ana' }));

        const input = {
            token: 'token-válido',
            station_id: 'station-123',
            comment: 'Excelente servicio'
        };

        const db = {
            run: jest.fn((sql, params, cb) => cb(null))
        };

        const result = await saveCommentLogic(input, db);

        expect(db.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO comments'),
            ['station-123', 10, 'ana', 'Excelente servicio'],
            expect.any(Function)
        );

        expect(result.status).toBe(201);
        expect(result.body).toEqual({ message: 'Comentario guardado' });
    });

});

describe('getCommentsLogic', () => {
    it('debería devolver una lista vacía si no hay comentarios', async () => {
        const db = {
            all: jest.fn((sql, params, cb) => cb(null, [])) // no hay comentarios
        };

        const result = await getCommentsLogic('station-xyz', db);

        expect(db.all).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            ['station-xyz'],
            expect.any(Function)
        );

        expect(result.status).toBe(200);
        expect(result.body).toEqual([]);
    });
});

describe('editCommentLogic', () => {
    it('debería devolver 400 si faltan token o comentario', async () => {
        const input = {
            token: '',
            comment: ''
        };
        const db = {};
        const result = await editCommentLogic(input, '123', db);

        expect(result.status).toBe(400);
        expect(result.body).toEqual({ message: 'Datos incompletos' });
    });

    jwt.verify.mockImplementation(() => { throw new Error('Token inválido') });

    it('debería devolver 401 si el token es inválido', async () => {
        const input = {
            token: 'token-falso',
            comment: 'Comentario actualizado'
        };

        const db = {}; // la base de datos no se usa todavía

        const result = await editCommentLogic(input, '123', db);

        expect(jwt.verify).toHaveBeenCalledWith('token-falso', expect.any(String));
        expect(result.status).toBe(401);
        expect(result.body).toEqual({ message: 'Token inválido' });
    });
});