const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

async function seed() {
  const productCount = await Product.countDocuments();
  if (productCount > 0) {
    console.log("Database already seeded. Skipping product seeding.");
    return;
  }

  const productsData = [
    { slug: "atelier-tote", name: "Atelier Tote", tagline: "The everyday carry, perfected.", category: "handbags", price: 480, compare_at: 540, rating: 4.8, reviews: 214, stock: 12, material: "Full-grain Italian leather", description: "A structured tote shaped from a single panel of full-grain leather, finished by hand in our Florentine atelier. Designed to soften, deepen, and grow more beautiful with every season.", is_new: false, is_bestseller: true, sizes: ["Small", "Medium", "Large"], colors: [{ name: "Onyx", hex: "#111111", image_url: "/images/bag-tote-black.jpg" }, { name: "Cognac", hex: "#9C5A2C", image_url: "/images/bag-tote-cognac.jpg" }, { name: "Sand", hex: "#D9B79A", image_url: "/images/bag-tote-cream.jpg" }], details: ["Full-grain vegetable-tanned leather", "Cotton twill lining with interior zip pocket", "Solid brass hardware, hand-burnished", "Dimensions: 38 x 28 x 14 cm"] },
    { slug: "voyager-backpack", name: "Voyager Backpack", tagline: "Quiet structure for loud days.", category: "backpacks", price: 395, compare_at: null, rating: 4.7, reviews: 168, stock: 8, material: "Waxed canvas & leather", description: "Waxed canvas paired with vegetable-tanned leather. Built to wear in, never out - a backpack designed for a decade of mornings.", is_new: true, is_bestseller: false, sizes: ["One size"], colors: [{ name: "Olive", hex: "#5A6240", image_url: "/images/bag-backpack-olive.jpg" }, { name: "Onyx", hex: "#111111", image_url: "/images/bag-backpack-black.jpg" }], details: ["16oz British waxed canvas", 'Padded laptop sleeve fits up to 15"', "Antique brass buckles", "Dimensions: 44 x 30 x 14 cm"] },
    { slug: "horizon-carry-on", name: "Horizon Carry-On", tagline: "Travel light. Travel forever.", category: "travel", price: 620, compare_at: null, rating: 4.9, reviews: 92, stock: 5, material: "Aerospace polycarbonate", description: "An aerospace-grade polycarbonate shell with whisper-quiet Hinomoto wheels and a TSA-approved aluminum lock. Engineered for the long haul.", is_new: false, is_bestseller: false, sizes: ["Carry-on", "Check-in"], colors: [{ name: "Dune", hex: "#D8A87B", image_url: "/images/bag-travel-sand.jpg" }], details: ["100% polycarbonate hardshell", "Hinomoto silent-glide spinner wheels", "TSA-approved combination lock", "Lifetime warranty"] },
    { slug: "bureau-briefcase", name: "Bureau Briefcase", tagline: "Quiet authority, in leather.", category: "office", price: 540, compare_at: null, rating: 4.8, reviews: 76, stock: 10, material: "Smooth calfskin", description: 'A slim, double-zip briefcase shaped from smooth calfskin. Engineered for laptops up to 16", with a tonal leather-lined interior.', is_new: false, is_bestseller: true, sizes: ["Standard"], colors: [{ name: "Espresso", hex: "#3B2418", image_url: "/images/bag-office-brown.jpg" }], details: ["Smooth Italian calfskin", 'Padded compartment for 16" laptop', "Detachable shoulder strap", "YKK Excella zippers"] },
    { slug: "petite-crossbody", name: "Petite Crossbody", tagline: "Small bag. Big season.", category: "fashion", price: 320, compare_at: null, rating: 4.6, reviews: 143, stock: 18, material: "Polished calfskin", description: "An evening-ready crossbody with a magnetic flap and slim adjustable strap. Just enough room for the essentials - phone, card holder, lipstick.", is_new: true, is_bestseller: false, sizes: ["One size"], colors: [{ name: "Bordeaux", hex: "#5B1A24", image_url: "/images/bag-cross-burgundy.jpg" }], details: ["Polished calfskin with edge paint", "Magnetic flap closure", "Adjustable shoulder strap", "Dimensions: 20 x 16 x 6 cm"] },
    { slug: "campus-daypack", name: "Campus Daypack", tagline: "Four years. One backpack.", category: "college", price: 180, compare_at: 220, rating: 4.7, reviews: 312, stock: 24, material: "Recycled ripstop nylon", description: "A clean, hard-wearing daypack in recycled ripstop nylon. Padded back panel, laptop sleeve, water-bottle pocket - everything you need, nothing you don't.", is_new: false, is_bestseller: false, sizes: ["One size"], colors: [{ name: "Midnight", hex: "#152038", image_url: "/images/bag-college-navy.jpg" }], details: ["100% recycled ripstop nylon", 'Padded sleeve fits 14" laptop', "Water-resistant YKK zippers", "Lifetime repair program"] },
  ];

  await Product.insertMany(productsData);
  console.log("Seeded 6 products.");
}

module.exports = seed;
