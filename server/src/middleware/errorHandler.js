function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || (err.name === "MulterError" ? 400 : 500);

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    error: statusCode >= 500 && !err.expose ? "Server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
