const { registerUser, loginUser } = require('../controllers/userController');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs', () => ({
    compare: jest.fn(() => Promise.resolve(false)),
    hash: jest.fn(() => Promise.resolve('hashed1234'))
}));

/**
 * Pruebas para registerUser
 */
describe('registerUser', () => {
    it('debería rechazar si falta el email', async () => {
        const req = {
            body: { username: 'ana', password: '1234' } // falta el email
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {}; // aún no se usa

        await registerUser(req, res, db);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Todos los campos son obligatorios' });
    });

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
                callback(null, { id: 1 }); // simula usuario existente
            }
        };

        registerUser(req, res, db);

        setImmediate(() => {
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario o email ya existe' });
            done();
        });
    });

    it('debería registrar al usuario correctamente si no existe', (done) => {
        const req = {
            body: { username: 'nuevo', email: 'nuevo@mail.com', password: '1234' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {
            get: (sql, params, cb) => cb(null, null), // no existe
            run: (sql, params, cb) => cb(null) // inserción exitosa
        };

        registerUser(req, res, db);

        setImmediate(() => {
            expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuario registrado correctamente' });
            done();
        });
    });
});

/**
 * Pruebas para loginUser
 */
describe('loginUser', () => {
    it('debería rechazar si falta el email o password', () => {
        const req = {
            body: { email: '', password: '' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {};

        loginUser(req, res, db);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Todos los campos son obligatorios' });
    });

    it('debería devolver 401 si el usuario no existe', (done) => {
        const req = {
            body: { email: 'noexiste@mail.com', password: '1234' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {
            get: (query, params, cb) => cb(null, null) // no encontrado
        };

        loginUser(req, res, db);

        setImmediate(() => {
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales incorrectas' });
            done();
        });
    });

    it('debería devolver 401 si la contraseña es incorrecta', (done) => {
        const req = {
            body: { email: 'ana@mail.com', password: 'malapass' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {
            get: (query, params, cb) => cb(null, { email: 'ana@mail.com', password: 'hashReal' })
        };

        loginUser(req, res, db);

        setImmediate(() => {
            expect(bcrypt.compare).toHaveBeenCalledWith('malapass', 'hashReal');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales incorrectas' });
            done();
        });
    });
});
