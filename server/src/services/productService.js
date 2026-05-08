const pool = require("../config/database");
const { emitEvent } = require("../lib/socket");
const { mapProduct } = require("../models/productModel");
const createHttpError = require("../utils/httpError");

const ALLOWED_CATEGORIES = new Set([
  "handbags",
  "backpacks",
  "travel",
  "office",
  "college",
  "fashion",
  "accessories",
]);

function validateProductPayload(data) {
  const { slug, name, category, price, colors } = data;

  if (!slug || !name || !category || !price) {
    throw createHttpError(400, "slug, name, category, and price are required.");
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    throw createHttpError(400, `Invalid product category: ${category}.`);
  }

  if (!Array.isArray(colors) || colors.length === 0) {
    throw createHttpError(400, "At least one product color is required.");
  }

  const invalidColor = colors.find((color) => !color.name || !color.hex || !color.image);
  if (invalidColor) {
    throw createHttpError(400, "Each product color requires a name, hex value, and image.");
  }
}

async function fetchFullProduct(productRow) {
  const productId = productRow.id;
  const [sizes] = await pool.query("SELECT size_name FROM product_sizes WHERE product_id = ?", [productId]);
  const [colors] = await pool.query("SELECT color_name, hex, image_url FROM product_colors WHERE product_id = ?", [productId]);
  const [details] = await pool.query("SELECT detail_text FROM product_details WHERE product_id = ?", [productId]);

  return mapProduct(productRow, sizes, colors, details);
}

async function listProducts({ category, q }) {
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  if (q) {
    sql += " AND (name LIKE ? OR description LIKE ? OR material LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  sql += " ORDER BY is_bestseller DESC, created_at DESC";

  const [rows] = await pool.query(sql, params);
  return Promise.all(rows.map(fetchFullProduct));
}

async function getProductBySlug(slug) {
  const [rows] = await pool.query("SELECT * FROM products WHERE slug = ?", [slug]);
  if (rows.length === 0) {
    throw createHttpError(404, "Product not found");
  }
  return fetchFullProduct(rows[0]);
}

async function createProduct(data) {
  const { slug, name, tagline, category, price, compareAt, rating, reviews, stock, material, description, isNew, isBestseller, sizes, colors, details } = data;

  validateProductPayload(data);

  let result;
  try {
    [result] = await pool.query(
      `INSERT INTO products (slug, name, tagline, category, price, compare_at, rating, reviews, stock, material, description, is_new, is_bestseller)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, name, tagline || null, category, price, compareAt || null, rating || 0, reviews || 0, stock || 0, material || null, description || null, isNew ? 1 : 0, isBestseller ? 1 : 0]
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw createHttpError(409, "Product slug already exists.");
    }
    throw err;
  }

  const productId = result.insertId;
  await insertProductRelations(productId, sizes, colors, details);

  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
  return fetchFullProduct(rows[0]);
}

async function updateProduct(productId, data) {
  const { name, tagline, category, price, compareAt, rating, reviews, stock, material, description, isNew, isBestseller, sizes, colors, details } = data;

  if (category && !ALLOWED_CATEGORIES.has(category)) {
    throw createHttpError(400, `Invalid product category: ${category}.`);
  }

  if (colors) {
    const invalidColor = colors.find((color) => !color.name || !color.hex || !color.image);
    if (invalidColor) {
      throw createHttpError(400, "Each product color requires a name, hex value, and image.");
    }
  }

  await pool.query(
    `UPDATE products SET name = COALESCE(?, name), tagline = COALESCE(?, tagline), category = COALESCE(?, category),
     price = COALESCE(?, price), compare_at = ?, rating = COALESCE(?, rating), reviews = COALESCE(?, reviews),
     stock = COALESCE(?, stock), material = COALESCE(?, material), description = COALESCE(?, description),
     is_new = COALESCE(?, is_new), is_bestseller = COALESCE(?, is_bestseller) WHERE id = ?`,
    [name, tagline, category, price, compareAt || null, rating, reviews, stock, material, description, isNew !== undefined ? (isNew ? 1 : 0) : null, isBestseller !== undefined ? (isBestseller ? 1 : 0) : null, productId]
  );

  await replaceProductRelations(productId, sizes, colors, details);

  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
  if (rows.length === 0) {
    throw createHttpError(404, "Product not found");
  }

  // Real-time: Notify product page of updates
  emitEvent(`product:${productId}`, "product_update", { productId });
  if (stock !== undefined) {
    emitEvent(`product:${productId}`, "stock_update", { productId, stock });
  }

  return fetchFullProduct(rows[0]);
}

async function deleteProduct(productId) {
  const [result] = await pool.query("DELETE FROM products WHERE id = ?", [productId]);
  if (result.affectedRows === 0) {
    throw createHttpError(404, "Product not found");
  }
  return { message: "Product deleted" };
}

async function insertProductRelations(productId, sizes, colors, details) {
  if (sizes && sizes.length > 0) {
    for (const size of sizes) {
      await pool.query("INSERT INTO product_sizes (product_id, size_name) VALUES (?, ?)", [productId, size]);
    }
  }

  if (colors && colors.length > 0) {
    for (const color of colors) {
      await pool.query("INSERT INTO product_colors (product_id, color_name, hex, image_url) VALUES (?, ?, ?, ?)", [productId, color.name, color.hex, color.image || null]);
    }
  }

  if (details && details.length > 0) {
    for (const detail of details) {
      await pool.query("INSERT INTO product_details (product_id, detail_text) VALUES (?, ?)", [productId, detail]);
    }
  }
}

async function replaceProductRelations(productId, sizes, colors, details) {
  if (sizes) {
    await pool.query("DELETE FROM product_sizes WHERE product_id = ?", [productId]);
    for (const size of sizes) {
      await pool.query("INSERT INTO product_sizes (product_id, size_name) VALUES (?, ?)", [productId, size]);
    }
  }

  if (colors) {
    await pool.query("DELETE FROM product_colors WHERE product_id = ?", [productId]);
    for (const color of colors) {
      await pool.query("INSERT INTO product_colors (product_id, color_name, hex, image_url) VALUES (?, ?, ?, ?)", [productId, color.name, color.hex, color.image || null]);
    }
  }

  if (details) {
    await pool.query("DELETE FROM product_details WHERE product_id = ?", [productId]);
    for (const detail of details) {
      await pool.query("INSERT INTO product_details (product_id, detail_text) VALUES (?, ?)", [productId, detail]);
    }
  }
}

module.exports = {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchFullProduct,
};
