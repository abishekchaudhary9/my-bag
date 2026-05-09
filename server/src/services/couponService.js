const pool = require("../config/database");
const createHttpError = require("../utils/httpError");

async function validateCoupon(code) {
  if (!code) {
    throw createHttpError(400, "Coupon code is required.");
  }

  const [rows] = await pool.query(
    "SELECT * FROM coupons WHERE code = ? AND active = 1",
    [code.trim().toUpperCase()]
  );

  if (rows.length === 0) {
    throw createHttpError(404, "Invalid or expired coupon code.");
  }

  return { code: rows[0].code, pct: rows[0].discount_pct };
}

async function listActiveCoupons() {
  const [rows] = await pool.query(
    "SELECT code, discount_pct, description, terms FROM coupons WHERE active = 1 ORDER BY created_at DESC"
  );
  return rows.map(r => ({ 
    code: r.code, 
    pct: r.discount_pct,
    description: r.description || `${r.discount_pct}% discount on all bags`,
    terms: r.terms || "Standard terms apply. Discount valid on full-price items only."
  }));
}

module.exports = { validateCoupon, listActiveCoupons };
