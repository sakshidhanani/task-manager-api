const jwt = require('jsonwebtoken');

// Verifies the Authorization: Bearer <token> header on every request that
// reaches this middleware, and attaches the decoded payload to req.user.
// Any route mounted after this middleware can assume req.user.id exists.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing. Send "Authorization: Bearer <token>"' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();
  } catch (err) {
    // jwt.verify() throws instead of returning null - MUST be caught,
    // otherwise an invalid/expired token crashes the server (Express 4).
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
