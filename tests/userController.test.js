const { registerUser } = require('../controllers/userController');

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
