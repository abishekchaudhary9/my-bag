/**
 * Database initialization script.
 * Creates the configured database and all tables, then seeds initial data.
 * Run with: npm run db:init
 */
const mysql = require("mysql2/promise");
const env = require("./env");

function escapeIdentifier(value) {
  if (!/^[A-Za-z0-9_$]+$/.test(value)) {
    throw new Error(`Invalid database name: ${value}`);
  }
  return `\`${value}\``;
}

const DB = escapeIdentifier(env.database.name);

const SCHEMA = `
CREATE DATABASE IF NOT EXISTS ${DB};
USE ${DB};

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) DEFAULT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  phone VARCHAR(30) DEFAULT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  street VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  zip VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT 'Nepal',
  email_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500) DEFAULT NULL,
  category ENUM('handbags','backpacks','travel','office','college','fashion','accessories') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at DECIMAL(10,2) DEFAULT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  stock INT DEFAULT 0,
  material VARCHAR(255) DEFAULT NULL,
  description TEXT,
  is_new TINYINT(1) DEFAULT 0,
  is_bestseller TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product sizes
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size_name VARCHAR(50) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product colors
CREATE TABLE IF NOT EXISTS product_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  hex VARCHAR(10) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product details (bullet points)
CREATE TABLE IF NOT EXISTS product_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  detail_text VARCHAR(500) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  status ENUM('processing','shipped','delivered','cancelled') DEFAULT 'processing',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  tracking_number VARCHAR(100) DEFAULT NULL,
  shipping_first_name VARCHAR(100) DEFAULT NULL,
  shipping_last_name VARCHAR(100) DEFAULT NULL,
  shipping_email VARCHAR(255) DEFAULT NULL,
  shipping_phone VARCHAR(30) DEFAULT NULL,
  shipping_street VARCHAR(255) DEFAULT NULL,
  shipping_city VARCHAR(100) DEFAULT NULL,
  shipping_state VARCHAR(100) DEFAULT NULL,
  shipping_zip VARCHAR(20) DEFAULT NULL,
  shipping_country VARCHAR(100) DEFAULT NULL,
  payment_method VARCHAR(20) DEFAULT 'card',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT NULL,
  size VARCHAR(50) DEFAULT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Cart items (server-side cart for logged-in users)
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  size VARCHAR(50) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id, color, size)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, product_id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_pct INT NOT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  admin_reply TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Product questions
CREATE TABLE IF NOT EXISTS product_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  question_text TEXT NOT NULL,
  admin_answer TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

async function ensureColumn(conn, tableName, columnName, definition) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [env.database.name, tableName, columnName]
  );

  if (rows.length === 0) {
    await conn.query(`ALTER TABLE ${DB}.${tableName} ADD COLUMN ${definition}`);
  }
}

async function init() {
  let conn;
  try {
    // Connect without database first to create it
    conn = await mysql.createConnection({
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      connectTimeout: env.database.connectTimeout,
      multipleStatements: true,
    });

    console.log("Connected to MySQL. Creating database and tables...");
    await conn.query(SCHEMA);
    await ensureColumn(conn, "users", "firebase_uid", "firebase_uid VARCHAR(128) DEFAULT NULL UNIQUE AFTER id");
    await ensureColumn(conn, "users", "email_verified", "email_verified TINYINT(1) DEFAULT 0 AFTER country");
    console.log("Tables created successfully.");

    // Seed products
    const productsData = [
      { slug: "atelier-tote", name: "Atelier Tote", tagline: "The everyday carry, perfected.", category: "handbags", price: 480, compare_at: 540, rating: 4.8, reviews: 214, stock: 12, material: "Full-grain Italian leather", description: "A structured tote shaped from a single panel of full-grain leather, finished by hand in our Florentine atelier. Designed to soften, deepen, and grow more beautiful with every season.", is_new: 0, is_bestseller: 1, sizes: ["Small", "Medium", "Large"], colors: [{ name: "Onyx", hex: "#111111", image: "/images/bag-tote-black.jpg" }, { name: "Cognac", hex: "#9C5A2C", image: "/images/bag-tote-cognac.jpg" }, { name: "Sand", hex: "#D9B79A", image: "/images/bag-tote-cream.jpg" }], details: ["Full-grain vegetable-tanned leather", "Cotton twill lining with interior zip pocket", "Solid brass hardware, hand-burnished", "Dimensions: 38 x 28 x 14 cm"] },
      { slug: "voyager-backpack", name: "Voyager Backpack", tagline: "Quiet structure for loud days.", category: "backpacks", price: 395, compare_at: null, rating: 4.7, reviews: 168, stock: 8, material: "Waxed canvas & leather", description: "Waxed canvas paired with vegetable-tanned leather. Built to wear in, never out - a backpack designed for a decade of mornings.", is_new: 1, is_bestseller: 0, sizes: ["One size"], colors: [{ name: "Olive", hex: "#5A6240", image: "/images/bag-backpack-olive.jpg" }, { name: "Onyx", hex: "#111111", image: "/images/bag-backpack-black.jpg" }], details: ["16oz British waxed canvas", 'Padded laptop sleeve fits up to 15"', "Antique brass buckles", "Dimensions: 44 x 30 x 14 cm"] },
      { slug: "horizon-carry-on", name: "Horizon Carry-On", tagline: "Travel light. Travel forever.", category: "travel", price: 620, compare_at: null, rating: 4.9, reviews: 92, stock: 5, material: "Aerospace polycarbonate", description: "An aerospace-grade polycarbonate shell with whisper-quiet Hinomoto wheels and a TSA-approved aluminum lock. Engineered for the long haul.", is_new: 0, is_bestseller: 0, sizes: ["Carry-on", "Check-in"], colors: [{ name: "Dune", hex: "#D8A87B", image: "/images/bag-travel-sand.jpg" }], details: ["100% polycarbonate hardshell", "Hinomoto silent-glide spinner wheels", "TSA-approved combination lock", "Lifetime warranty"] },
      { slug: "bureau-briefcase", name: "Bureau Briefcase", tagline: "Quiet authority, in leather.", category: "office", price: 540, compare_at: null, rating: 4.8, reviews: 76, stock: 10, material: "Smooth calfskin", description: 'A slim, double-zip briefcase shaped from smooth calfskin. Engineered for laptops up to 16", with a tonal leather-lined interior.', is_new: 0, is_bestseller: 1, sizes: ["Standard"], colors: [{ name: "Espresso", hex: "#3B2418", image: "/images/bag-office-brown.jpg" }], details: ["Smooth Italian calfskin", 'Padded compartment for 16" laptop', "Detachable shoulder strap", "YKK Excella zippers"] },
      { slug: "petite-crossbody", name: "Petite Crossbody", tagline: "Small bag. Big season.", category: "fashion", price: 320, compare_at: null, rating: 4.6, reviews: 143, stock: 18, material: "Polished calfskin", description: "An evening-ready crossbody with a magnetic flap and slim adjustable strap. Just enough room for the essentials - phone, card holder, lipstick.", is_new: 1, is_bestseller: 0, sizes: ["One size"], colors: [{ name: "Bordeaux", hex: "#5B1A24", image: "/images/bag-cross-burgundy.jpg" }], details: ["Polished calfskin with edge paint", "Magnetic flap closure", "Adjustable shoulder strap", "Dimensions: 20 x 16 x 6 cm"] },
      { slug: "campus-daypack", name: "Campus Daypack", tagline: "Four years. One backpack.", category: "college", price: 180, compare_at: 220, rating: 4.7, reviews: 312, stock: 24, material: "Recycled ripstop nylon", description: "A clean, hard-wearing daypack in recycled ripstop nylon. Padded back panel, laptop sleeve, water-bottle pocket - everything you need, nothing you don't.", is_new: 0, is_bestseller: 0, sizes: ["One size"], colors: [{ name: "Midnight", hex: "#152038", image: "/images/bag-college-navy.jpg" }], details: ["100% recycled ripstop nylon", 'Padded sleeve fits 14" laptop', "Water-resistant YKK zippers", "Lifetime repair program"] },
    ];

    for (const p of productsData) {
      const [result] = await conn.query(
        `INSERT IGNORE INTO ${DB}.products (slug, name, tagline, category, price, compare_at, rating, reviews, stock, material, description, is_new, is_bestseller)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.slug, p.name, p.tagline, p.category, p.price, p.compare_at, p.rating, p.reviews, p.stock, p.material, p.description, p.is_new, p.is_bestseller]
      );

      const productId = result.insertId;
      if (!productId) continue; // already exists

      for (const size of p.sizes) {
        await conn.query(`INSERT INTO ${DB}.product_sizes (product_id, size_name) VALUES (?, ?)`, [productId, size]);
      }
      for (const color of p.colors) {
        await conn.query(`INSERT INTO ${DB}.product_colors (product_id, color_name, hex, image_url) VALUES (?, ?, ?, ?)`, [productId, color.name, color.hex, color.image]);
      }
      for (const detail of p.details) {
        await conn.query(`INSERT INTO ${DB}.product_details (product_id, detail_text) VALUES (?, ?)`, [productId, detail]);
      }
    }

    console.log("Seeded 6 products with colors, sizes, and details.");

    // Seed coupons
    await conn.query(`INSERT IGNORE INTO ${DB}.coupons (code, discount_pct) VALUES ('WELCOME10', 10), ('MAISON15', 15), ('ATELIER20', 20)`);
    console.log("Seeded coupons.");

    console.log("\nDatabase initialized successfully!");
    console.log(`   Database: ${env.database.name}`);
    console.log("   Auth:     Firebase users are synced on sign-in.");
    console.log("   Admin:    Set ADMIN_EMAILS to the Firebase email(s) allowed into /admin.\n");
  } catch (err) {
    console.error("Database initialization failed:", err.message);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

if (require.main === module) {
  init().catch(() => process.exit(1));
}

module.exports = init;
