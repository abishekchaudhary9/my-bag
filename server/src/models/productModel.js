const mongoose = require("mongoose");

const productColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  image_url: { type: String }
});

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String },
  category: { 
    type: String, 
    required: true, 
    enum: ["handbags", "backpacks", "travel", "office", "college", "fashion", "accessories"] 
  },
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

// Mapper to maintain compatibility
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
    colors: obj.colors.map(c => ({
      name: c.name,
      hex: c.hex,
      image: c.image_url
    })),
    details: obj.details,
    createdAt: obj.created_at
  };
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
