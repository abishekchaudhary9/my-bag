const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const createHttpError = require("../utils/httpError");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      return callback(createHttpError(400, "Only image uploads are allowed."));
    }

    return callback(null, true);
  },
});

router.post(
  "/image",
  authenticate,
  requireAdmin,
  upload.single("image"),
  asyncHandler(uploadController.uploadImage)
);

router.post(
  "/avatar",
  authenticate,
  upload.single("image"),
  asyncHandler(uploadController.uploadAvatar)
);

router.delete(
  "/avatar",
  authenticate,
  asyncHandler(uploadController.deleteAvatar)
);

module.exports = router;
