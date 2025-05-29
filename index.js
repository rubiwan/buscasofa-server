const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Para hacer login:
const jwt = require('jsonwebtoken');
const SECRET = '6isvK1s%40nLRnku'; // Usa una clave secreta segura

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'tu_contraseña',
  database: 'gasolineras'
};

// Ruta de registro
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [existing] = await conn.execute('SELECT id FROM users WHERE username=? OR email=?', [username, email]);
    if (existing.length > 0) {
      await conn.end();
      return res.status(409).json({ message: 'Usuario o email ya existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    await conn.end();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [users] = await conn.execute('SELECT * FROM users WHERE email=?', [email]);
    await conn.end();
    if (users.length === 0) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Credenciales incorrectas' });

    // Genera un token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login correcto', token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

app.listen(4000, () => console.log('Servidor backend en http://localhost:4000'));