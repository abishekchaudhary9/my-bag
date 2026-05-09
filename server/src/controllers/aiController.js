const geminiService = require("../services/geminiService");

exports.summarize = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const summary = await geminiService.summarizeContent(text);
    res.json({ success: true, summary });
  } catch (err) {
    console.error("Gemini Summarize Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to summarize" });
  }
};

exports.searchAssistant = async (req, res) => {
  try {
    const { query, categories } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const suggestions = await geminiService.smartSearch(query, categories || []);
    res.json({ success: true, suggestions });
  } catch (err) {
    console.error("Gemini Search Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to get suggestions" });
  }
};
