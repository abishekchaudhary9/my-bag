const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(notificationController.listNotifications));
router.put("/read-all", authenticate, asyncHandler(notificationController.markAllNotificationsRead));
router.put("/:id/read", authenticate, asyncHandler(notificationController.markNotificationRead));
router.delete("/clear-all", authenticate, asyncHandler(notificationController.clearNotifications));
router.delete("/:id", authenticate, asyncHandler(notificationController.deleteNotification));

module.exports = router;
