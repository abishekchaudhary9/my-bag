const Notification = require("../models/notificationModel");
const createHttpError = require("../utils/httpError");

async function listNotifications(userId) {
  const notifications = await Notification.find({ user: userId }).sort({ created_at: -1 });
  return { 
    notifications: notifications.map(n => ({
      id: String(n._id),
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.is_read,
      createdAt: n.created_at
    }))
  };
}

async function markAsRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { is_read: true } },
    { new: true }
  );
  
  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }
  
  return { message: "Marked as read" };
}

async function markAllAsRead(userId) {
  await Notification.updateMany(
    { user: userId, is_read: false },
    { $set: { is_read: true } }
  );
  return { message: "All notifications marked as read" };
}

async function deleteNotification(userId, notificationId) {
  const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  if (!result) {
    throw createHttpError(404, "Notification not found");
  }
  return { message: "Notification deleted" };
}

async function clearAllNotifications(userId) {
  await Notification.deleteMany({ user: userId });
  return { message: "All notifications cleared" };
}

async function createNotification(userId, data) {
  const notification = new Notification({
    user: userId,
    title: data.title,
    message: data.message,
    link: data.link
  });
  await notification.save();
  return notification;
}

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification
};
