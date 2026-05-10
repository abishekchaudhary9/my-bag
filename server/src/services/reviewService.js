const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const createHttpError = require("../utils/httpError");
const { emitEvent } = require("../lib/socket");
const notificationService = require("./notificationService");

async function getProductReviews(productId) {
  const reviews = await Review.find({ product: productId }).populate("user").sort({ created_at: -1 });
  
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

  // Real-time: Notify admins & product room
  emitEvent("admins", "new_review", { 
    id: String(review._id), 
    productName: data.title 
  });
  emitEvent(`product:${productId}`, "new_review", { id: String(review._id) });

  return { message: "Review submitted successfully" };
}

async function updateReview(userId, reviewId, data, isAdmin = false) {
  const filter = isAdmin ? { _id: reviewId } : { _id: reviewId, user: userId };
  const review = await Review.findOneAndUpdate(
    filter,
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

  // Real-time: Notify product room
  emitEvent(`product:${review.product}`, "review_update", { id: reviewId });

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

  // Real-time: Notify product room
  emitEvent(`product:${review.product}`, "review_update", { id: reviewId });

  return { message: "Review deleted successfully" };
}

async function replyToReview(reviewId, reply) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId },
    { $set: { admin_reply: reply } },
    { new: true }
  ).populate("user").populate("product");

  if (!review) throw createHttpError(404, "Review not found");

  // Determine product ID for real-time event
  const productId = review.product ? review.product._id : null;

  // Notify the review author
  if (review.user && review.user._id) {
    try {
      const productSlug = review.product ? review.product.slug || '' : '';
      const productName = review.product ? review.product.name : 'product';
      await notificationService.createNotification(
        review.user._id,
        {
          title: "Admin Reply to Your Review",
          message: `Admin replied to your review on "${productName}": "${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}"`,
          link: `/product/${productSlug}`
        }
      );
    } catch (err) {
      console.error("Failed to send user notification for review reply:", err);
    }
  }

  // Notify all admins about the reply
  try {
    const admins = await User.find({ role: "admin" });
    const reviewerName = review.user ? `${review.user.first_name} ${review.user.last_name}`.trim() : "User";
    const productName = review.product ? review.product.name : 'product';
    for (const admin of admins) {
      await notificationService.createNotification(
        admin._id,
        {
          title: "Review Reply Added",
          message: `Admin replied to review by ${reviewerName} on ${productName}.`,
          link: `/admin?tab=feedback`
        },
        { skipToast: false }
      );
    }
  } catch (err) {
    console.error("Failed to send admin notifications for review reply:", err);
  }

  // Real-time: Notify product room
  if (productId) {
    emitEvent(`product:${productId}`, "review_update", { id: reviewId });
  }

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