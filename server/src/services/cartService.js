const CartItem = require("../models/cartModel");
const Product = require("../models/productModel");
const createHttpError = require("../utils/httpError");

async function getCart(userId) {
  const items = await CartItem.find({ user: userId }).populate("product");
  
  return {
    cart: items.filter(item => item.product).map(item => ({
      id: String(item._id),
      productId: String(item.product._id),
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      image: item.product.colors?.find(c => c.name === item.color)?.image_url || item.product.colors?.[0]?.image_url,
      color: item.color,
      size: item.size,
      qty: item.qty
    }))
  };
}

async function addItem(userId, { productId, color, size, qty = 1 }) {
  // Find existing item
  let item = await CartItem.findOne({ user: userId, product: productId, color, size });
  
  if (item) {
    item.qty += qty;
    await item.save();
  } else {
    item = new CartItem({
      user: userId,
      product: productId,
      color,
      size,
      qty
    });
    await item.save();
  }
  
  return { message: "Item added to cart" };
}

async function updateItem(userId, itemId, { qty }) {
  const item = await CartItem.findOneAndUpdate(
    { _id: itemId, user: userId },
    { $set: { qty } },
    { new: true }
  );
  
  if (!item) {
    throw createHttpError(404, "Cart item not found");
  }
  
  return { message: "Quantity updated" };
}

async function removeItem(userId, itemId) {
  const result = await CartItem.findOneAndDelete({ _id: itemId, user: userId });
  if (!result) {
    throw createHttpError(404, "Cart item not found");
  }
  return { message: "Item removed from cart" };
}

async function clearCart(userId) {
  await CartItem.deleteMany({ user: userId });
  return { message: "Cart cleared" };
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
