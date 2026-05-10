const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const ContactMessage = require("../models/contactModel");
const Review = require("../models/reviewModel");
const Question = require("../models/questionModel");
const Notification = require("../models/notificationModel");
const createHttpError = require("../utils/httpError");
const { emitEvent } = require("../lib/socket");
const orderService = require("./orderService");

async function getStats() {
  const [totalSales, ordersCount, productsCount, usersCount, products] = await Promise.all([
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Product.find()
  ]);

  const sales = totalSales.length > 0 ? totalSales[0].total : 0;

  const statusCounts = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statuses = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  statusCounts.forEach(s => {
    if (statuses[s._id] !== undefined) statuses[s._id] = s.count;
  });

  // Revenue Trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const revenueData = await Order.aggregate([
    { $match: { created_at: { $gte: sevenDaysAgo } } },
    { $group: { 
        _id: { $dateToString: { format: "%m/%d", date: "$created_at" } }, 
        revenue: { $sum: "$total" },
        orders: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  // Category Distribution
  const categoryMap = {};
  products.forEach(p => {
    const category = p.category || "Uncategorized";
    if (!categoryMap[category]) categoryMap[category] = { category, value: 0, stock: 0 };
    categoryMap[category].value += (p.price || 0) * (p.stock || 0);
    categoryMap[category].stock += (p.stock || 0);
  });

  // Top Customers
  const topUsers = await Order.aggregate([
    { $group: { _id: "$user", spent: { $sum: "$total" }, orders: { $sum: 1 } } },
    { $sort: { spent: -1 } },
    { $limit: 5 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userData" } },
    { $unwind: "$userData" }
  ]);

  // Calculate changes (simple mock for now based on actual counts vs defaults)
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const [prevSales, prevOrders, prevUsers] = await Promise.all([
    Order.aggregate([{ $match: { created_at: { $lt: lastMonth } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments({ created_at: { $lt: lastMonth } }),
    User.countDocuments({ role: "user", created_at: { $lt: lastMonth } })
  ]);

  const pSales = prevSales.length > 0 ? prevSales[0].total : 1;
  const revenueChange = ((sales - pSales) / pSales) * 100;
  const ordersChange = prevOrders > 0 ? ((ordersCount - prevOrders) / prevOrders) * 100 : 0;
  const customersChange = prevUsers > 0 ? ((usersCount - prevUsers) / prevUsers) * 100 : 0;

  return {
    stats: {
      revenue: sales,
      orders: ordersCount,
      products: productsCount,
      customers: usersCount,
      processingOrders: statuses.processing,
      shippedOrders: statuses.shipped,
      deliveredOrders: statuses.delivered,
      cancelledOrders: statuses.cancelled,
      revenueChange,
      ordersChange,
      customersChange,
      revenueTrend: revenueData.map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
      categoryTrend: Object.values(categoryMap),
      topCustomers: topUsers.map(u => ({
        id: String(u._id),
        name: `${u.userData.first_name} ${u.userData.last_name}`,
        spent: u.spent,
        orders: u.orders
      }))
    }
  };
}

async function listOrders(status) {
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).sort({ created_at: -1 });
  return { 
    orders: orders.map(o => {
      const json = o.toJSON();
      return {
        ...json,
        id: json.orderNumber,
        customer: `${json.shippingAddress?.firstName || ''} ${json.shippingAddress?.lastName || ''}`.trim() || 'Unknown',
        customerEmail: json.shippingAddress?.email || 'N/A',
        customerPhone: json.shippingAddress?.phone || 'N/A',
        customerAddress: `${json.shippingAddress?.street || ''}, ${json.shippingAddress?.city || ''}`.replace(/^,\s*/, '') || 'N/A'
      };
    }) 
  };
}

async function getOrderDetails(orderNumber) {
  return orderService.getOrderDetails(orderNumber);
}

async function updateOrder(orderNumber, data) {
  return orderService.updateOrderStatus(orderNumber, data.status, data.trackingNumber);
}

async function listCustomers() {
  const customers = await User.find({ role: "user" }).sort({ created_at: -1 });
  
  const userStats = await Order.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 }, totalSpent: { $sum: "$total" } } }
  ]);
  
  const statsMap = {};
  userStats.forEach(s => {
    statsMap[String(s._id)] = { count: s.count, spent: s.totalSpent };
  });
  
  return customers.map(c => {
    const json = c.toJSON();
    const stats = statsMap[String(c._id)] || { count: 0, spent: 0 };
    return {
      ...json,
      name: `${json.firstName || ''} ${json.lastName || ''}`.trim() || 'Unknown',
      orders: stats.count,
      spent: stats.spent
    };
  });
}

async function listMessages() {
  const messages = await ContactMessage.find().sort({ created_at: -1 });
  return messages.map(m => ({
    id: String(m._id),
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    isRead: m.is_read,
    createdAt: m.created_at
  }));
}

async function getFeedback() {
  const [reviews, questions] = await Promise.all([
    Review.find().populate("user").populate("product").sort({ created_at: -1 }),
    Question.find().populate("user").populate("product").sort({ created_at: -1 })
  ]);

  return {
    reviews: reviews.map(r => ({
      id: String(r._id),
      productName: r.product?.name || "Deleted Product",
      userName: r.user ? `${r.user.first_name} ${r.user.last_name}` : "Unknown User",
      rating: r.rating,
      title: r.title,
      body: r.body,
      reply: r.admin_reply,
      createdAt: r.created_at
    })),
    questions: questions.map(q => ({
      id: String(q._id),
      productName: q.product?.name || "Deleted Product",
      userName: q.user ? `${q.user.first_name} ${q.user.last_name}` : "Unknown User",
      text: q.question_text,
      answer: q.admin_answer,
      createdAt: q.created_at
    }))
  };
}

async function listNotifications() {
  const notifications = await Notification.find().populate("user").sort({ created_at: -1 });
  return notifications.map(n => ({
    id: String(n._id),
    userName: n.user ? `${n.user.first_name} ${n.user.last_name}` : "Global",
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    createdAt: n.created_at
  }));
}

async function createNotification(data) {
  const notification = new Notification({
    user: data.userId,
    title: data.title,
    message: data.message,
    link: data.link
  });
  await notification.save();

  // Real-time: Notify the target user and admins
  if (data.userId) {
    emitEvent(`user_${data.userId}`, "notification", {
      id: String(notification._id),
      title: data.title,
      message: data.message,
      link: data.link,
      isRead: false,
      createdAt: notification.created_at
    });
  }
  emitEvent("admins", "notification", {
    id: String(notification._id),
    title: data.title,
    message: data.message,
    link: data.link,
    isRead: false,
    createdAt: notification.created_at
  });

  return { message: "Notification created" };
}

async function listCoupons() {
  const coupons = await Coupon.find().sort({ created_at: -1 });
  return coupons.map(c => ({
    id: String(c._id),
    code: c.code,
    discount_pct: c.discount_pct,
    description: c.description,
    terms: c.terms,
    active: c.active
  }));
}

async function createCoupon(data) {
  const coupon = new Coupon({
    code: data.code.toUpperCase(),
    discount_pct: data.discount_pct,
    description: data.description,
    terms: data.terms,
    active: data.active
  });
  await coupon.save();
  return { message: "Coupon created successfully" };
}

async function deleteCoupon(id) {
  await Coupon.findByIdAndDelete(id);
  return { message: "Coupon deleted successfully" };
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
  deleteCoupon
};