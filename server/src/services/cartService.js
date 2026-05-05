const pool = require("../config/database");
const createHttpError = require("../utils/httpError");

async function getCart(userId) {
  const [rows] = await pool.query(
    `SELECT ci.id, ci.product_id, ci.color, ci.size, ci.qty,
            p.slug, p.name, p.price
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?`,
    [userId]
  );

  const cart = [];
  for (const row of rows) {
    const [colors] = await pool.query(
      "SELECT image_url FROM product_colors WHERE product_id = ? AND color_name = ? LIMIT 1",
      [row.product_id, row.color]
    );

    cart.push({
      id: row.id,
      productId: String(row.product_id),
      slug: row.slug,
      name: row.name,
      price: parseFloat(row.price),
      image: colors.length > 0 ? colors[0].image_url : "",
      color: row.color,
      size: row.size,
      qty: row.qty,
    });
  }

  return cart;
}

async function addItem(userId, { productId, color, size, qty }) {
  if (!productId || !color || !size) {
    throw createHttpError(400, "productId, color, and size are required.");
  }

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, color, size, qty)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
    [userId, productId, color, size, qty || 1]
  );

  return { message: "Added to cart" };
}

async function updateItem(userId, itemId, { qty }) {
  if (!qty || qty < 1) {
    throw createHttpError(400, "Quantity must be at least 1.");
  }

  await pool.query(
    "UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?",
    [qty, itemId, userId]
  );

  return { message: "Cart updated" };
}

async function removeItem(userId, itemId) {
  await pool.query("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [itemId, userId]);
  return { message: "Removed from cart" };
}

async function clearCart(userId) {
  await pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
  return { message: "Cart cleared" };
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
