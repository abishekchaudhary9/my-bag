const uploadService = require("../services/uploadService");

const authService = require("../services/authService");

async function uploadImage(req, res) {
  const image = await uploadService.uploadImage(req.file);
  res.status(201).json({ image });
}

async function uploadAvatar(req, res) {
  const image = await uploadService.uploadImage(req.file);
  const user = await authService.updateAvatar(req.user.id, image.url);
  res.status(200).json({ user, image });
}

async function deleteAvatar(req, res) {
  const user = await authService.updateAvatar(req.user.id, null);
  res.status(200).json({ user });
}

module.exports = { uploadImage, uploadAvatar, deleteAvatar };
