const notificationService = require("../services/notificationService");
const { success } = require("../utils/responseHandler");

async function listNotifications(req, res) {
  const notifications = await notificationService.listNotifications(req.user.id);
  res.json(success({ notifications }, "Notifications retrieved"));
}

async function markNotificationRead(req, res) {
  const result = await notificationService.markAsRead(req.user.id, req.params.id);
  res.json(success(result, "Notification marked as read"));
}

async function markAllNotificationsRead(req, res) {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.json(success(result, "All notifications marked as read"));
}

async function deleteNotification(req, res) {
  const result = await notificationService.deleteNotification(req.user.id, req.params.id);
  res.json(success(result, "Notification deleted"));
}

async function clearNotifications(req, res) {
  const result = await notificationService.clearAllNotifications(req.user.id);
  res.json(success(result, "All notifications cleared"));
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
};
