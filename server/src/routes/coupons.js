const express = require("express");
const couponController = require("../controllers/couponController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/validate", asyncHandler(couponController.validateCoupon));
router.get("/", asyncHandler(couponController.listActiveCoupons));

module.exports = router;
