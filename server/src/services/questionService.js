const mongoose = require("mongoose");
const Question = require("../models/questionModel");
const Product = require("../models/productModel");
const createHttpError = require("../utils/httpError");

async function getProductQuestions(productId) {
  const questions = await Question.find({ product: productId }).populate("user").sort({ created_at: -1 });
  
  return {
    questions: questions.map(q => ({
      id: String(q._id),
      userName: `${q.user.first_name} ${q.user.last_name}`,
      userAvatar: q.user.avatar,
      text: q.question_text,
      answer: q.admin_answer,
      createdAt: q.created_at
    })),
    count: questions.length
  };
}

async function submitQuestion(userId, productId, text) {
  const product = await Product.findById(productId);
  if (!product) throw createHttpError(404, "Product not found");

  const question = new Question({
    product: productId,
    user: userId,
    question_text: text
  });

  await question.save();
  return { message: "Question submitted successfully" };
}

async function updateQuestion(userId, questionId, text) {
  const question = await Question.findOneAndUpdate(
    { _id: questionId, user: userId },
    { $set: { question_text: text } },
    { new: true }
  );

  if (!question) throw createHttpError(404, "Question not found");
  return { message: "Question updated successfully" };
}

async function deleteQuestion(userId, questionId, isAdmin = false) {
  const filter = { _id: questionId };
  if (!isAdmin) filter.user = userId;

  const result = await Question.findOneAndDelete(filter);
  if (!result) throw createHttpError(404, "Question not found");

  return { message: "Question deleted successfully" };
}

async function answerQuestion(questionId, answer) {
  const question = await Question.findByIdAndUpdate(questionId, { admin_answer: answer }, { new: true });
  if (!question) throw createHttpError(404, "Question not found");
  return { message: "Answer added successfully" };
}

module.exports = {
  getProductQuestions,
  submitQuestion,
  updateQuestion,
  deleteQuestion,
  answerQuestion
};
