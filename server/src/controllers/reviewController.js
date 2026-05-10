const reviewService = require("../services/reviewService");

async function listReviews(req, res) {
  const result = await reviewService.getProductReviews(req.params.productId);
  res.json(result);
}

async function getReviewEligibility(req, res) {
  const result = await reviewService.checkReviewEligibility(req.user.id, req.params.productId);
  res.json(result);
}

async function createReview(req, res) {
  const result = await reviewService.submitReview(req.user.id, req.params.productId, req.body);
  res.status(201).json(result);
}

async function replyToReview(req, res) {
  const result = await reviewService.replyToReview(req.params.reviewId, req.body.reply);
  res.json(result);
}

async function updateReview(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await reviewService.updateReview(req.user.id, req.params.reviewId, req.body, isAdmin);
  res.json(result);
}

async function deleteReview(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await reviewService.deleteReview(req.user.id, req.params.reviewId, isAdmin);
  res.json(result);
}

module.exports = {
  listReviews,
  getReviewEligibility,
  createReview,
  replyToReview,
  updateReview,
  deleteReview,
};