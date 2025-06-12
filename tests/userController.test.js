const { registerUser } = require('../controllers/userController');

/**
 * Prueba unitaria para el registro de usuarios
 */
describe('registerUser', () => {
    it('debería rechazar si falta el email', () => {
        const req = {
            body: { username: 'ana', password: '1234' } // falta el email
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {}; // aún no se usa

        registerUser(req, res, db);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Todos los campos son obligatorios' });
    });
});

/**
 * Control de usuarios repetidos
 */
it('debería rechazar si el usuario ya existe', (done) => {
    const req = {
        body: { username: 'ana', email: 'ana@mail.com', password: '1234' }
    };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const db = {
        get: (sql, params, callback) => {
            callback(null, { id: 1 }); // simula usuario
        }
    };

    registerUser(req, res, db);

    setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: 'Usuario o email ya existe' });
        done();
    });
});
