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
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  const [currentStats, prevStats, totalProducts, totalUsers, products] = await Promise.all([
    // Current 30 days
    Order.aggregate([
      { $match: { created_at: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
    ]),
    // Previous 30 days (for comparison)
    Order.aggregate([
      { $match: { created_at: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }
    ]),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Product.find()
  ]);

  const currentRevenue = currentStats[0]?.revenue || 0;
  const currentOrders = currentStats[0]?.count || 0;
  const prevRevenue = prevStats[0]?.revenue || 1; // Avoid div by zero
  const prevOrders = prevStats[0]?.count || 1;

  const revenueChange = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
  const ordersChange = ((currentOrders - prevOrders) / prevOrders) * 100;

  // Revenue Trend (Last 7 Days with gap filling)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
  }

  const startOfTrend = new Date();
  startOfTrend.setDate(now.getDate() - 7);
  startOfTrend.setHours(0,0,0,0);

  const trendDataRaw = await Order.aggregate([
    { $match: { created_at: { $gte: startOfTrend } } },
    { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, 
        revenue: { $sum: "$total" },
        orders: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  const trendMap = {};
  trendDataRaw.forEach(d => { trendMap[d._id] = d; });

  const revenueTrend = last7Days.map(dateStr => {
    const data = trendMap[dateStr];
    // Format date for display (MM/DD)
    const [y, m, d] = dateStr.split('-');
    return {
      date: `${m}/${d}`,
      revenue: data?.revenue || 0,
      orders: data?.orders || 0
    };
  });

  // Status distribution (Current Month)
  const statusCounts = await Order.aggregate([
    { $match: { created_at: { $gte: thirtyDaysAgo } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const statuses = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  statusCounts.forEach(s => {
    if (statuses[s._id] !== undefined) statuses[s._id] = s.count;
  });

  // Top Customers (All Time)
  const topUsers = await Order.aggregate([
    { $group: { _id: "$user", spent: { $sum: "$total" }, orders: { $sum: 1 } } },
    { $sort: { spent: -1 } },
    { $limit: 5 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userData" } },
    { $unwind: "$userData" }
  ]);

  // Category Distribution
  const categoryMap = {};
  products.forEach(p => {
    const category = p.category || "Uncategorized";
    if (!categoryMap[category]) categoryMap[category] = { category, value: 0, stock: 0 };
    categoryMap[category].value += (p.price || 0) * (p.stock || 0);
    categoryMap[category].stock += (p.stock || 0);
  });

  // Customers Change (New users this month vs last month)
  const [currentUsers, prevUsersCount] = await Promise.all([
    User.countDocuments({ role: "user", created_at: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ role: "user", created_at: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
  ]);
  const customersChange = prevUsersCount > 0 ? ((currentUsers - prevUsersCount) / prevUsersCount) * 100 : 0;

  return {
    stats: {
      revenue: currentRevenue,
      orders: currentOrders,
      products: totalProducts,
      customers: totalUsers,
      processingOrders: statuses.processing,
      shippedOrders: statuses.shipped,
      deliveredOrders: statuses.delivered,
      cancelledOrders: statuses.cancelled,
      revenueChange,
      ordersChange,
      customersChange,
      revenueTrend,
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