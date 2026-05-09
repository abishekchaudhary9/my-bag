const Coupon = require("../models/couponModel");
const createHttpError = require("../utils/httpError");

async function validateCoupon(code) {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });
  
  if (!coupon) {
    throw createHttpError(404, "Invalid or expired coupon code.");
  }
  
  return { 
    coupon: { 
      code: coupon.code, 
      pct: coupon.discount_pct 
    } 
  };
}

async function listCoupons() {
  const coupons = await Coupon.find({ active: true }).select("code discount_pct description terms");
  return { 
    coupons: coupons.map(c => ({
      code: c.code,
      pct: c.discount_pct,
      description: c.description,
      terms: c.terms
    }))
  };
}

module.exports = {
  validateCoupon,
  listCoupons
};
