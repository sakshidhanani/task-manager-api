# Task Manager API (Practical 4)

A RESTful backend built with Node.js and Express, implementing full CRUD
for a simple in-memory task list, with a logging middleware and a
centralized global error handler.

## Project structure

```
task-manager-api/
├── server.js                    # App entry point, mounts middleware + routes
├── package.json
├── data/
│   └── tasks.js                 # In-memory "database" (array of tasks)
├── controllers/
│   └── taskController.js        # CRUD logic (getAllTasks, createTask, etc.)
├── middleware/
│   ├── logger.js                # Logs method, URL, timestamp for every request
│   ├── checkContentType.js      # Rejects POST/PUT without JSON content-type
│   └── validateTaskId.js        # Validates :id param format before controller
└── routes/
    └── taskRoutes.js             # Wires /tasks routes to controllers
```

## How to run it

1. Install Node.js v18+ if you don't already have it.
2. Unzip this project and open a terminal in the `task-manager-api` folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
   You should see:
   ```
   Server running on port 5000
   ```
5. (Optional) For auto-restart on file changes during development:
   ```
   npm run dev
   ```
   (requires the `nodemon` dev dependency, already installed by step 3)

## Testing the endpoints

Use Postman, Thunder Client (VS Code extension), or `curl`. Base URL:
`http://localhost:5000`

| Method | Endpoint      | Body (JSON)                              | Description           |
|--------|---------------|-------------------------------------------|------------------------|
| GET    | /tasks        | -                                          | List all tasks        |
| GET    | /tasks/:id    | -                                          | Get a single task     |
| POST   | /tasks        | `{ "title": "Buy milk" }`                 | Create a task (201)   |
| PUT    | /tasks/:id    | `{ "title": "Buy milk", "completed": true }` | Update a task     |
| DELETE | /tasks/:id    | -                                          | Delete a task          |

Example curl commands:
```bash
# Get all tasks
curl http://localhost:5000/tasks

# Create a task (note the required Content-Type header)
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write lab report"}'

# Update a task
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a task
curl -X DELETE http://localhost:5000/tasks/1

# Hit an undefined route to see the 404 handler
curl http://localhost:5000/nope

# Send a POST with no Content-Type header to see the 400 check
curl -X POST http://localhost:5000/tasks -d '{"title":"test"}'
```

## What each middleware does (per the practical's key questions)

- **`requestLogger`** — applied globally with `app.use()`, runs on *every*
  request regardless of path or method, logging it before it reaches any
  route.
- **`checkContentType`** — also global, but only acts on POST/PUT, rejecting
  requests that don't declare `Content-Type: application/json` (Supplementary
  Problem 1).
- **`validateTaskId`** — a *route-specific* middleware, only attached to
  routes with an `:id` param (`GET/PUT/DELETE /tasks/:id`), so it doesn't run
  for `GET /tasks` or `POST /tasks` (Supplementary Problem 2).
- **404 handler** — sits after all real routes; if nothing above matched the
  request, this catches it and returns a structured JSON error (Supplementary
  Problem 3).
- **Global error handler** — defined *last*, with 4 parameters
  (`err, req, res, next`), which is how Express recognizes it as an error
  handler. It must be last because Express runs middleware in the order
  they're registered, and an error only reaches this handler when a prior
  middleware calls `next(err)` or throws inside an async/sync block Express
  can catch. If it were placed earlier, thrown errors from later routes would
  never reach it.

## Common mistakes to avoid (from the lab guide)

- Forgetting `next()` in custom middleware — the request will hang forever.
- Placing the error handler before the routes — it will never fire.
- Forgetting `app.use(express.json())` — `req.body` will be `undefined`.
- Returning different JSON shapes from different endpoints — keep error
  responses consistent (`{ error: "..." }` everywhere here).
