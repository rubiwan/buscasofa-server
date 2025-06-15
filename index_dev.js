const express = require('express');
const cors = require('cors');
const db = require('./persistence/db');
const { saveComment, getComments, editComment , deleteComment, getUserComments } = require('./controllers/commentController');
const { registerUser, loginUser } = require('./controllers/userController');

const app = express();
app.use(express.json());
app.use(cors());


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