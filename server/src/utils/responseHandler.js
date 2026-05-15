/**
 * Standardized Response Handler for consistent API responses
 */

function success(data, message = "Success", statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

function error(message, statusCode = 500, details = null) {
  return {
    success: false,
    statusCode,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  };
}

module.exports = { success, error };
