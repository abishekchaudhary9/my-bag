const adminService = require("../services/adminService");
const { success } = require("../utils/responseHandler");

async function getStats(req, res) {
  const result = await adminService.getStats();
  res.json(success(result, "Admin stats retrieved"));
}

async function listOrders(req, res) {
  const result = await adminService.listOrders(req.query.status);
  res.json(success(result, "Orders list retrieved"));
}

async function getOrderDetails(req, res) {
  const result = await adminService.getOrderDetails(req.params.orderNumber);
  res.json(success(result, "Order details retrieved"));
}

async function updateOrder(req, res) {
  const result = await adminService.updateOrder(req.params.orderNumber, req.body);
  res.json(success(result, "Order updated successfully"));
}

async function listCustomers(req, res) {
  const customers = await adminService.listCustomers();
  res.json(success({ customers }, "Customers list retrieved"));
}

async function listMessages(req, res) {
  const messages = await adminService.listMessages();
  res.json(success({ messages }, "Messages retrieved"));
}

async function getFeedback(req, res) {
  const result = await adminService.getFeedback();
  res.json(success(result, "Feedback retrieved"));
}

async function listNotifications(req, res) {
  const notifications = await adminService.listNotifications();
  res.json(success({ notifications }, "Notifications retrieved"));
}

async function createNotification(req, res) {
  const result = await adminService.createNotification(req.body);
  res.status(201).json(success(result, "Notification created successfully", 201));
}

async function listCoupons(req, res) {
  const coupons = await adminService.listCoupons();
  res.json(success({ coupons }, "Coupons retrieved"));
}

async function createCoupon(req, res) {
  const result = await adminService.createCoupon(req.body);
  res.status(201).json(success(result, "Coupon created successfully", 201));
}

async function deleteCoupon(req, res) {
  const result = await adminService.deleteCoupon(req.params.id);
  res.json(success(result, "Coupon deleted successfully"));
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
