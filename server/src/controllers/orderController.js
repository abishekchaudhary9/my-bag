const orderService = require("../services/orderService");

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(201).json({ order });
}

async function listOrders(req, res) {
  const orders = await orderService.listUserOrders(req.user.id);
  res.json({ orders });
}

async function getOrder(req, res) {
  const order = await orderService.getUserOrder(req.params.orderNumber, req.user.id);
  res.json({ order });
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
};
