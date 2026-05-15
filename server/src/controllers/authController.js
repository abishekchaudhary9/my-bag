const authService = require("../services/authService");
const otpService = require("../services/otpService");
const { success, error } = require("../utils/responseHandler");

async function signup(req, res) {
  const result = await authService.signup(req.body);
  res.status(201).json(success(result, "Signup successful", 201));
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(success(result, "Login successful"));
}

async function googleLogin(req, res) {
  const result = await authService.loginWithGoogle(req.body);
  res.json(success(result, "Google login successful"));
}

async function firebaseLogin(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown Device";
  const result = await authService.loginWithFirebase({ ...req.body, ip, userAgent });
  res.json(success(result, "Firebase login successful"));
}

async function findEmailByPhone(req, res) {
  const result = await authService.findEmailByPhone(req.body);
  res.json(success(result, "Email found"));
}

async function getMe(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  res.json(success({ user }, "Current user retrieved"));
}

async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json(success({ user }, "Profile updated successfully"));
}

async function updatePassword(req, res) {
  const result = await authService.updatePassword(req.user.id, req.body);
  res.json(success(result, "Password updated successfully"));
}

async function sendOtp(req, res) {
  const result = await otpService.generateOtp(req.body.email);
  res.json(success(result, "OTP sent to email"));
}

async function verifyOtp(req, res) {
  const result = await otpService.verifyOtp(req.body.email, req.body.code);
  res.json(success(result, "OTP verified successfully"));
}

module.exports = {
  signup,
  login,
  googleLogin,
  firebaseLogin,
  findEmailByPhone,
  getMe,
  updateProfile,
  updatePassword,
  sendOtp,
  verifyOtp,
};
