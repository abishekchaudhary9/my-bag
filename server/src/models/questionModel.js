const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question_text: { type: String, required: true },
  admin_answer: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Question", questionSchema);
