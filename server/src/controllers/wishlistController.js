const wishlistService = require("../services/wishlistService");
const { success } = require("../utils/responseHandler");

async function getWishlist(req, res) {
  const result = await wishlistService.getWishlist(req.user.id);
  res.json(success(result, "Wishlist retrieved"));
}

async function toggleWishlistItem(req, res) {
  const result = await wishlistService.toggleWishlistItem(req.user.id, req.body.productId);
  res.json(success(result, "Wishlist item toggled"));
}

async function removeWishlistItem(req, res) {
  const result = await wishlistService.removeWishlistItem(req.user.id, req.params.productId);
  res.json(success(result, "Item removed from wishlist"));
}

module.exports = {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
};
