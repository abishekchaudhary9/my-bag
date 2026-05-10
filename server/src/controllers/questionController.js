const questionService = require("../services/questionService");

async function listQuestions(req, res) {
  const result = await questionService.getProductQuestions(req.params.productId);
  res.json(result);
}

async function createQuestion(req, res) {
  const result = await questionService.submitQuestion(req.user.id, req.params.productId, req.body.text);
  res.status(201).json(result);
}

async function answerQuestion(req, res) {
  const result = await questionService.answerQuestion(req.params.questionId, req.body.answer);
  res.json(result);
}

async function updateQuestion(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await questionService.updateQuestion(req.user.id, req.params.questionId, req.body.text, isAdmin);
  res.json(result);
}

async function deleteQuestion(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await questionService.deleteQuestion(req.user.id, req.params.questionId, isAdmin);
  res.json(result);
}

module.exports = {
  listQuestions,
  createQuestion,
  answerQuestion,
  updateQuestion,
  deleteQuestion,
};
