const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const createHttpError = require("../utils/httpError");

async function getProductReviews(productId) {
  const reviews = await Review.find({ product: productId }).populate("user").sort({ created_at: -1 });
  
  // Calculate average
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  const average = stats.length > 0 ? stats[0].avgRating : 0;
  const count = stats.length > 0 ? stats[0].count : 0;

  return {
    reviews: reviews.map(r => ({
      id: String(r._id),
      userName: r.user ? `${r.user.first_name} ${r.user.last_name}` : "Unknown User",
      userAvatar: r.user?.avatar,
      rating: r.rating,
      title: r.title,
      body: r.body,
      adminReply: r.admin_reply,
      createdAt: r.created_at
    })),
    average: parseFloat(average.toFixed(1)),
    count
  };
}

async function checkReviewEligibility(userId, productId) {
  const product = await Product.findById(productId);
  if (!product) throw createHttpError(404, "Product not found");

  const order = await Order.findOne({
    user: userId,
    "items.product_name": product.name,
    status: "delivered"
  });

  return { 
    eligible: !!order, 
    reason: order ? null : "You can only review products you have purchased and received." 
  };
}

async function submitReview(userId, productId, data) {
  const eligibility = await checkReviewEligibility(userId, productId);
  if (!eligibility.eligible) {
    throw createHttpError(403, eligibility.reason);
  }

  const review = new Review({
    product: productId,
    user: userId,
    rating: data.rating,
    title: data.title,
    body: data.body
  });

  await review.save();

  // Update product stats
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(stats[0].avgRating.toFixed(1)),
      reviews: stats[0].count
    });
  }

  return { message: "Review submitted successfully" };
}

async function updateReview(userId, reviewId, data) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, user: userId },
    { $set: { rating: data.rating, title: data.title, body: data.body } },
    { new: true }
  );

  if (!review) throw createHttpError(404, "Review not found");

  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  await Product.findByIdAndUpdate(review.product, {
    rating: parseFloat(stats[0].avgRating.toFixed(1)),
    reviews: stats[0].count
  });

  return { message: "Review updated successfully" };
}

async function deleteReview(userId, reviewId, isAdmin = false) {
  const filter = { _id: reviewId };
  if (!isAdmin) filter.user = userId;

  const review = await Review.findOneAndDelete(filter);
  if (!review) throw createHttpError(404, "Review not found");

  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(review.product, {
      rating: parseFloat(stats[0].avgRating.toFixed(1)),
      reviews: stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(review.product, { rating: 0, reviews: 0 });
  }

  return { message: "Review deleted successfully" };
}

async function replyToReview(reviewId, reply) {
  const review = await Review.findByIdAndUpdate(reviewId, { admin_reply: reply }, { new: true });
  if (!review) throw createHttpError(404, "Review not found");
  return { message: "Reply added successfully" };
}

module.exports = {
  getProductReviews,
  checkReviewEligibility,
  submitReview,
  updateReview,
  deleteReview,
  replyToReview
};
