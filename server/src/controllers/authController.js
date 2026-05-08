const authService = require("../services/authService");

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
  const result = await authService.loginWithFirebase(req.body);
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

module.exports = {
  signup,
  login,
  googleLogin,
  firebaseLogin,
  findEmailByPhone,
  getMe,
  updateProfile,
  updatePassword,
};
