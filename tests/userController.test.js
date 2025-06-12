const { registerUser, loginUser} = require('../controllers/userController');

/**
 * Prueba unitaria para el registro de usuarios
 */
describe('registerUser', () => {
    it('debería rechazar si falta el email', async () => {
        const req = {
            body: {username: 'ana', password: '1234'} // falta el email
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {}; // aún no se usa

        await registerUser(req, res, db);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({message: 'Todos los campos son obligatorios'});
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

const bcrypt = require('bcryptjs');

jest.mock('bcryptjs', () => ({
    hash: jest.fn(() => Promise.resolve('hashed1234'))
}));

it('debería registrar al usuario correctamente si no existe', (done) => {
    const req = {
        body: { username: 'nuevo', email: 'nuevo@mail.com', password: '1234' }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const db = {
        get: (sql, params, cb) => cb(null, null), // no existe el usuario
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

describe('loginUser', () => {
    it('debería rechazar si falta el email o password', () => {
        const req = {
            body: { email: '', password: '' } // faltan ambos
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const db = {}; // aún no se usa

        loginUser(req, res, db);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Todos los campos son obligatorios' });
    });
});


