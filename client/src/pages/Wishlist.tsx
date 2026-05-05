import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { Product, products } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { productsApi } from "@/lib/api";

function isProduct(value: Product | undefined): value is Product {
  return Boolean(value);
}

export default function Wishlist() {
  const { state } = useStore();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list()
      .then(({ products }) => setApiProducts(products as Product[]))
      .catch(() => {});
  }, []);

  const items = useMemo(() => {
    const catalog = [...state.wishlistItems, ...apiProducts, ...products];
    return state.wishlist
      .map((id) => catalog.find((product) => String(product.id) === String(id)))
      .filter(isProduct);
  }, [apiProducts, state.wishlist, state.wishlistItems]);

  return (
    <Layout>
      <section className="container-luxe pt-12 pb-8">
        <div className="eyebrow mb-3">Saved</div>
        <h1 className="font-display text-4xl md:text-5xl">Wishlist</h1>
      </section>
      <section className="container-luxe pb-24">
        {items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            Nothing saved yet.{" "}
            <Link to="/shop" className="link-underline text-foreground">Browse the collection.</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
            {items.map((p, i) => p && <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
