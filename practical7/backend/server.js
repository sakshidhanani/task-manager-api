const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Fail fast and loudly instead of letting every login/token check
// mysteriously fail with "JWT_SECRET is undefined" deep in the stack.
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET.');
  process.exit(1);
}

// ----- Middleware -----

// Allow the React dev server (localhost:5173) to call this API
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware (method, url, timestamp) - applied globally
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ----- Database connection -----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// ----- Routes -----
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Task Manager API is running' });
});

app.use('/auth', authRoutes);

// Every task route requires a valid JWT - auth middleware runs first,
// then validation middleware (applied per-route inside routes/tasks.js),
// then the controller.
app.use('/tasks', authMiddleware, taskRoutes);

// ----- 404 handler for undefined routes -----
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ----- Global error handling middleware (must be last) -----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
