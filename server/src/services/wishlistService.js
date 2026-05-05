const pool = require("../config/database");
const createHttpError = require("../utils/httpError");
const { fetchFullProduct } = require("./productService");

async function getWishlist(userId) {
  const [rows] = await pool.query(
    `SELECT p.*
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId]
  );

  const items = await Promise.all(rows.map(fetchFullProduct));

  return { wishlist: items, productIds: rows.map((row) => String(row.id)) };
}

async function toggleWishlistItem(userId, productId) {
  if (!productId) {
    throw createHttpError(400, "productId is required.");
  }

  const [existing] = await pool.query(
    "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );

  if (existing.length === 0) {
    await pool.query("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)", [userId, productId]);
  }
  return { action: "added", message: "Added to wishlist" };
}

async function removeWishlistItem(userId, productId) {
  await pool.query("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, productId]);
  return { message: "Removed from wishlist" };
}

module.exports = {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
};
