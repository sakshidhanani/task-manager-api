// Supplementary Problem: route-specific middleware that validates
// the task ID format before it reaches the controller.
// Here we require the id to be a positive integer.
function validateTaskId(req, res, next) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid task ID format. ID must be a number.' });
  }
  next();
}

module.exports = validateTaskId;
