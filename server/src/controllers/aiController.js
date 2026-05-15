const geminiService = require("../services/geminiService");
const Product = require("../models/productModel");
const { success, error } = require("../utils/responseHandler");

exports.summarize = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json(error("Text is required", 400));
    const summary = await geminiService.summarizeContent(text);
    res.json(success({ summary }, "Content summarized successfully"));
  } catch (err) {
    console.error("AI Summarize Error:", err);
    res.status(500).json(error(err.message, 500));
  }
};

exports.generateDescription = async (req, res) => {
  try {
    const { name, features } = req.body;
    if (!name) return res.status(400).json(error("Name is required", 400));
    const description = await geminiService.generateProductDescription(name, features || "");
    res.json(success({ description }, "Product description generated successfully"));
  } catch (err) {
    console.error("AI Generate Description Error:", err);
    res.status(500).json(error(err.message, 500));
  }
};

exports.draftReply = async (req, res) => {
  try {
    const { text, sentiment } = req.body;
    if (!text) return res.status(400).json(error("Text is required", 400));
    const reply = await geminiService.draftAdminReply(text, sentiment);
    res.json(success({ reply }, "Reply drafted successfully"));
  } catch (err) {
    console.error("AI Draft Reply Error:", err);
    res.status(500).json(error(err.message, 500));
  }
};

exports.analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await geminiService.analyzeSentiment(text);
    res.json(success(result, "Sentiment analyzed successfully"));
  } catch (err) {
    console.error("AI Analyze Sentiment Error:", err);
    res.status(500).json(error(err.message, 500));
  }
};

exports.chatAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;
    const products = await Product.find({}).select("name category description price");
    const reply = await geminiService.shoppingAssistant(message, products, history || []);
    res.json(success({ reply }, "Assistant response generated"));
  } catch (err) {
    console.error("AI Chat Assistant Error:", err);
    res.status(500).json(error(err.message, 500));
  }
};

exports.visualSearch = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json(error("Image is required", 400));
    const products = await Product.find({}).select("name category");
    const result = await geminiService.visualSearch(req.file.buffer, req.file.mimetype, products);
    
    const ids = result.match(/[0-9a-fA-F]{24}/g) || [];
    const recommended = await Product.find({ _id: { $in: ids } });
    
    res.json(success({ recommended, analysis: result }, "Visual search completed"));
  } catch (err) {
    console.error("AI Visual Search Error:", err);
    res.status(500).json(error(err.message, 500));
  }
};
