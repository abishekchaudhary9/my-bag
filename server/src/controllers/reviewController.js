const reviewService = require("../services/reviewService");

async function listReviews(req, res) {
  const result = await reviewService.listReviews(req.params.productId);
  res.json(result);
}

async function getReviewEligibility(req, res) {
  const result = await reviewService.getReviewEligibility(req.user.id, req.params.productId);
  res.json(result);
}

async function createReview(req, res) {
  const result = await reviewService.createReview(req.user.id, req.params.productId, req.body);
  res.status(201).json(result);
}

async function replyToReview(req, res) {
  const result = await reviewService.replyToReview(req.user, req.params.reviewId, req.body.reply);
  res.json(result);
}

async function updateReview(req, res) {
  const result = await reviewService.updateReview(req.user.id, req.params.reviewId, req.body);
  res.json(result);
}

async function deleteReview(req, res) {
  const result = await reviewService.deleteReview(req.user.id, req.params.reviewId);
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
