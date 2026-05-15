const uploadService = require("../services/uploadService");
const authService = require("../services/authService");
const { success } = require("../utils/responseHandler");

async function uploadImage(req, res) {
  const image = await uploadService.uploadImage(req.file);
  res.status(201).json(success({ image }, "Image uploaded successfully", 201));
}

async function uploadAvatar(req, res) {
  const image = await uploadService.uploadImage(req.file);
  const user = await authService.updateAvatar(req.user.id, image.url);
  res.status(200).json(success({ user, image }, "Avatar updated successfully"));
}

async function deleteAvatar(req, res) {
  const user = await authService.updateAvatar(req.user.id, null);
  res.status(200).json(success({ user }, "Avatar deleted successfully"));
}

module.exports = { uploadImage, uploadAvatar, deleteAvatar };
