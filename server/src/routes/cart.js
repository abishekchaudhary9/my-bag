const express = require("express");
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(cartController.getCart));
router.post("/", authenticate, asyncHandler(cartController.addItem));
router.put("/:id", authenticate, asyncHandler(cartController.updateItem));
router.delete("/:id", authenticate, asyncHandler(cartController.removeItem));
router.delete("/", authenticate, asyncHandler(cartController.clearCart));

module.exports = router;
