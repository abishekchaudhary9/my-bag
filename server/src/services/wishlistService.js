const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const createHttpError = require("../utils/httpError");

async function getWishlist(userId) {
  const items = await Wishlist.find({ user: userId }).populate("product");
  const filteredItems = items.filter(item => item.product);
  
  return {
    wishlist: filteredItems.map(item => item.product.toJSON()),
    productIds: filteredItems.map(item => String(item.product._id))
  };
}

async function toggleWishlistItem(userId, productId) {
  const existing = await Wishlist.findOne({ user: userId, product: productId });
  
  if (existing) {
    await existing.deleteOne();
    return { action: "removed", message: "Removed from wishlist" };
  } else {
    const newItem = new Wishlist({ user: userId, product: productId });
    await newItem.save();
    return { action: "added", message: "Added to wishlist" };
  }
}

async function removeWishlistItem(userId, productId) {
  const result = await Wishlist.findOneAndDelete({ user: userId, product: productId });
  if (!result) {
    throw createHttpError(404, "Item not found in wishlist");
  }
  return { message: "Removed from wishlist" };
}

module.exports = {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem
};
