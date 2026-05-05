const adminService = require("../services/adminService");

async function getStats(req, res) {
  const stats = await adminService.getStats();
  res.json({ stats });
}

async function listOrders(req, res) {
  const orders = await adminService.listOrders(req.query.status);
  res.json({ orders });
}

async function getOrderDetails(req, res) {
  const order = await adminService.getOrderDetails(req.params.orderNumber);
  res.json({ order });
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

module.exports = {
  getStats,
  listOrders,
  getOrderDetails,
  updateOrder,
  listCustomers,
  listMessages,
  getFeedback,
};
