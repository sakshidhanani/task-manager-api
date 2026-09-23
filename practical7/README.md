# Practical 7: Authentication and Middleware Pipeline

JWT-based authentication and server-side input validation added to the
Practical 6 Task Manager (React + Express + MongoDB), as an Express
middleware pipeline:

```
Client Request (Authorization: Bearer <token>)
        |
        v
  [Auth Middleware]        → verifies JWT, sets req.user
        |
        v
  [Validation Middleware]  → checks request body
        |
        v
  Controller (task routes)
```

## Project structure

```
practical7/
├── backend/
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js             ← NEW: email + hashed password
│   ├── middleware/
│   │   ├── auth.js             ← NEW: verifies JWT from Authorization header
│   │   └── validateTask.js     ← NEW: rejects malformed task bodies
│   ├── routes/
│   │   ├── auth.js             ← NEW: /register, /login, /me
│   │   └── tasks.js            ← now protected + validated
│   └── server.js
└── frontend/
    └── src/
        ├── api.js               ← token storage + auth-aware fetch calls
        ├── App.jsx               ← login gate, logout, 401 handling
        └── components/
            └── AuthForm.jsx      ← NEW: login / register form
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` → a local MongoDB instance or a MongoDB Atlas connection string
- `JWT_SECRET` → replace the placeholder with a long random string (this is what
  signs and verifies your tokens — never commit the real value)

Run the server:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API runs at `http://localhost:5000`. If `JWT_SECRET` is missing, the server
exits immediately with a clear error instead of failing mysteriously later.

## 2. Frontend setup

Open a **second terminal** (the backend must stay running in the first one):

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## 3. Test the full flow (UI)

1. Open `http://localhost:5173` — you'll see a Login / Register screen.
2. Click **Register**, enter an email and a password (6+ characters), submit.
   You're registered and automatically logged in.
3. The app fetches `GET /auth/me` and `GET /tasks` using the JWT — both
   protected routes now work because the token is attached automatically.
4. Add, edit, complete, and delete tasks as in Practical 6 — every request now
   carries `Authorization: Bearer <token>`.
5. Click **Logout** — the token is cleared and you're returned to the login
   screen. Task routes are no longer reachable until you log in again.
6. Refresh the page while logged in — you stay logged in (token persists in
   `localStorage`) until it expires (1 hour) or you log out.

## 4. Test the full flow (Postman) — matches the lab's Step 8

1. `POST http://localhost:5000/auth/register`
   Body (JSON): `{ "email": "test@example.com", "password": "password123" }`
   → `201 Created`
2. `POST http://localhost:5000/auth/login`
   Same body → `200 OK` with `{ "token": "...", "user": {...} }`
3. Copy the `token` value.
4. `GET http://localhost:5000/tasks`
   Header: `Authorization: Bearer <token>` → `200 OK`, `[]`
5. Try the same request **without** the header → `401 Unauthorized`.
6. `POST http://localhost:5000/tasks` with the header and
   `{ "title": "Read chapter 4", "priority": "high" }` → `201 Created`.
7. `POST http://localhost:5000/tasks` with the header and `{}` (no title)
   → `400 Bad Request`, rejected before it ever reaches MongoDB.
8. `GET http://localhost:5000/auth/me` with the header → your user details.

## What's implemented (maps to the practical's requirements)

| Requirement | Where |
|---|---|
| Hash passwords with bcrypt before saving | `routes/auth.js` → `bcrypt.hash(password, 10)` |
| JWT generation on login, 1-hour expiry | `routes/auth.js` → `jwt.sign(..., { expiresIn: '1h' })` |
| Auth middleware protecting all task routes | `middleware/auth.js`, mounted in `server.js` as `app.use('/tasks', authMiddleware, taskRoutes)` |
| Server-side input validation before DB | `middleware/validateTask.js`, applied to `POST /tasks` and `PUT /tasks/:id` |
| `/me` endpoint (supplementary) | `routes/auth.js` → `GET /auth/me` |
| Frontend redirect to login on 401 (supplementary) | `App.jsx` → `handleAuthError()` clears the token and shows the login screen on any 401 |
| Logout clears token (supplementary) | `api.js` → `logout()` / `App.jsx` → `handleLogout()` |

## Key questions (from the practical) — short answers

**Why hash passwords instead of storing plain text, even in a lab/demo?**
If the database is ever leaked, copied, or accessed by anyone else, plain-text
passwords hand over every user's real password instantly — and since people
reuse passwords, that breach spreads beyond just this app. bcrypt stores a
salted, one-way hash: even the developer can't recover the original password
from it, and it can't be reversed even if the database is stolen.

**What does the auth middleware actually verify, and what happens without a
token or with an expired one?**
`jwt.verify()` checks that the token was signed with the server's
`JWT_SECRET` (so it wasn't forged or tampered with) and that it hasn't passed
its `exp` (expiry) time. If no token is sent, the middleware returns `401`
immediately without even looking at the token. If it's expired,
`jwt.verify()` throws `TokenExpiredError`, which is caught and turned into a
`401` with a "please log in again" message instead of crashing the server.

**Why validate on the server even though the frontend already validates the
same fields?**
Frontend validation is only a UX convenience — anyone can bypass it entirely
by calling the API directly (Postman, curl, a modified client, or a browser
devtools request). If the server trusted the client, a single crafted request
could insert malformed or malicious data straight into MongoDB. Server-side
validation is the actual security boundary; client-side validation just makes
the common case pleasant.

## Common mistakes this implementation avoids

- Storing plain-text passwords or using reversible encryption instead of bcrypt.
- Forgetting the `Authorization: Bearer <token>` header when testing protected routes.
- Hardcoding `JWT_SECRET` in code instead of reading it from `.env`.
- Letting an invalid/expired token crash the server — `jwt.verify()` is wrapped
  in `try/catch` inside `middleware/auth.js`.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 Unauthorized` on every request | `Authorization` header missing or malformed | Set it as `Authorization: Bearer <token>` exactly, including the space after `Bearer` |
| Server crashes on an invalid token | `jwt.verify()` not wrapped in try/catch | Already handled in `middleware/auth.js` — if you edit it, keep the try/catch |
| Login always fails even with the correct password | Comparing plain password to hash with `===` | Use `bcrypt.compare(plainPassword, hashedPassword)`, already done in `routes/auth.js` |
| `JWT_SECRET is not set` on startup | `.env` missing or not loaded | Copy `.env.example` to `.env`, confirm `dotenv.config()` runs first (it does, at the top of `server.js`), and check the key name matches exactly |
| CORS error in the browser console | `cors` not enabled | Confirm `app.use(cors())` runs before the routes in `server.js` |
| Data disappears after refresh / register-login fails silently | Backend not connected to MongoDB | Check the terminal for "MongoDB connected"; verify `MONGO_URI` |

## GitHub deliverables checklist

- [ ] Same repository as Practical 6, updated with new commits
- [ ] Working register/login flow with JWT-protected task routes
- [ ] `.env` excluded via `.gitignore`; `JWT_SECRET` never committed
- [ ] At least one commit specifically for the authentication implementation
