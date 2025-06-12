function registerUser(req, res, db) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

}

module.exports = {
    registerUser
};