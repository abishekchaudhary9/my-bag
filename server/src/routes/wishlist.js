const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(wishlistController.getWishlist));
router.post("/", authenticate, asyncHandler(wishlistController.toggleWishlistItem));
router.delete("/:productId", authenticate, asyncHandler(wishlistController.removeWishlistItem));

module.exports = router;
