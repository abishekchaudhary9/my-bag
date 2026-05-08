const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.post("/google", asyncHandler(authController.googleLogin));
router.post("/firebase", asyncHandler(authController.firebaseLogin));
router.post("/phone/email", asyncHandler(authController.findEmailByPhone));
router.get("/me", authenticate, asyncHandler(authController.getMe));
router.put("/profile", authenticate, asyncHandler(authController.updateProfile));
router.put("/password", authenticate, asyncHandler(authController.updatePassword));
router.post("/send-otp", asyncHandler(authController.sendOtp));
router.post("/verify-otp", asyncHandler(authController.verifyOtp));

module.exports = router;
