# Buscasofa Backend API

A Node.js and Express backend for Buscasofa, a petrol-station application with user accounts and station comments.

The default server uses SQLite for local persistence. Routes delegate request handling to controllers, with application logic separated into services.

**Frontend:** [rubiwan/buscasofa](https://github.com/rubiwan/buscasofa)

## Features

- User registration and login.
- Password hashing with bcryptjs.
- JWT authentication with tokens that expire after one hour.
- Station comments and replies through an optional parent-comment ID.
- Comment editing and deletion.
- Retrieval of comments for the authenticated user.
- Jest tests with mocked database and authentication dependencies.

## Stack

Node.js · Express · SQLite3 · JSON Web Tokens · bcryptjs · Jest

The repository also includes a separate MySQL implementation in `index.js`. It is not the server started by `npm run dev`.

## Run locally

Locally checked with **Node.js 22.16.0** and npm 10.9.2 on macOS.

### 1. Install dependencies

```bash
git clone https://github.com/rubiwan/buscasofa-server.git
cd buscasofa-server
npm ci
```

### 2. Configure the JWT secret

The server requires `JWT_SECRET`. Generate a random secret for your local terminal session:

```bash
export JWT_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
```

For Windows PowerShell:

```powershell
$env:JWT_SECRET = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep the same secret across server restarts if existing tokens should remain valid. Generating a new secret invalidates tokens signed with the previous one. Do not commit secrets.

The application reads the environment directly; it does not automatically load a `.env` file.

### 3. Start the server

```bash
npm run dev
```

This runs `index_dev.js` on **http://localhost:4000**. SQLite creates `database.db` in the current working directory and initialises the `users` and `comments` tables. Start the server from the repository root.

This is an API server: visiting `/` returns `Cannot GET /` because no homepage route is defined.

## API routes

| Method | Route | Input / authentication |
| --- | --- | --- |
| POST | `/api/register` | JSON: `username`, `email`, `password` |
| POST | `/api/login` | JSON: `email`, `password` |
| POST | `/api/comments` | JSON: `token`, `station_id`, `comment`, optional `parent_id` |
| GET | `/api/comments/:station_id` | Station ID in the URL; no token required |
| PUT | `/api/comments/:id` | JSON: `token`, `comment` |
| DELETE | `/api/comments/:id` | JSON: `token` |
| GET | `/api/profile/user` | Header: `Authorization: Bearer <token>` |

Registration and login return a token and username on success. Comments are associated with station IDs supplied by the client; this backend does not provide a petrol-station catalogue.

### Example: read station comments

With the server running:

```bash
curl http://localhost:4000/api/comments/station-example
```

A station with no comments returns an empty JSON array.

## Tests and dependency checks

```bash
npm test
npm audit
```

Tests supply fake authentication secrets and mock JWT and database operations. They do not require the server's `JWT_SECRET` or a running database.

During the October 2026 cleanup:

- All **18 tests** in two suites passed locally.
- SQLite 6.0.1 passed a separate in-memory table creation, insert and read check.
- `npm audit` reported **0 vulnerabilities** after dependency updates.

These checks do not establish full HTTP or frontend-to-backend integration coverage. Audit results can change as new advisories are published.

## Repository structure

| Path | Purpose |
| --- | --- |
| `index_dev.js` | Default Express server using SQLite |
| `controllers/` | HTTP request and response handling |
| `services/` | Registration, login and comment logic |
| `persistence/db.js` | SQLite connection and table creation |
| `secret.js` | Required JWT secret from the environment |
| `tests/` | Jest tests |
| `index.js` | Separate MySQL server implementation |
| `package-lock.json` | Locked dependency tree |

Local dependencies, the SQLite database and editor files are excluded by `.gitignore`.

## Current limitations

This is an educational project. Comment editing and deletion verify a JWT but currently do not check that the authenticated user owns the comment. Ownership checks are needed before exposing these operations to untrusted users.

CORS currently uses its default permissive configuration. Full API integration tests and environment-based MySQL configuration are potential follow-up improvements.

## Credits

Developed as a group project for **Advanced Software Engineering (ISA)**.

The existing project documentation credits [Anabel Díaz](https://github.com/rubiwan) and [Emilio Quechen](https://github.com/eQuechen). This repository is a fork with subsequent maintenance changes.
