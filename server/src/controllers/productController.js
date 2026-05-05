const productService = require("../services/productService");

async function listProducts(req, res) {
  const products = await productService.listProducts(req.query);
  res.json({ products });
}

async function getProduct(req, res) {
  const product = await productService.getProductBySlug(req.params.slug);
  res.json({ product });
}

async function createProduct(req, res) {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ product });
}

async function deleteProduct(req, res) {
  const result = await productService.deleteProduct(req.params.id);
  res.json(result);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
