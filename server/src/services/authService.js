const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const env = require("../config/env");
const { mapUser } = require("../models/userModel");
const createHttpError = require("../utils/httpError");

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
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
  if (existing.length > 0) {
    throw createHttpError(409, "An account with this email already exists.");
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, 'user')",
    [normalizedEmail, hash, firstName.trim(), lastName.trim()]
  );

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
  return { user: mapUser(rows[0]), token: signToken(rows[0]) };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw createHttpError(400, "Email and password are required.");
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
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

async function getCurrentUser(userId) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
  if (rows.length === 0) {
    throw createHttpError(404, "User not found");
  }
  return mapUser(rows[0]);
}

async function updateProfile(userId, profile) {
  const { firstName, lastName, phone, street, city, state, zip, country } = profile;
  await pool.query(
    `UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name),
     phone = COALESCE(?, phone), street = COALESCE(?, street), city = COALESCE(?, city),
     state = COALESCE(?, state), zip = COALESCE(?, zip), country = COALESCE(?, country) WHERE id = ?`,
    [firstName, lastName, phone, street, city, state, zip, country, userId]
  );
  return getCurrentUser(userId);
}

async function updatePassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "Both current and new password required.");
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
  getCurrentUser,
  updateProfile,
  updatePassword,
};
