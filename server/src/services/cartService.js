const pool = require("../config/database");
const { emitEvent } = require("../lib/socket");
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

  // Validate stock
  const [prod] = await pool.query("SELECT stock FROM products WHERE id = ?", [productId]);
  if (prod.length === 0) throw createHttpError(404, "Product not found.");
  
  // We should also check current cart qty for this item to ensure total doesn't exceed stock
  const [existing] = await pool.query(
    "SELECT qty FROM cart_items WHERE user_id = ? AND product_id = ? AND color = ? AND size = ?",
    [userId, productId, color, size]
  );
  const currentQty = existing.length > 0 ? existing[0].qty : 0;
  if (prod[0].stock < currentQty + (qty || 1)) {
    throw createHttpError(400, `Cannot add more than ${prod[0].stock} items in total.`);
  }

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, color, size, qty)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
    [userId, productId, color, size, qty || 1]
  );

  // Real-time: Sync cart across user's devices
  emitEvent(`user_${userId}`, "cart_update");

  return { message: "Added to cart" };
}

async function updateItem(userId, itemId, { qty }) {
  if (!qty || qty < 1) {
    throw createHttpError(400, "Quantity must be at least 1.");
  }

  // Validate stock
  const [item] = await pool.query("SELECT product_id FROM cart_items WHERE id = ? AND user_id = ?", [itemId, userId]);
  if (item.length === 0) throw createHttpError(404, "Cart item not found.");

  const [prod] = await pool.query("SELECT stock FROM products WHERE id = ?", [item[0].product_id]);
  if (prod.length > 0 && prod[0].stock < qty) {
    throw createHttpError(400, `Only ${prod[0].stock} items in stock.`);
  }

  await pool.query(
    "UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?",
    [qty, itemId, userId]
  );

  // Real-time: Sync cart across user's devices
  emitEvent(`user_${userId}`, "cart_update");

  return { message: "Cart updated" };
}

async function removeItem(userId, itemId) {
  await pool.query("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [itemId, userId]);
  
  // Real-time: Sync cart across user's devices
  emitEvent(`user_${userId}`, "cart_update");

  return { message: "Removed from cart" };
}

async function clearCart(userId) {
  await pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
  
  // Real-time: Sync cart across user's devices
  emitEvent(`user_${userId}`, "cart_update");

  return { message: "Cart cleared" };
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
