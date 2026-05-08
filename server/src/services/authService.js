const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const env = require("../config/env");
const { getFirebaseAuth } = require("../config/firebase");
const { mapUser } = require("../models/userModel");
const createHttpError = require("../utils/httpError");
const { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } = require("../utils/validation");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function firebaseOnlyError() {
  return createHttpError(410, "Password authentication has moved to Firebase.");
}

function parseName(displayName, fallbackFirst = "Maison", fallbackLast = "Customer") {
  const parts = String(displayName || "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: fallbackFirst, lastName: fallbackLast };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || fallbackLast,
  };
}

function phoneProxyEmail(uid) {
  return `phone-${uid}@phone.maison.local`;
}

function isAdminEmail(email) {
  return env.adminEmails.includes(String(email || "").trim().toLowerCase());
}

async function signup() {
  throw firebaseOnlyError();
}

async function login() {
  throw firebaseOnlyError();
}

async function loginWithGoogle() {
  throw firebaseOnlyError();
}

async function loginWithFirebase({ idToken, profile = {} }) {
  if (!idToken) {
    throw createHttpError(400, "Firebase ID token is required.");
  }

  let decoded;
  let firebaseUser;
  try {
    const firebaseAuth = getFirebaseAuth();
    decoded = await firebaseAuth.verifyIdToken(idToken);
    firebaseUser = await firebaseAuth.getUser(decoded.uid);
  } catch (err) {
    console.error("Firebase Verification Error Details:", err);
    throw createHttpError(401, "Firebase sign-in could not be verified.");
  }

  const email = String(decoded.email || firebaseUser.email || "").trim().toLowerCase();
  const dbEmail = email || phoneProxyEmail(decoded.uid);
  const rawPhone = decoded.phone_number || firebaseUser.phoneNumber || profile.phone || "";
  const phone = rawPhone ? formatNepalPhone(rawPhone) : null;
  const avatar = decoded.picture || firebaseUser.photoURL || null;
  const profileName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const firebaseName = decoded.name || firebaseUser.displayName || "";
  const name = parseName(profileName || firebaseName, phone ? "Phone" : "Maison", "Customer");
  const firstName = String(profile.firstName || name.firstName).trim();
  const lastName = String(profile.lastName || name.lastName).trim();
  const role = isAdminEmail(email) ? "admin" : "user";

  if (phone && !isValidNepalPhone(phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }

  let rows = [];
  [rows] = await pool.query("SELECT * FROM users WHERE firebase_uid = ?", [decoded.uid]);

  if (rows.length === 0 && email) {
    [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  }

  if (rows.length === 0 && phone) {
    [rows] = await pool.query("SELECT * FROM users WHERE phone = ?", [phone]);
  }

  if (rows.length > 0) {
    const existing = rows[0];
    const nextEmail = email || existing.email || dbEmail;
    const nextFirstName = firstName || existing.first_name;
    const nextLastName = lastName || existing.last_name;

    const isVerified = decoded.email_verified ? 1 : (existing.email_verified ? 1 : 0);

    await pool.query(
      `UPDATE users
       SET firebase_uid = ?, email = ?, first_name = ?, last_name = ?, role = ?, 
           phone = COALESCE(?, phone), avatar = COALESCE(?, avatar), email_verified = ?,
           street = COALESCE(?, street), city = COALESCE(?, city), state = COALESCE(?, state), 
           zip = COALESCE(?, zip), country = COALESCE(?, country)
       WHERE id = ?`,
      [
        decoded.uid, nextEmail, nextFirstName, nextLastName, role, 
        phone, avatar, isVerified,
        profile.street || null, profile.city || null, profile.state || null,
        profile.zip || null, profile.country || null,
        existing.id
      ]
    );

    const [updatedRows] = await pool.query("SELECT * FROM users WHERE id = ?", [existing.id]);
    const updatedUser = updatedRows[0];
    return { user: mapUser(updatedUser), token: signToken(updatedUser) };
  }

  const [result] = await pool.query(
    `INSERT INTO users (firebase_uid, email, password_hash, first_name, last_name, role, phone, avatar, street, city, state, zip, country, email_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      decoded.uid, dbEmail, `firebase:${decoded.uid}`, firstName, lastName, role, 
      phone, avatar, 
      profile.street || null, profile.city || null, profile.state || null, 
      profile.zip || null, profile.country || null,
      decoded.email_verified ? 1 : 0
    ]
  );

  const [createdRows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
  const createdUser = createdRows[0];
  return { user: mapUser(createdUser), token: signToken(createdUser) };
}

async function findEmailByPhone({ phone }) {
  if (!phone || !isValidNepalPhone(phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }

  const formattedPhone = formatNepalPhone(phone);
  const [rows] = await pool.query("SELECT email FROM users WHERE phone = ? LIMIT 1", [formattedPhone]);
  if (rows.length === 0 || /^phone-[^@]+@phone\.maison\.local$/i.test(rows[0].email)) {
    throw createHttpError(404, "No email account is linked to this phone number.");
  }

  return { email: rows[0].email };
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

  if (String(rows[0].password_hash || "").startsWith("firebase:")) {
    throw createHttpError(400, "Use Firebase to change this password.");
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
  loginWithFirebase,
  findEmailByPhone,
  getCurrentUser,
  updateProfile,
  updatePassword,
};
