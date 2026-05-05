const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/stats", asyncHandler(adminController.getStats));
router.get("/orders", asyncHandler(adminController.listOrders));
router.get("/orders/:orderNumber/details", asyncHandler(adminController.getOrderDetails));
router.put("/orders/:orderNumber", asyncHandler(adminController.updateOrder));
router.get("/customers", asyncHandler(adminController.listCustomers));
router.get("/messages", asyncHandler(adminController.listMessages));
router.get("/feedback", asyncHandler(adminController.getFeedback));

module.exports = router;
