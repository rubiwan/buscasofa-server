const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const SECRET = require("./secret").secret;
const { saveComment, getComments, editComment , deleteComment, getUserComments} = require('./controllers/commentController');
const { registerUser, loginUser } = require('./controllers/userController');

const app = express();
app.use(express.json());
app.use(cors());

/**
 * Conexión a la base de datos SQLite
 *
 * @type {Database}
 */
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');

        console.log('Creando la tabla de usuarios si no existe...');
        db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
    `);


        console.log('Creando la tabla de comentarios si no existe...');
        db.run(`
                CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_id TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    username TEXT NOT NULL,
                    comment TEXT NOT NULL,
                    parent_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
    `);
    }
});

/**
 * Registro de usuario
 */
app.post('/api/register', (req, res) => registerUser(req, res, db));

/**
 * Login de usuario
 */
app.post('/api/login', (req, res) => loginUser(req, res, db));

/**
 * Guardar comentario
 */
app.post('/api/comments', (req, res) => saveComment(req, res, db));

/**
 * Obtener comentarios de una estación
 */
app.get('/api/comments/:station_id', (req, res) => getComments(req, res, db));

/**
 * Editar comentario
 */
app.put('/api/comments/:id', (req, res) => editComment(req, res, db));

/**
 * Eliminar comentario
 */
app.delete('/api/comments/:id', (req, res) => deleteComment(req, res, db));

/**
 * Obtener comentarios de un usuario
 */
app.get('/api/profile/user', (req, res) => getUserComments(req, res, db));

app.listen(4000, () => console.log('Servidor backend (SQLite) en http://localhost:4000'));