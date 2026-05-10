const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Abishek/Desktop/Bag/server/src';

const files = {
  'config/database.js': \`const mongoose = require("mongoose");
const env = require("./env");
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri);
    console.log(\\\`MongoDB Connected: \\\${conn.connection.host}\\\`);
  } catch (error) {
    console.error(\\\`Error: \\\${error.message}\\\`);
    process.exit(1);
  }
};
module.exports = connectDB;\`,

  'config/env.js': fs.readFileSync(path.join(baseDir, 'config/env.js'), 'utf8').replace('adminEmails: parseList(process.env.ADMIN_EMAILS || "abishekc441@gmail.com"),', 'adminEmails: parseList(process.env.ADMIN_EMAILS || "abishekc441@gmail.com"),\\n  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/maison_db",'),

  'models/userModel.js': \`const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebase_uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  avatar: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String, default: "Nepal" },
  email_verified: { type: Boolean, default: false },
  password_hash: { type: String },
  created_at: { type: Date, default: Date.now }
});
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: String(obj._id),
    firebase_uid: obj.firebase_uid,
    email: obj.email,
    firstName: obj.first_name,
    lastName: obj.last_name,
    role: obj.role,
    phone: obj.phone,
    avatar: obj.avatar,
    street: obj.street,
    city: obj.city,
    state: obj.state,
    zip: obj.zip,
    country: obj.country,
    emailVerified: obj.email_verified,
    createdAt: obj.created_at
  };
};
module.exports = mongoose.model("User", userSchema);\`,

  'models/productModel.js': \`const mongoose = require("mongoose");
const productColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  image_url: { type: String }
});
const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  compare_at: { type: Number },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  material: { type: String },
  description: { type: String },
  is_new: { type: Boolean, default: false },
  is_bestseller: { type: Boolean, default: false },
  sizes: [String],
  colors: [productColorSchema],
  details: [String],
  created_at: { type: Date, default: Date.now }
});
productSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: String(obj._id),
    slug: obj.slug,
    name: obj.name,
    tagline: obj.tagline,
    category: obj.category,
    price: obj.price,
    compare_at: obj.compare_at,
    rating: obj.rating,
    reviews: obj.reviews,
    stock: obj.stock,
    material: obj.material,
    description: obj.description,
    is_new: obj.is_new,
    is_bestseller: obj.is_bestseller,
    sizes: obj.sizes,
    colors: obj.colors.map(c => ({ name: c.name, hex: c.hex, image: c.image_url })),
    details: obj.details,
    createdAt: obj.created_at
  };
};
module.exports = mongoose.model("Product", productSchema);\`,

  'models/orderModel.js': \`const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  image: { type: String }
});
const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["processing", "shipped", "delivered", "cancelled"], default: "processing" },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  tracking_number: { type: String },
  shipping_address: {
    first_name: { type: String }, last_name: { type: String }, email: { type: String }, phone: { type: String },
    street: { type: String }, city: { type: String }, state: { type: String }, zip: { type: String }, country: { type: String }
  },
  payment_method: { type: String, default: "card" },
  items: [orderItemSchema],
  created_at: { type: Date, default: Date.now }
});
orderSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: String(obj._id), orderNumber: obj.order_number, userId: String(obj.user), status: obj.status,
    subtotal: obj.subtotal, shipping: obj.shipping, discount: obj.discount, total: obj.total, trackingNumber: obj.tracking_number,
    shippingAddress: {
      firstName: obj.shipping_address.first_name, lastName: obj.shipping_address.last_name, email: obj.shipping_address.email,
      phone: obj.shipping_address.phone, street: obj.shipping_address.street, city: obj.shipping_address.city,
      state: obj.shipping_address.state, zip: obj.shipping_address.zip, country: obj.shipping_address.country,
    },
    paymentMethod: obj.payment_method,
    items: obj.items.map(item => ({ name: item.product_name, color: item.color, size: item.size, qty: item.qty, price: item.price, image: item.image })),
    createdAt: obj.created_at
  };
};
module.exports = mongoose.model("Order", orderSchema);\`,

  'services/authService.js': \`const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const env = require("../config/env");
const { getFirebaseAuth } = require("../config/firebase");
const createHttpError = require("../utils/httpError");
const { formatNepalPhone } = require("../utils/validation");
const { emitEvent } = require("../lib/socket");

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function loginWithFirebase({ idToken, profile }) {
  if (!idToken) throw createHttpError(400, "Firebase ID token required");
  profile = profile || {};
  const firebaseAuth = getFirebaseAuth();
  const decoded = await firebaseAuth.verifyIdToken(idToken);
  const firebaseUser = await firebaseAuth.getUser(decoded.uid);
  const email = (decoded.email || firebaseUser.email || "").toLowerCase();
  const dbEmail = email || \\\`phone-\\\${decoded.uid}@phone.maison.local\\\`;
  const role = env.adminEmails.includes(email) ? "admin" : "user";

  let user = await User.findOne({ \$or: [{ firebase_uid: decoded.uid }, { email: dbEmail }] });
  if (user) {
    user.firebase_uid = decoded.uid;
    user.email = dbEmail;
    user.role = role;
    await user.save();
  } else {
    user = new User({
      firebase_uid: decoded.uid, email: dbEmail, role,
      first_name: profile.firstName || "Maison", last_name: profile.lastName || "Customer",
      phone: profile.phone ? formatNepalPhone(profile.phone) : null
    });
    await user.save();
    emitEvent("admins", "new_customer", { customerId: user._id, name: \\\`\\\${user.first_name} \\\${user.last_name}\\\` });
  }
  return { user: user.toJSON(), token: signToken(user.toJSON()) };
}

module.exports = {
  loginWithFirebase,
  getCurrentUser: async (id) => { const u = await User.findById(id); return u.toJSON(); },
  updateProfile: async (id, p) => { const u = await User.findByIdAndUpdate(id, p, { new: true }); return u.toJSON(); },
  updateAvatar: async (id, a) => { const u = await User.findByIdAndUpdate(id, { avatar: a }, { new: true }); return u.toJSON(); },
  signup: () => { throw createHttpError(410, "Moved to Firebase"); },
  login: () => { throw createHttpError(410, "Moved to Firebase"); }
};\`,

  'app.js': fs.readFileSync(path.join(baseDir, 'app.js'), 'utf8')
    .replace('const initDatabase = require("./config/initDatabase");', 'const connectDB = require("./config/database");\\nconst seed = require("./config/seed");')
    .replace('initDatabase();', 'connectDB().then(() => seed());')
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(\\\`Restored \\\${relPath}\\\`);
}
