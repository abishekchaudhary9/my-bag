const pool = require("../config/database");
const { mapOrder } = require("../models/orderModel");
const createHttpError = require("../utils/httpError");

async function createOrder(user, data) {
  if (user.role === "admin") {
    throw createHttpError(403, "Admin accounts cannot place orders.");
  }

  const { items, subtotal, shipping, discount, total, shippingInfo, paymentMethod } = data;
  if (!items || items.length === 0) {
    throw createHttpError(400, "Order must have at least one item.");
  }

  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
  const [result] = await pool.query(
    `INSERT INTO orders (order_number, user_id, status, subtotal, shipping, discount, total, payment_method,
      shipping_first_name, shipping_last_name, shipping_email, shipping_phone,
      shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country)
     VALUES (?, ?, 'processing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderNumber,
      user.id,
      subtotal,
      shipping || 0,
      discount || 0,
      total,
      paymentMethod || "card",
      shippingInfo?.firstName,
      shippingInfo?.lastName,
      shippingInfo?.email,
      shippingInfo?.phone,
      shippingInfo?.street,
      shippingInfo?.city,
      shippingInfo?.state,
      shippingInfo?.zip,
      shippingInfo?.country,
    ]
  );

  for (const item of items) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_name, color, size, qty, price, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.insertId, item.name, item.color, item.size, item.qty, item.price, item.image || null]
    );
  }

  await pool.query("DELETE FROM cart_items WHERE user_id = ?", [user.id]);

  return {
    id: orderNumber,
    date: new Date().toISOString().split("T")[0],
    status: "processing",
    items,
    subtotal,
    shipping: shipping || 0,
    discount: discount || 0,
    total,
  };
}

async function listUserOrders(userId) {
  const [orders] = await pool.query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  const result = [];
  for (const order of orders) {
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    result.push(mapOrder(order, items));
  }
  return result;
}

async function getUserOrder(orderNumber, userId) {
  const [orders] = await pool.query(
    "SELECT * FROM orders WHERE order_number = ? AND user_id = ?",
    [orderNumber, userId]
  );

  if (orders.length === 0) {
    throw createHttpError(404, "Order not found");
  }

  const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [orders[0].id]);
  return mapOrder(orders[0], items);
}

module.exports = {
  createOrder,
  listUserOrders,
  getUserOrder,
};
