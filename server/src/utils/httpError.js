function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = statusCode < 500;
  return error;
}

module.exports = createHttpError;
