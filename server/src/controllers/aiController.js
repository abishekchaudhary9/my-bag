const geminiService = require("../services/geminiService");
const Product = require("../models/productModel");

exports.summarize = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const summary = await geminiService.summarizeContent(text);
    res.json({ success: true, summary });
  } catch (err) {
    console.error("AI Summarize Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateDescription = async (req, res) => {
  try {
    const { name, features } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const description = await geminiService.generateProductDescription(name, features || "");
    res.json({ success: true, description });
  } catch (err) {
    console.error("AI Generate Description Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.draftReply = async (req, res) => {
  try {
    const { text, sentiment } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text is required" });
    const reply = await geminiService.draftAdminReply(text, sentiment);
    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI Draft Reply Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await geminiService.analyzeSentiment(text);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("AI Analyze Sentiment Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.chatAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;
    const products = await Product.find({}).select("name category description price");
    const reply = await geminiService.shoppingAssistant(message, products, history || []);
    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI Chat Assistant Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.visualSearch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Image is required" });
    const products = await Product.find({}).select("name category");
    const result = await geminiService.visualSearch(req.file.buffer, req.file.mimetype, products);
    
    const ids = result.match(/[0-9a-fA-F]{24}/g) || [];
    const recommended = await Product.find({ _id: { $in: ids } });
    
    res.json({ success: true, recommended, analysis: result });
  } catch (err) {
    console.error("AI Visual Search Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
