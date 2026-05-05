const couponService = require("../services/couponService");

async function validateCoupon(req, res) {
  const coupon = await couponService.validateCoupon(req.body.code);
  res.json({ coupon });
}

module.exports = { validateCoupon };
