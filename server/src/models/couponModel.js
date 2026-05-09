const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount_pct: { type: Number, required: true },
  description: { type: String },
  terms: { type: String },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Coupon", couponSchema);
