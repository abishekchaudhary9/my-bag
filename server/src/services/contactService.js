const pool = require("../config/database");
const createHttpError = require("../utils/httpError");

async function createContactMessage({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) {
    throw createHttpError(400, "All fields are required.");
  }

  await pool.query(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name.trim(), email.trim(), subject.trim(), message.trim()]
  );

  return { message: "Message sent successfully. We'll respond within 24 hours." };
}

module.exports = { createContactMessage };
