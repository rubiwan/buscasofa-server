jest.mock('bcryptjs', () => ({
    hash: jest.fn(() => Promise.resolve('hashed1234'))
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'fake-jwt-token')
}));

jest.mock('../secret', () => ({
    secret: 'clave-falsa'
}));

const { registerUser } = require('../controllers/userController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('registerUser', () => {
    it('debería rechazar si falta el email', async () => {
        const req = {
            body: { username: 'ana', password: '1234' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {};

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
            get: (sql, params, cb) => cb(null, { id: 1 })
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
            get: jest
                .fn()
                .mockImplementationOnce((sql, params, cb) => cb(null, null))
                .mockImplementationOnce((sql, params, cb) => cb(null, { id: 99, username: 'nuevo' })),
            run: function (sql, params, cb) {
                cb.call({ lastID: 99 }, null); //
            }
        };

        try {
            registerUser(req, res, db);

            setImmediate(() => {
                try {
                    expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
                    expect(jwt.sign).toHaveBeenCalledWith(
                        { id: 99, username: 'nuevo' },
                        'clave-falsa',
                        { expiresIn: '1h' }
                    );
                    expect(res.status).toHaveBeenCalledWith(201);
                    expect(res.json).toHaveBeenCalledWith({
                        message: 'Usuario registrado correctamente',
                        token: 'fake-jwt-token',
                        username: 'nuevo'
                    });
                    done();
                } catch (assertErr) {
                    console.error('ASSERT ERROR:', assertErr);
                    done(assertErr);
                }
            });
        } catch (e) {
            console.error('REGISTERUSER ERROR:', e);
            done(e);
        }
    });
});

jest.mock('bcryptjs', () => ({
    hash: jest.fn(() => Promise.resolve('hashed1234')),
    compare: jest.fn(() => Promise.resolve(false)) // agrega compare mockeado
}));

const { loginUser } = require('../controllers/userController');
/**
 * Pruebas para loginUser
 */
describe('loginUser', () => {
    it('debería rechazar si falta el email o password', async () => {
        const req = {
            body: { email: '', password: '' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {};

        await loginUser(req, res, db);

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


    it('debería devolver 200 y un token si las credenciales son correctas', (done) => {

        bcrypt.compare.mockImplementation(() => Promise.resolve(true));

        const req = {
            body: { email: 'ana@mail.com', password: '1234' }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const db = {
            get: (query, params, cb) => cb(null, {
                id: 1,
                username: 'ana',
                email: 'ana@mail.com',
                password: 'hashCorrecto'
            })
        };


        loginUser(req, res, db);

        setImmediate(() => {
            const jwt = require('jsonwebtoken');

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, username: 'ana' },
                expect.any(String),
                { expiresIn: '1h' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login correcto',
                token: 'fake-jwt-token',
                username: 'ana'
            });
            done();
        });
    });

});
