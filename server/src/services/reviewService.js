const pool = require("../config/database");
const { emitEvent } = require("../lib/socket");
const createHttpError = require("../utils/httpError");
const { createNotification } = require("./notificationService");

async function hasDeliveredOrder(userId, productId) {
  const [product] = await pool.query("SELECT name FROM products WHERE id = ?", [productId]);
  if (product.length === 0) {
    return false;
  }

  const [rows] = await pool.query(
    `SELECT o.id FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ? AND o.status = 'delivered' AND oi.product_name = ?
     LIMIT 1`,
    [userId, product[0].name]
  );

  return rows.length > 0;
}

async function updateProductRating(productId) {
  const [stats] = await pool.query(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM product_reviews WHERE product_id = ?",
    [productId]
  );

  await pool.query(
    "UPDATE products SET rating = ?, reviews = ? WHERE id = ?",
    [parseFloat(stats[0].avg_rating || 0).toFixed(1), stats[0].count, productId]
  );
}

async function listReviews(productId) {
  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.body, r.admin_reply, r.created_at, r.user_id,
            u.first_name, u.last_name
     FROM product_reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [productId]
  );

  const formatted = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    text: review.body,
    adminReply: review.admin_reply,
    userId: review.user_id,
    name: `${review.first_name} ${review.last_name[0]}.`,
    date: review.created_at,
  }));

  const avg = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return { reviews: formatted, average: parseFloat(avg), count: reviews.length };
}

async function getReviewEligibility(userId, productId) {
  const [existing] = await pool.query(
    "SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?",
    [productId, userId]
  );

  if (existing.length > 0) {
    return { eligible: false, reason: "already_reviewed" };
  }

  const delivered = await hasDeliveredOrder(userId, productId);
  if (!delivered) {
    return { eligible: false, reason: "no_delivered_order" };
  }

  return { eligible: true, reason: null };
}

async function createReview(userId, productId, { rating, title, body }) {
  if (!rating || !title || !body) {
    throw createHttpError(400, "Rating, title, and review text are required.");
  }

  if (rating < 1 || rating > 5) {
    throw createHttpError(400, "Rating must be between 1 and 5.");
  }

  const [existing] = await pool.query(
    "SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?",
    [productId, userId]
  );
  if (existing.length > 0) {
    throw createHttpError(400, "You have already reviewed this product.");
  }

  const [product] = await pool.query("SELECT id FROM products WHERE id = ?", [productId]);
  if (product.length === 0) {
    throw createHttpError(404, "Product not found.");
  }

  const delivered = await hasDeliveredOrder(userId, productId);
  if (!delivered) {
    throw createHttpError(403, "You can only review products from delivered orders.");
  }

  const [result] = await pool.query(
    "INSERT INTO product_reviews (product_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?)",
    [productId, userId, rating, title, body]
  );
  const reviewId = result.insertId;

  await updateProductRating(productId);

  // Notify Admins
  const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
  const [productInfo] = await pool.query("SELECT name, slug FROM products WHERE id = ?", [productId]);
  
  if (admins.length > 0 && productInfo.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Product Review",
        `A customer left a review for the ${productInfo[0].name}.`,
        `/admin?tab=feedback&type=review&id=${reviewId}`
      );
    }
  }



  // Real-time: Notify product page and admins
  emitEvent(`product:${productId}`, "new_review", { productId });
  emitEvent("admins", "new_review", { productId, productName: productInfo[0].name });

  return { message: "Review submitted successfully." };
}

async function replyToReview(user, reviewId, reply) {
  if (user.role !== "admin") {
    throw createHttpError(403, "Admin only.");
  }

  await pool.query("UPDATE product_reviews SET admin_reply = ? WHERE id = ?", [reply, reviewId]);

  const [reviewData] = await pool.query(
    `SELECT r.user_id, p.slug, p.name
     FROM product_reviews r
     JOIN products p ON r.product_id = p.id
     WHERE r.id = ?`,
    [reviewId]
  );

  if (reviewData.length > 0) {
    await createNotification(
      reviewData[0].user_id,
      "Review Reply",
      `Maison has replied to your review of the ${reviewData[0].name}.`,
      `/product/${reviewData[0].slug}`
    );
  }



  // Real-time: Notify product page
  emitEvent(`product:${reviewData[0].product_id || ""}`, "review_update", { reviewId });

  return { message: "Reply added successfully." };
}

async function updateReview(user, reviewId, { rating, title, body }) {
  if (!rating || !title || !body) {
    throw createHttpError(400, "Rating, title, and review text are required.");
  }

  const [review] = await pool.query(
    "SELECT * FROM product_reviews WHERE id = ?",
    [reviewId]
  );

  if (review.length === 0) {
    throw createHttpError(404, "Review not found.");
  }

  // Allow admin OR owner
  if (user.role !== "admin" && review[0].user_id !== user.id) {
    throw createHttpError(403, "Unauthorized.");
  }

  await pool.query(
    "UPDATE product_reviews SET rating = ?, title = ?, body = ? WHERE id = ?",
    [rating, title, body, reviewId]
  );

  await updateProductRating(review[0].product_id);
  return { message: "Review updated successfully." };
}

async function deleteReview(user, reviewId) {
  const [review] = await pool.query(
    "SELECT * FROM product_reviews WHERE id = ?",
    [reviewId]
  );

  if (review.length === 0) {
    throw createHttpError(404, "Review not found.");
  }

  // Allow admin OR owner
  if (user.role !== "admin" && review[0].user_id !== user.id) {
    throw createHttpError(403, "Unauthorized.");
  }

  await pool.query("DELETE FROM product_reviews WHERE id = ?", [reviewId]);
  await updateProductRating(review[0].product_id);
  return { message: "Review deleted successfully." };
}

module.exports = {
  listReviews,
  getReviewEligibility,
  createReview,
  replyToReview,
  updateReview,
  deleteReview,
  hasDeliveredOrder,
  updateProductRating,
};
