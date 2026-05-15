const productService = require("../services/productService");
const { success } = require("../utils/responseHandler");

async function listProducts(req, res) {
  const { products } = await productService.listProducts(req.query);
  res.json(success({ products }, "Products retrieved"));
}

async function getProduct(req, res) {
  const { product } = await productService.getProductBySlug(req.params.slug);
  res.json(success({ product }, "Product retrieved"));
}

async function createProduct(req, res) {
  const { product } = await productService.createProduct(req.body);
  res.status(201).json(success({ product }, "Product created successfully", 201));
}

async function updateProduct(req, res) {
  const { product } = await productService.updateProduct(req.params.id, req.body);
  res.json(success({ product }, "Product updated successfully"));
}

async function deleteProduct(req, res) {
  const result = await productService.deleteProduct(req.params.id);
  res.json(success(result, "Product deleted successfully"));
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
