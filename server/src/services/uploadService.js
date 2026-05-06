const path = require("path");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");
const createHttpError = require("../utils/httpError");

function uploadImage(file) {
  if (!isCloudinaryConfigured()) {
    const error = createHttpError(500, "Cloudinary is not configured.");
    error.expose = true;
    throw error;
  }

  if (!file) {
    throw createHttpError(400, "Image file is required.");
  }

  const folder = process.env.CLOUDINARY_FOLDER || "maison-products";
  const baseName = path.parse(file.originalname).name.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${baseName || "product"}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(createHttpError(502, "Cloudinary upload failed."));
        }

        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    stream.end(file.buffer);
  });
}

module.exports = { uploadImage };
