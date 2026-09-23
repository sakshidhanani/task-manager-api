// Server-side input validation. Runs before requests reach the database,
// so malformed data never gets as far as Mongoose/MongoDB — the frontend
// may already validate the same fields, but the server can never trust
// the client, since requests can also come from Postman, curl, etc.

function validateRegister(req, res, next) {
  const { email, password } = req.body;

  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  next();
}

function validateTask(req, res, next) {
  const { title, priority } = req.body;

  // On create, title is mandatory. On update (PUT), allow partial bodies
  // but still reject an explicitly-blank title.
  const isCreate = req.method === 'POST';
  if (isCreate && (!title || !String(title).trim())) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'Priority must be one of: low, medium, high' });
  }
  next();
}

module.exports = { validateRegister, validateLogin, validateTask };
