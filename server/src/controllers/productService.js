const Product = require("../models/productModel");
const createHttpError = require("../utils/httpError");

async function listProducts({ category, q }) {
    const filter = {};
    if (category) filter.category = category;
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { material: { $regex: q, $options: "i" } }
        ];
    }

    const products = await Product.find(filter).sort({ created_at: -1 });
    return products.map(p => p.toJSON());
}

async function getProductBySlug(slug) {
    if (!slug || slug === 'undefined') {
        throw createHttpError(400, "Valid product slug is required");
    }

    const product = await Product.findOne({ slug });
    if (!product) {
        throw createHttpError(404, "Product not found");
    }
    return product.toJSON();
}

async function createProduct(data) {
    const product = new Product({
        slug: data.slug,
        name: data.name,
        tagline: data.tagline,
        category: data.category,
        price: data.price,
        compare_at: data.compare_at,
        material: data.material,
        description: data.description,
        is_new: data.is_new,
        is_bestseller: data.is_bestseller,
        stock: data.stock,
        sizes: data.sizes || [],
        colors: data.colors ? data.colors.map(c => ({
            name: c.name,
            hex: c.hex,
            image_url: c.image
        })) : [],
        details: data.details || []
    });

    await product.save();
    return product.toJSON();
}

async function updateProduct(id, data) {
    const updates = { ...data };
    if (data.colors) {
        updates.colors = data.colors.map(c => ({
            name: c.name,
            hex: c.hex,
            image_url: c.image
        }));
    }

    const product = await Product.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!product) {
        throw createHttpError(404, "Product not found");
    }
    return product.toJSON();
}

async function deleteProduct(id) {
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
        throw createHttpError(404, "Product not found");
    }
    return { message: "Product deleted successfully" };
}

async function getProductsByIds(ids) {
    const products = await Product.find({ _id: { $in: ids } });
    return products.map(p => p.toJSON());
}

module.exports = {
    listProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByIds
};
