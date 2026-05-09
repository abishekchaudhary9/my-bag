const pool = require("../config/database");
const { mapOrder } = require("../models/orderModel");
const { emitEvent } = require("../lib/socket");
const createHttpError = require("../utils/httpError");
const { createNotification } = require("./notificationService");
const { sendEmail } = require("../utils/mailer");
const { orderConfirmationTemplate } = require("../utils/emailTemplates");
const { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } = require("../utils/validation");

async function createOrder(user, data) {
  if (user.role === "admin") {
    throw createHttpError(403, "Admin accounts cannot place orders.");
  }

  const { items, subtotal, shipping, discount, total, shippingInfo, paymentMethod } = data;
  if (!items || items.length === 0) {
    throw createHttpError(400, "Order must have at least one item.");
  }

  if (!shippingInfo?.firstName || !shippingInfo?.lastName || !shippingInfo?.email || !shippingInfo?.phone || !shippingInfo?.street || !shippingInfo?.city) {
    throw createHttpError(400, "Complete shipping information is required.");
  }

  if (!isValidEmail(shippingInfo.email)) {
    throw createHttpError(400, "Enter a valid shipping email address.");
  }

  if (!isValidNepalPhone(shippingInfo.phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }

  const shippingPhone = formatNepalPhone(shippingInfo.phone);

  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

  // Validate stock for all items
  for (const item of items) {
    const [prod] = await pool.query("SELECT name, stock FROM products WHERE name = ?", [item.name]);
    if (prod.length === 0) throw createHttpError(404, `Product ${item.name} not found.`);
    if (prod[0].stock < item.qty) {
      throw createHttpError(400, `Not enough stock for ${item.name}. Only ${prod[0].stock} remaining.`);
    }
  }

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
      shippingPhone,
      shippingInfo?.street,
      shippingInfo?.city,
      shippingInfo?.state,
      shippingInfo?.zip,
      shippingInfo?.country || DEFAULT_COUNTRY,
    ]
  );

  for (const item of items) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_name, color, size, qty, price, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [result.insertId, item.name, item.color, item.size, item.qty, item.price, item.image || null]
    );

    // Deduct stock
    const [prodRows] = await pool.query("SELECT id, stock FROM products WHERE name = ?", [item.name]);
    if (prodRows.length > 0) {
      const newStock = Math.max(0, prodRows[0].stock - item.qty);
      await pool.query("UPDATE products SET stock = ? WHERE id = ?", [newStock, prodRows[0].id]);
      
      // Real-time: Notify product page of stock change
      emitEvent(`product:${prodRows[0].id}`, "stock_update", { productId: prodRows[0].id, stock: newStock });
    }
  }

  await pool.query("DELETE FROM cart_items WHERE user_id = ?", [user.id]);
  
  // Real-time: Sync cart across user's devices (clear it)
  emitEvent(`user_${user.id}`, "cart_update");

  // Notify Customer
  await createNotification(
    user.id,
    "Order Confirmed",
    `Thank you for your order! Your order #${orderNumber} is now being processed.`,
    `/orders`
  );

  // Send Order Confirmation Email
  if (shippingInfo.email && !shippingInfo.email.includes("phone.maison.local")) {
    sendEmail({
      to: shippingInfo.email,
      subject: `Order Confirmation: #${orderNumber}`,
      html: orderConfirmationTemplate({
        name: shippingInfo.firstName,
        orderNumber,
        items,
        subtotal,
        shipping: shipping || 0,
        discount: discount || 0,
        total,
        address: `${shippingInfo.street}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}, ${shippingInfo.country || DEFAULT_COUNTRY}`
      })
    }).catch(err => console.error("Order Confirmation Email Failed:", err));
  }

  // Notify Admins
  const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
  if (admins.length > 0) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Order Received",
        `A new order #${orderNumber} has been placed by ${shippingInfo.firstName} ${shippingInfo.lastName}.`,
        `/admin?tab=orders&id=${orderNumber}`
      );
    }
  }

  emitEvent("admins", "new_order", { orderId: result.insertId, orderNumber });

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
