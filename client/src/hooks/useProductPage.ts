import { useState, useEffect, useCallback } from "react";
import { productsApi } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/data/products";

export function useProductPage(slug: string) {
  const { state: authState, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState<any>(null);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [recommended, setRecommended] = useState<Product[]>([]);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const { product: data } = await productsApi.get(slug);
      if (data) {
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          setColor(data.colors[0]);
        }
        if (data.sizes && data.sizes.length > 0) {
          setSize(data.sizes[0]);
        } else {
          setSize("Universal");
        }

        // Fetch recommended
        const { products: allProducts } = await productsApi.list({ category: data.category });
        setRecommended(allProducts.filter((p: any) => (p.id || p._id) !== (data.id || data._id)).slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const canUseWishlist = authState.isAuthenticated && !isAdmin;

  return {
    product,
    loading,
    color,
    size,
    qty,
    setColor,
    setSize,
    setQty,
    recommended,
    canUseWishlist,
  };
}
