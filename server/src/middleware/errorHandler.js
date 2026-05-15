const { error: errorResponse } = require("../utils/responseHandler");

function notFound(req, res) {
  res.status(404).json(errorResponse("Route not found", 404));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || (err.name === "MulterError" ? 400 : 500);

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  const message = statusCode >= 500 && !err.expose ? "Server error" : err.message;
  res.status(statusCode).json(errorResponse(message, statusCode, err.expose ? null : undefined));
}

module.exports = { notFound, errorHandler };
