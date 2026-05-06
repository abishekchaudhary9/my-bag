const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../config/database");
const env = require("../config/env");
const { mapUser } = require("../models/userModel");
const createHttpError = require("../utils/httpError");
const { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } = require("../utils/validation");

const googleClient = new OAuth2Client(env.googleClientId);

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function signup({ email, password, firstName, lastName }) {
  if (!email || !password || !firstName || !lastName) {
    throw createHttpError(400, "All fields are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw createHttpError(400, "Enter a valid email address.");
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw createHttpError(400, "Password must be at least 8 characters and include one uppercase letter and one number.");
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
  if (existing.length > 0) {
    throw createHttpError(409, "An account with this email already exists.");
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, first_name, last_name, role, country) VALUES (?, ?, ?, ?, 'user', ?)",
    [normalizedEmail, hash, firstName.trim(), lastName.trim(), DEFAULT_COUNTRY]
  );

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
  return { user: mapUser(rows[0]), token: signToken(rows[0]) };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw createHttpError(400, "Email and password are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw createHttpError(400, "Enter a valid email address.");
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
  if (rows.length === 0) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw createHttpError(401, "Invalid email or password.");
  }

  return { user: mapUser(user), token: signToken(user) };
}

async function loginWithGoogle({ credential }) {
  if (!env.googleClientId) {
    const error = createHttpError(500, "Google login is not configured.");
    error.expose = true;
    throw error;
  }

  if (!credential) {
    throw createHttpError(400, "Google credential is required.");
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
  } catch {
    throw createHttpError(401, "Google login could not be verified.");
  }
  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.email_verified) {
    throw createHttpError(401, "Google account email could not be verified.");
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);

  if (existing.length > 0) {
    return { user: mapUser(existing[0]), token: signToken(existing[0]) };
  }

  const fallbackName = normalizedEmail.split("@")[0];
  const firstName = payload.given_name || payload.name?.split(" ")[0] || fallbackName;
  const lastName = payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "Customer";
  const hash = await bcrypt.hash(`google:${payload.sub}:${Date.now()}`, 10);

  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, first_name, last_name, role, avatar, country) VALUES (?, ?, ?, ?, 'user', ?, ?)",
    [normalizedEmail, hash, firstName.trim(), lastName.trim(), payload.picture || null, DEFAULT_COUNTRY]
  );

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
  return { user: mapUser(rows[0]), token: signToken(rows[0]) };
}

async function getCurrentUser(userId) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) {
    throw createHttpError(404, "User not found");
  }
  return mapUser(rows[0]);
}

async function updateProfile(userId, profile) {
  const { firstName, lastName, email, phone, street, city, state, zip, country } = profile;
  const formattedPhone = phone ? formatNepalPhone(phone) : phone;

  let normalizedEmail = null;
  if (email) {
    normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      throw createHttpError(400, "Enter a valid email address.");
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? AND id <> ?", [normalizedEmail, userId]);
    if (existing.length > 0) {
      throw createHttpError(409, "An account with this email already exists.");
    }
  }

  if (profile.phone && !isValidNepalPhone(profile.phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }

  await pool.query(
    `UPDATE users SET email = COALESCE(?, email), first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
     phone = COALESCE(?, phone), street = COALESCE(?, street), city = COALESCE(?, city),
     state = COALESCE(?, state), zip = COALESCE(?, zip), country = COALESCE(?, country) WHERE id = ?`,
    [normalizedEmail, firstName, lastName, formattedPhone, street, city, state, zip, country || DEFAULT_COUNTRY, userId]
  );
  return getCurrentUser(userId);
}

async function updatePassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "Both current and new password required.");
  }

  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw createHttpError(400, "Password must be at least 8 characters and include one uppercase letter and one number.");
  }

  const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) {
    throw createHttpError(404, "User not found");
  }

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) {
    throw createHttpError(401, "Current password is incorrect.");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);
  return { message: "Password updated successfully." };
}

module.exports = {
  signup,
  login,
  loginWithGoogle,
  getCurrentUser,
  updateProfile,
  updatePassword,
};
