const mongoose = require("mongoose");

const orderCounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);

module.exports = OrderCounter;
