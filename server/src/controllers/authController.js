const authService = require("../services/authService");
const otpService = require("../services/otpService");

async function signup(req, res) {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(result);
}

async function googleLogin(req, res) {
  const result = await authService.loginWithGoogle(req.body);
  res.json(result);
}

async function firebaseLogin(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  const userAgent = req.headers["user-agent"] || "Unknown Device";
  const result = await authService.loginWithFirebase({ ...req.body, ip, userAgent });
  res.json(result);
}

async function findEmailByPhone(req, res) {
  const result = await authService.findEmailByPhone(req.body);
  res.json(result);
}

async function getMe(req, res) {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ user });
}

async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ user });
}

async function updatePassword(req, res) {
  const result = await authService.updatePassword(req.user.id, req.body);
  res.json(result);
}

async function sendOtp(req, res) {
  const result = await otpService.generateOtp(req.body.email);
  res.json(result);
}

async function verifyOtp(req, res) {
  const result = await otpService.verifyOtp(req.body.email, req.body.code);
  res.json(result);
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
