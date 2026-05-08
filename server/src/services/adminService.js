const pool = require("../config/database");
const { ORDER_STATUSES } = require("../models/orderStatus");
const createHttpError = require("../utils/httpError");

async function getStats() {
  const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders");
  const [[{ totalOrders }]] = await pool.query("SELECT COUNT(*) AS totalOrders FROM orders");
  const [[{ totalCustomers }]] = await pool.query("SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'user'");
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    revenue: parseFloat(totalRevenue) || 0,
    orders: totalOrders || 0,
    customers: totalCustomers || 0,
    avgOrder: Math.round(avgOrder * 100) / 100 || 0,
  };
}

async function listOrders(status) {
  let sql = `SELECT o.*, u.first_name, u.last_name, u.email, u.phone,
                    u.street, u.city, u.state, u.zip, u.country
             FROM orders o JOIN users u ON o.user_id = u.id`;
  const params = [];

  if (status) {
    sql += " WHERE o.status = ?";
    params.push(status);
  }
  sql += " ORDER BY o.created_at DESC";

  const [orders] = await pool.query(sql, params);
  const result = [];
  for (const order of orders) {
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    result.push({
      id: order.order_number,
      customer: `${order.first_name} ${order.last_name.charAt(0)}.`,
      customerEmail: order.email,
      customerPhone: order.shipping_phone || order.phone || "",
      customerAddress: [order.shipping_street, order.shipping_city, order.shipping_state, order.shipping_zip, order.shipping_country]
        .filter(Boolean).join(", ") || [order.street, order.city, order.state, order.zip, order.country].filter(Boolean).join(", "),
      items: items.length,
      total: `Rs ${parseFloat(order.total).toFixed(2)}`,
      status: order.status,
      date: new Date(order.created_at).toISOString().split("T")[0],
      trackingNumber: order.tracking_number,
    });
  }

  return result;
}

function formatAddress(row, prefix) {
  const street = row[`${prefix}_street`];
  const city = row[`${prefix}_city`];
  const state = row[`${prefix}_state`];
  const zip = row[`${prefix}_zip`];
  const country = row[`${prefix}_country`];

  return {
    street,
    city,
    state,
    zip,
    country,
    formatted: [street, city, state, zip, country].filter(Boolean).join(", "),
  };
}

async function getOrderDetails(orderNumber) {
  const [orders] = await pool.query(
    `SELECT o.*,
            u.id AS customer_id,
            u.email AS customer_email,
            u.first_name AS customer_first_name,
            u.last_name AS customer_last_name,
            u.role AS customer_role,
            u.phone AS customer_phone,
            u.avatar AS customer_avatar,
            u.street AS customer_street,
            u.city AS customer_city,
            u.state AS customer_state,
            u.zip AS customer_zip,
            u.country AS customer_country,
            u.created_at AS customer_created_at
     FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.order_number = ?
     LIMIT 1`,
    [orderNumber]
  );

  if (orders.length === 0) {
    throw createHttpError(404, "Order not found");
  }

  const order = orders[0];
  const [items] = await pool.query(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
    [order.id]
  );
  const [[stats]] = await pool.query(
    "SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total), 0) AS totalSpent, MAX(created_at) AS lastOrderDate FROM orders WHERE user_id = ?",
    [order.user_id]
  );

  return {
    id: order.order_number,
    internalId: order.id,
    date: new Date(order.created_at).toISOString().split("T")[0],
    createdAt: new Date(order.created_at),
    status: order.status,
    trackingNumber: order.tracking_number || "",
    paymentMethod: order.payment_method || "card",
    subtotal: parseFloat(order.subtotal),
    shipping: parseFloat(order.shipping),
    discount: parseFloat(order.discount),
    total: parseFloat(order.total),
    customer: {
      id: String(order.customer_id),
      name: `${order.customer_first_name} ${order.customer_last_name}`,
      firstName: order.customer_first_name,
      lastName: order.customer_last_name,
      email: order.customer_email,
      phone: order.customer_phone || "",
      role: order.customer_role,
      avatar: order.customer_avatar || "",
      joined: order.customer_created_at,
      registeredAddress: formatAddress(order, "customer"),
      stats: {
        totalOrders: stats.totalOrders,
        totalSpent: parseFloat(stats.totalSpent),
        lastOrderDate: stats.lastOrderDate,
      },
    },
    shippingContact: {
      firstName: order.shipping_first_name || "",
      lastName: order.shipping_last_name || "",
      name: [order.shipping_first_name, order.shipping_last_name].filter(Boolean).join(" "),
      email: order.shipping_email || "",
      phone: order.shipping_phone || "",
    },
    shippingAddress: formatAddress(order, "shipping"),
    items: items.map((item) => ({
      id: item.id,
      name: item.product_name,
      color: item.color || "",
      size: item.size || "",
      qty: item.qty,
      price: parseFloat(item.price),
      image: item.image || "",
      lineTotal: parseFloat(item.price) * item.qty,
    })),
  };
}

