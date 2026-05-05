const notificationService = require("../services/notificationService");

async function listNotifications(req, res) {
  const notifications = await notificationService.listNotifications(req.user.id);
  res.json({ notifications });
}

async function markNotificationRead(req, res) {
  const result = await notificationService.markNotificationRead(req.user.id, req.params.id);
  res.json(result);
}

async function markAllNotificationsRead(req, res) {
  const result = await notificationService.markAllNotificationsRead(req.user.id);
  res.json(result);
}

async function deleteNotification(req, res) {
  const result = await notificationService.deleteNotification(req.user.id, req.params.id);
  res.json(result);
}

async function clearNotifications(req, res) {
  const result = await notificationService.clearNotifications(req.user.id);
  res.json(result);
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
};
