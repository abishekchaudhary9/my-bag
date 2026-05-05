const express = require("express");
const productController = require("../controllers/productController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(productController.listProducts));
router.get("/:slug", asyncHandler(productController.getProduct));
router.post("/", authenticate, requireAdmin, asyncHandler(productController.createProduct));
router.put("/:id", authenticate, requireAdmin, asyncHandler(productController.updateProduct));
router.delete("/:id", authenticate, requireAdmin, asyncHandler(productController.deleteProduct));

module.exports = router;
