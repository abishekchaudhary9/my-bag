const mongoose = require("mongoose");
const Question = require("../models/questionModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const createHttpError = require("../utils/httpError");
const { emitEvent } = require("../lib/socket");
const notificationService = require("./notificationService");

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

  // Real-time: Notify admins & product room
  emitEvent("admins", "new_question", { 
    id: String(question._id), 
    productName: product.name 
  });
  emitEvent(`product:${productId}`, "new_question", { id: String(question._id) });

  return { message: "Question submitted successfully" };
}

async function updateQuestion(userId, questionId, text, isAdmin = false) {
  const filter = { _id: questionId };
  if (!isAdmin) filter.user = userId;

  const question = await Question.findOneAndUpdate(
    filter,
    { $set: { question_text: text } },
    { new: true }
  );

  if (!question) throw createHttpError(404, "Question not found");

  // Real-time: Notify product room
  emitEvent(`product:${question.product}`, "question_update", { id: questionId });

  return { message: "Question updated successfully" };
}

async function deleteQuestion(userId, questionId, isAdmin = false) {
  const filter = { _id: questionId };
  if (!isAdmin) filter.user = userId;

  const result = await Question.findOneAndDelete(filter);
  if (!result) throw createHttpError(404, "Question not found");

  // Real-time: Notify product room
  emitEvent(`product:${result.product}`, "question_update", { id: questionId });

  return { message: "Question deleted successfully" };
}

async function answerQuestion(questionId, answer) {
  const question = await Question.findOneAndUpdate(
    { _id: questionId },
    { $set: { admin_answer: answer } },
    { new: true }
  ).populate("user").populate("product");

  if (!question) throw createHttpError(404, "Question not found");

  // Determine product ID for real-time event
  const productId = question.product ? question.product._id : null;

  // Notify the user who asked the question
  if (question.user && question.user._id) {
    try {
      const productSlug = question.product ? question.product.slug || '' : '';
      const productName = question.product ? question.product.name : 'product';
      await notificationService.createNotification(
        question.user._id,
        {
          title: "Admin Answer to Your Question",
          message: `Admin answered your question on "${productName}": "${answer.substring(0, 50)}${answer.length > 50 ? '...' : ''}"`,
          link: `/product/${productSlug}`
        }
      );
    } catch (err) {
      console.error("Failed to send user notification for answer:", err);
    }
  }

  // Notify all admins about the answer
  try {
    const admins = await User.find({ role: "admin" });
    const askerName = question.user ? `${question.user.first_name} ${question.user.last_name}`.trim() : "User";
    const productName = question.product ? question.product.name : 'product';
    for (const admin of admins) {
      await notificationService.createNotification(
        admin._id,
        {
          title: "Question Answered",
          message: `Admin answered question by ${askerName} on ${productName}.`,
          link: `/admin?tab=feedback`
        },
        { skipToast: false }
      );
    }
  } catch (err) {
    console.error("Failed to send admin notifications for answer:", err);
  }

  // Real-time: Notify product room
  if (productId) {
    emitEvent(`product:${productId}`, "question_update", { id: questionId });
  }

  return { message: "Answer added successfully" };
}

module.exports = {
  getProductQuestions,
  submitQuestion,
  updateQuestion,
  deleteQuestion,
  answerQuestion
};