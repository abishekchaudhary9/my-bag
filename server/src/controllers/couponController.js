const couponService = require("../services/couponService");
const { success } = require("../utils/responseHandler");

async function validateCoupon(req, res) {
  const coupon = await couponService.validateCoupon(req.body.code);
  res.json(success({ coupon }, "Coupon validated"));
}

async function listActiveCoupons(req, res) {
  const coupons = await couponService.listCoupons();
  res.json(success({ coupons }, "Active coupons retrieved"));
}

module.exports = { validateCoupon, listActiveCoupons };
