const cartService = require("../services/cartService");
const { success } = require("../utils/responseHandler");

async function getCart(req, res) {
  const cart = await cartService.getCart(req.user.id);
  res.json(success(cart, "Cart retrieved"));
}

async function addItem(req, res) {
  const result = await cartService.addItem(req.user.id, req.body);
  res.status(201).json(success(result, "Item added to cart", 201));
}

async function updateItem(req, res) {
  const result = await cartService.updateItem(req.user.id, req.params.id, req.body);
  res.json(success(result, "Cart item updated"));
}

async function removeItem(req, res) {
  const result = await cartService.removeItem(req.user.id, req.params.id);
  res.json(success(result, "Item removed from cart"));
}

async function clearCart(req, res) {
  const result = await cartService.clearCart(req.user.id);
  res.json(success(result, "Cart cleared"));
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
