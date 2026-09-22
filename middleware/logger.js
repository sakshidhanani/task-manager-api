// Logs method, URL, and timestamp for every incoming request
function requestLogger(req, res, next) {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // MUST call next(), or the request will hang forever
}

module.exports = requestLogger;
