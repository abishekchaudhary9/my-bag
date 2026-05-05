const express = require("express");
const reviewController = require("../controllers/reviewController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/:productId", asyncHandler(reviewController.listReviews));
router.get("/:productId/eligibility", authenticate, asyncHandler(reviewController.getReviewEligibility));
router.post("/:productId", authenticate, asyncHandler(reviewController.createReview));
router.put("/:reviewId/reply", authenticate, asyncHandler(reviewController.replyToReview));
router.put("/:reviewId", authenticate, asyncHandler(reviewController.updateReview));
router.delete("/:reviewId", authenticate, asyncHandler(reviewController.deleteReview));

module.exports = router;
