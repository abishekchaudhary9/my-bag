const questionService = require("../services/questionService");
const { success } = require("../utils/responseHandler");

async function listQuestions(req, res) {
  const result = await questionService.getProductQuestions(req.params.productId);
  res.json(success(result, "Product questions retrieved"));
}

async function createQuestion(req, res) {
  const result = await questionService.submitQuestion(req.user.id, req.params.productId, req.body.text);
  res.status(201).json(success(result, "Question created successfully", 201));
}

async function answerQuestion(req, res) {
  const result = await questionService.answerQuestion(req.params.questionId, req.body.answer);
  res.json(success(result, "Answer added to question"));
}

async function updateQuestion(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await questionService.updateQuestion(req.user.id, req.params.questionId, req.body.text, isAdmin);
  res.json(success(result, "Question updated successfully"));
}

async function deleteQuestion(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await questionService.deleteQuestion(req.user.id, req.params.questionId, isAdmin);
  res.json(success(result, "Question deleted successfully"));
}

module.exports = {
  listQuestions,
  createQuestion,
  answerQuestion,
  updateQuestion,
  deleteQuestion,
};
