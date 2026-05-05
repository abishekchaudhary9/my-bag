const questionService = require("../services/questionService");

async function listQuestions(req, res) {
  const result = await questionService.listQuestions(req.params.productId);
  res.json(result);
}

async function createQuestion(req, res) {
  const result = await questionService.createQuestion(req.user.id, req.params.productId, req.body);
  res.status(201).json(result);
}

async function answerQuestion(req, res) {
  const result = await questionService.answerQuestion(req.user, req.params.questionId, req.body);
  res.json(result);
}

async function updateQuestion(req, res) {
  const result = await questionService.updateQuestion(req.user.id, req.params.questionId, req.body);
  res.json(result);
}

async function deleteQuestion(req, res) {
  const result = await questionService.deleteQuestion(req.user.id, req.params.questionId);
  res.json(result);
}

module.exports = {
  listQuestions,
  createQuestion,
  answerQuestion,
  updateQuestion,
  deleteQuestion,
};
