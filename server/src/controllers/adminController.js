const adminService = require("../services/adminService");

async function getStats(req, res) {
  const result = await adminService.getStats();
  res.json(result);
}

async function listOrders(req, res) {
  const result = await adminService.listOrders(req.query.status);
  res.json(result);
}

async function getOrderDetails(req, res) {
  const result = await adminService.getOrderDetails(req.params.orderNumber);
  res.json(result);
}

async function updateOrder(req, res) {
  const result = await adminService.updateOrder(req.params.orderNumber, req.body);
  res.json(result);
}

async function listCustomers(req, res) {
  const customers = await adminService.listCustomers();
  res.json({ customers });
}

async function listMessages(req, res) {
  const messages = await adminService.listMessages();
  res.json({ messages });
}

async function getFeedback(req, res) {
  const result = await adminService.getFeedback();
  res.json(result);
}

async function listNotifications(req, res) {
  const notifications = await adminService.listNotifications();
  res.json({ notifications });
}

async function createNotification(req, res) {
  const result = await adminService.createNotification(req.body);
  res.json(result);
}

async function listCoupons(req, res) {
  const coupons = await adminService.listCoupons();
  res.json({ coupons });
}

async function createCoupon(req, res) {
  const result = await adminService.createCoupon(req.body);
  res.json(result);
}

async function deleteCoupon(req, res) {
  const result = await adminService.deleteCoupon(req.params.id);
  res.json(result);
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
