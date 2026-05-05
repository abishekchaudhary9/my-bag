const cartService = require("../services/cartService");

async function getCart(req, res) {
  const cart = await cartService.getCart(req.user.id);
  res.json({ cart });
}

async function addItem(req, res) {
  const result = await cartService.addItem(req.user.id, req.body);
  res.status(201).json(result);
}

async function updateItem(req, res) {
  const result = await cartService.updateItem(req.user.id, req.params.id, req.body);
  res.json(result);
}

async function removeItem(req, res) {
  const result = await cartService.removeItem(req.user.id, req.params.id);
  res.json(result);
}

async function clearCart(req, res) {
  const result = await cartService.clearCart(req.user.id);
  res.json(result);
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
