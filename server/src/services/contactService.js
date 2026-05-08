const pool = require("../config/database");
const createHttpError = require("../utils/httpError");
const { createNotification } = require("./notificationService");

async function createContactMessage({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) {
    throw createHttpError(400, "All fields are required.");
  }

  await pool.query(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name.trim(), email.trim(), subject.trim(), message.trim()]
  );

  // Notify Admins
  const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
  if (admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Customer Message",
        `New inquiry from ${name}: ${subject}`,
        `/admin` // This takes them to the Admin Panel where they can go to the Messages tab
      );
    }
  }

  return { message: "Message sent successfully. We'll respond within 24 hours." };
}

module.exports = { createContactMessage };
