const couponService = require("../services/couponService");

async function validateCoupon(req, res) {
  const coupon = await couponService.validateCoupon(req.body.code);
  res.json({ coupon });
}

async function listActiveCoupons(req, res) {
  const coupons = await couponService.listActiveCoupons();
  res.json({ coupons });
}

module.exports = { validateCoupon, listActiveCoupons };
