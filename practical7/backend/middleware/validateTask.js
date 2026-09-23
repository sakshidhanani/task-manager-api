const PRIORITIES = ['low', 'medium', 'high'];

// Runs BEFORE the task controller. Rejects malformed requests early so
// bad data never reaches Mongoose/MongoDB.
function validateCreateTask(req, res, next) {
  const { title, priority } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${PRIORITIES.join(', ')}` });
  }

  next();
}

// PUT allows partial updates, so fields are optional here - but if present,
// they must still be valid.
function validateUpdateTask(req, res, next) {
  const { title, priority, completed } = req.body;

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'Title, if provided, must be a non-empty string' });
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Priority must be one of: ${PRIORITIES.join(', ')}` });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  next();
}

module.exports = { validateCreateTask, validateUpdateTask };
