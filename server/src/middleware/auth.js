const jwt = require("jsonwebtoken");
const env = require("../config/env");

const JWT_SECRET = env.jwtSecret;

/**
 * Middleware: verifies JWT token from Authorization header.
 * Sets req.user = { id, email, role }
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: requires admin role (must be used after authenticate).
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
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
