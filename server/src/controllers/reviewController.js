const reviewService = require("../services/reviewService");
const { success } = require("../utils/responseHandler");

async function listReviews(req, res) {
  const result = await reviewService.getProductReviews(req.params.productId);
  res.json(success(result, "Product reviews retrieved"));
}

async function getReviewEligibility(req, res) {
  const result = await reviewService.checkReviewEligibility(req.user.id, req.params.productId);
  res.json(success(result, "Review eligibility checked"));
}

async function createReview(req, res) {
  const result = await reviewService.submitReview(req.user.id, req.params.productId, req.body);
  res.status(201).json(success(result, "Review created successfully", 201));
}

async function replyToReview(req, res) {
  const result = await reviewService.replyToReview(req.params.reviewId, req.body.reply);
  res.json(success(result, "Reply added to review"));
}

async function updateReview(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await reviewService.updateReview(req.user.id, req.params.reviewId, req.body, isAdmin);
  res.json(success(result, "Review updated successfully"));
}

async function deleteReview(req, res) {
  const isAdmin = req.user.role === 'admin';
  const result = await reviewService.deleteReview(req.user.id, req.params.reviewId, isAdmin);
  res.json(success(result, "Review deleted successfully"));
}

module.exports = {
  listReviews,
  getReviewEligibility,
  createReview,
  replyToReview,
  updateReview,
  deleteReview,
};