const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 }
});

// Compound index for uniqueness
cartItemSchema.index({ user: 1, product: 1, color: 1, size: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", cartItemSchema);