async function updateOrder(orderNumber, { status, trackingNumber }) {
  if (status && !ORDER_STATUSES.includes(status)) {
    throw createHttpError(400, "Invalid status.");
  }

  await pool.query(
    `UPDATE orders SET status = COALESCE(?, status), tracking_number = COALESCE(?, tracking_number)
     WHERE order_number = ?`,
    [status, trackingNumber, orderNumber]
  );

  return { message: "Order updated" };
}

async function listCustomers() {
  const [rows] = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
            COUNT(o.id) AS order_count,
            COALESCE(SUM(o.total), 0) AS total_spent
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id
     WHERE u.role = 'user'
     GROUP BY u.id
     ORDER BY total_spent DESC`
  );

  return rows.map((row) => ({
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    orders: row.order_count,
    spent: `Rs ${parseFloat(row.total_spent).toLocaleString()}`,
    joined: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  }));
}

async function listMessages() {
  const [rows] = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50");
  return rows;
}

async function getFeedback() {
  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.body AS text, r.created_at AS date,
            u.first_name, u.last_name,
            p.name AS product_name, p.slug AS product_slug
     FROM product_reviews r
     JOIN users u ON r.user_id = u.id
     JOIN products p ON r.product_id = p.id
     WHERE r.admin_reply IS NULL
     ORDER BY r.created_at DESC`
  );

  const [questions] = await pool.query(
    `SELECT q.id, q.question_text AS text, q.created_at AS date,
            u.first_name, u.last_name,
            p.name AS product_name, p.slug AS product_slug
     FROM product_questions q
     JOIN users u ON q.user_id = u.id
     JOIN products p ON q.product_id = p.id
     WHERE q.admin_answer IS NULL
     ORDER BY q.created_at DESC`
  );

  return {
    reviews: reviews.map((review) => ({
      id: review.id,
      type: "review",
      rating: review.rating,
      title: review.title,
      text: review.text,
      userName: `${review.first_name} ${review.last_name[0]}.`,
      productName: review.product_name,
      productSlug: review.product_slug,
      date: review.date,
    })),
    questions: questions.map((question) => ({
      id: question.id,
      type: "question",
      text: question.text,
      userName: `${question.first_name} ${question.last_name[0]}.`,
      productName: question.product_name,
      productSlug: question.product_slug,
      date: question.date,
    })),
  };
}


async function listNotifications() {
  const [rows] = await pool.query(
    `SELECT n.*, u.email AS user_email, u.first_name, u.last_name
     FROM notifications n
     JOIN users u ON n.user_id = u.id
     ORDER BY n.created_at DESC LIMIT 100`
  );
  return rows;
}

async function createNotification({ userId, title, message, link }) {
  await pool.query(
    "INSERT INTO notifications (user_id, title, message, link) VALUES (?, ?, ?, ?)",
    [userId, title, message, link || null]
  );
  return { message: "Notification sent" };
}

async function listCoupons() {
  const [rows] = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
  return rows;
}

async function createCoupon({ code, discount_pct, active }) {
  await pool.query(
    "INSERT INTO coupons (code, discount_pct, active) VALUES (?, ?, ?)",
    [code.toUpperCase(), discount_pct, active ? 1 : 0]
  );
  return { message: "Coupon created" };
}

async function deleteCoupon(id) {
  await pool.query("DELETE FROM coupons WHERE id = ?", [id]);
  return { message: "Coupon deleted" };
}

module.exports = {
  getStats,
  listOrders,
  getOrderDetails,
  updateOrder,
  listCustomers,
  listMessages,
  getFeedback,
  listNotifications,
  createNotification,
  listCoupons,
  createCoupon,
  deleteCoupon,
};
