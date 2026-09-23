# Practical 6: Full Stack Integration (React + Node + MongoDB)

Task Manager app wiring a React (Vite) frontend to a Node/Express/MongoDB backend,
built on top of Practicals 1–5.

## Project structure

```
practical6/
├── backend/     Express + Mongoose API (port 5000)
└── frontend/    React + Vite app      (port 5173)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` to either:
- a local MongoDB instance: `mongodb://127.0.0.1:27017/taskmanager`
- or a MongoDB Atlas connection string

Run the server:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API will run at `http://localhost:5000`. Verify it in the browser or Postman:
- `GET http://localhost:5000/tasks` → `[]` (empty array on first run)

## 2. Frontend setup

Open a **second terminal** (the backend must stay running in the first one):

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

## 3. Test the full flow

1. Open `http://localhost:5173` in the browser.
2. Add a task — it appears instantly (optimistic update), then confirms against the server.
3. Toggle its checkbox to mark complete/incomplete.
4. Click **Edit** to change title/description, **Save** to persist via `PUT`.
5. Click **Delete** → confirm in the dialog → task is removed via `DELETE`.
6. **Refresh the browser** — all changes should still be there, proving persistence in MongoDB.
7. Stop the backend server and try creating a task — you should see a red error toast and,
   on the next page load, the error state with a **Retry** button, proving errors are handled
   on every API interaction, not just the initial GET.

## Key integration points implemented

- `backend/server.js` — `app.use(cors())` so the Vite dev server (5173) can call Express (5000).
- `frontend/src/api.js` — single source of truth for the backend base URL and all fetch calls.
- `frontend/src/App.jsx` — after every POST/PUT/DELETE, local state is updated from the
  **server's response**, never assumed; loading and error state are tracked per-operation
  (`creating`, `busyTaskId`) in addition to the initial-load state.
- Optimistic UI: new tasks appear immediately and are rolled back if the `POST` fails.
- Confirmation dialog before delete.
- Toast notifications after every create/update/delete (success or failure).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| CORS error in console | `cors` not enabled on Express | Confirm `app.use(cors())` runs before routes in `server.js` |
| "Failed to fetch" | Backend not running | Start it with `npm run dev` in `backend/` |
| Data disappears after refresh | Backend not connected to MongoDB | Check terminal for "MongoDB connected"; verify `MONGO_URI` |
| Port 5173/5000 already in use | Old process still running | Kill it, or change the port in `vite.config.js` / `.env` |
