const express = require("express");
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", authenticate, asyncHandler(orderController.createOrder));
router.get("/", authenticate, asyncHandler(orderController.listOrders));
router.get("/:orderNumber", authenticate, asyncHandler(orderController.getOrder));

module.exports = router;
