function mapProduct(row, sizes, colors, details) {
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: row.category,
    price: parseFloat(row.price),
    compareAt: row.compare_at ? parseFloat(row.compare_at) : undefined,
    rating: parseFloat(row.rating),
    reviews: row.reviews,
    stock: row.stock,
    material: row.material,
    description: row.description,
    isNew: !!row.is_new,
    isBestseller: !!row.is_bestseller,
    sizes: sizes.map((size) => size.size_name),
    colors: colors.map((color) => ({
      name: color.color_name,
      hex: color.hex,
      image: color.image_url,
    })),
    details: details.map((detail) => detail.detail_text),
  };
}

module.exports = { mapProduct };
