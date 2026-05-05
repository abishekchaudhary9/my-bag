const wishlistService = require("../services/wishlistService");

async function getWishlist(req, res) {
  const result = await wishlistService.getWishlist(req.user.id);
  res.json(result);
}

async function toggleWishlistItem(req, res) {
  const result = await wishlistService.toggleWishlistItem(req.user.id, req.body.productId);
  res.json(result);
}

async function removeWishlistItem(req, res) {
  const result = await wishlistService.removeWishlistItem(req.user.id, req.params.productId);
  res.json(result);
}

module.exports = {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
};
