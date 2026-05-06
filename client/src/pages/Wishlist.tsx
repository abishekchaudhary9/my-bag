import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { Product, products } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { productsApi } from "@/lib/api";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

function isProduct(value: Product | undefined): value is Product {
  return Boolean(value);
}

export default function Wishlist() {
  const { state, addToCart } = useStore();
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    setSelected((current) =>
      current.filter((id) => items.some((product) => String(product.id) === id))
    );
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((product) => selected.includes(String(product.id))),
    [items, selected]
  );

  const allSelected = items.length > 0 && selected.length === items.length;

  const toggleProduct = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : items.map((product) => String(product.id)));
  };

  const addProductsToCart = (productsToAdd: Product[]) => {
    const orderable = productsToAdd.filter((product) => product.colors?.[0]);

    orderable.forEach((product) => {
      addToCart(product, {
        color: product.colors[0].name,
        size: product.sizes?.[0] || "One size",
        qty: 1,
      });
    });

    if (orderable.length > 0) {
      toast.success(`${orderable.length} item${orderable.length === 1 ? "" : "s"} added to bag`);
    }

    if (orderable.length < productsToAdd.length) {
      toast.error("Some saved items need a color image before checkout.");
    }

    return orderable.length;
  };

  const handleAddSelected = () => {
    if (selectedItems.length === 0) {
      toast.info("Select at least one product.");
      return;
    }

    addProductsToCart(selectedItems);
  };

  const handleCheckoutSelected = () => {
    if (selectedItems.length === 0) {
      toast.info("Select at least one product.");
      return;
    }

    const added = addProductsToCart(selectedItems);
    if (added > 0) navigate("/cart");
  };

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
          <>
            <div className="mb-8 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
              >
                <span className={`grid h-5 w-5 place-items-center border ${allSelected ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                  {allSelected && <Check className="h-3.5 w-3.5" />}
                </span>
                {allSelected ? "Clear selection" : `Select all ${items.length}`}
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddSelected}
                  disabled={selectedItems.length === 0}
                  className="border border-border px-5 py-3 text-[12px] uppercase tracking-[0.16em] transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add selected to bag
                </button>
                <button
                  type="button"
                  onClick={handleCheckoutSelected}
                  disabled={selectedItems.length === 0}
                  className="inline-flex items-center justify-center gap-2 bg-foreground px-5 py-3 text-[12px] uppercase tracking-[0.16em] text-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                  Checkout selected
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
              {items.map((p, i) => {
                const id = String(p.id);
                const isSelected = selected.includes(id);

                return (
                  <div key={p.id} className="relative">
                    <button
                      type="button"
                      aria-label={isSelected ? `Deselect ${p.name}` : `Select ${p.name}`}
                      onClick={() => toggleProduct(id)}
                      className={`absolute left-3 top-3 z-20 grid h-9 w-9 place-items-center border backdrop-blur-sm transition ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background/85 text-foreground hover:border-foreground"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                    <ProductCard product={p} index={i} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}
