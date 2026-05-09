const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const ContactMessage = require("../models/contactModel");
const Review = require("../models/reviewModel");
const Question = require("../models/questionModel");
const Notification = require("../models/notificationModel");
const createHttpError = require("../utils/httpError");
const orderService = require("./orderService");

async function getStats() {
  const [totalSales, ordersCount, productsCount, usersCount] = await Promise.all([
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "user" })
  ]);

  const sales = totalSales.length > 0 ? totalSales[0].total : 0;

  return {
    stats: {
      totalSales: sales,
      totalOrders: ordersCount,
      totalProducts: productsCount,
      totalCustomers: usersCount,
      revenueChange: 12.5,
      ordersChange: 8.2,
      customersChange: -2.4
    }
  };
}

async function listOrders(status) {
  return orderService.getUserOrders(null); // Adjusted in orderService to handle all orders if userId is null
}

async function getOrderDetails(orderNumber) {
  return orderService.getOrderDetails(orderNumber);
}

async function updateOrder(orderNumber, data) {
  return orderService.updateOrderStatus(orderNumber, data.status, data.trackingNumber);
}

async function listCustomers() {
  const customers = await User.find({ role: "user" }).sort({ created_at: -1 });
  return customers.map(c => c.toJSON());
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
    user: data.userId, // If null, it's global or needs adjustment
    title: data.title,
    message: data.message,
    link: data.link
  });
  await notification.save();
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
