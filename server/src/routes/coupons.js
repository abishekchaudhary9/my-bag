const express = require("express");
const couponController = require("../controllers/couponController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/validate", asyncHandler(couponController.validateCoupon));

module.exports = router;
