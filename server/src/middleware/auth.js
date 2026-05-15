const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { error: errorResponse } = require("../utils/responseHandler");

const JWT_SECRET = env.jwtSecret;

/**
 * Middleware: verifies JWT token from Authorization header.
 * Sets req.user = { id, email, role }
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json(errorResponse("Authentication required. Please provide a valid token", 401));
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json(errorResponse("Token has expired. Please login again", 401));
    }
    return res.status(401).json(errorResponse("Invalid or expired token", 401));
  }
}

/**
 * Middleware: requires admin role (must be used after authenticate).
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json(errorResponse("Authentication required", 401));
  }

  const email = String(req.user?.email || "").toLowerCase();
  const isEmailAllowed = env.adminEmails.includes(email);
  const isRoleAdmin = req.user?.role === "admin";

  if (!isRoleAdmin && !isEmailAllowed) {
    return res.status(403).json(errorResponse("Admin access required. You do not have permission to access this resource", 403));
  }
  next();
}

/**
 * Optional auth: sets req.user if token present, but does not block.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    } catch (err) {
      req.authError = err;
    }
  }
  next();
}

module.exports = { authenticate, requireAdmin, optionalAuth, JWT_SECRET };
