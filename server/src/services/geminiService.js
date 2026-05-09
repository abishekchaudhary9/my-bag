const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const summarizeContent = async (text) => {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `Summarize the following e-commerce product feedback or information concisely in a professional and helpful tone. Focus on key points and sentiment:\n\n${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

const smartSearch = async (query, context) => {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `Act as an intelligent shopping assistant. Given the search query "${query}" and the available product categories/tags [${context}], suggest the most relevant categories or search refinements. Keep it very brief:\n\n`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

module.exports = {
  summarizeContent,
  smartSearch
};
