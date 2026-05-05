const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.getMe));
router.put("/profile", authenticate, asyncHandler(authController.updateProfile));
router.put("/password", authenticate, asyncHandler(authController.updatePassword));

module.exports = router;
