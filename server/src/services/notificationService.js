const pool = require("../config/database");
const { emitEvent } = require("../lib/socket");

async function createNotification(userId, title, message, link) {
  await pool.query(
    "INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)",
    [userId, title, message, link]
  );

  // Real-time: Notify the user
  emitEvent(`user_${userId}`, "notification", { title, message, link });
}

async function listNotifications(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
  return rows;
}

async function markNotificationRead(userId, notificationId) {
  await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [notificationId, userId]
  );
  return { message: "Notification marked as read" };
}

async function markAllNotificationsRead(userId) {
  await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId]
  );
  return { message: "All notifications marked as read" };
}

async function deleteNotification(userId, notificationId) {
  await pool.query(
    "DELETE FROM notifications WHERE id = ? AND user_id = ?",
    [notificationId, userId]
  );
  return { message: "Notification deleted" };
}

async function clearNotifications(userId) {
  await pool.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
  return { message: "All notifications deleted" };
}

module.exports = {
  createNotification,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
};
