const express = require('express');
const requestLogger = require('./middleware/logger');
const checkContentType = require('./middleware/checkContentType');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(express.json());

// Global request logging middleware (must run on every request)
app.use(requestLogger);

// Reject POST/PUT requests without a JSON Content-Type header
app.use(checkContentType);

// Mount task routes
app.use('/tasks', taskRoutes);

// 404 handler for undefined routes (after all real routes)
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handling middleware - MUST be defined last
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
