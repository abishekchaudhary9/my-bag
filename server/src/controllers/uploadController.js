const uploadService = require("../services/uploadService");

async function uploadImage(req, res) {
  const image = await uploadService.uploadImage(req.file);
  res.status(201).json({ image });
}

module.exports = { uploadImage };
