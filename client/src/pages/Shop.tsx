import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { categories, products as localProducts, Category } from "@/data/products";
import { productsApi } from "@/lib/api";

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · Low to High" },
  { id: "price-desc", label: "Price · High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "new", label: "New Arrivals" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = (params.get("category") as Category | null) ?? null;
  const q = params.get("q") ?? "";
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(700);
  const [minRating, setMinRating] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>(localProducts as any[]);

  useEffect(() => {
    productsApi.list()
      .then((d) => { if (d.products?.length) setAllProducts(d.products); })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (category) list = list.filter((p) => p.category === category);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    list = list.filter((p) => p.price <= maxPrice && (p.rating || 0) >= minRating);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "new": list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew)); break;
    }
    return list;
  }, [allProducts, category, q, sort, maxPrice, minRating]);

  const setCategory = (c: Category | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set("category", c); else next.delete("category");
    setParams(next, { replace: true });
  };

  return (
    <Layout>
      <section className="container-luxe pt-12 md:pt-16 pb-8 animate-fade-up">
        <div className="eyebrow mb-4">{category ? "Category" : "All Bags"}</div>
        <h1 className="font-display text-4xl md:text-6xl capitalize">
          {category ? categories.find((c) => c.id === category)?.label : "The Collection"}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          {filtered.length} pieces · designed for the long carry
        </p>
      </section>

      <section className="container-luxe pb-24 grid lg:grid-cols-[240px_1fr] gap-10 lg:gap-14">
        {/* FILTERS */}
        <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          <div>
            <div className="eyebrow mb-4">Category</div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCategory(null)}
                  className={`text-sm link-underline ${!category ? "text-accent" : ""}`}
                >
                  All
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCategory(c.id)}
                    className={`text-sm link-underline capitalize ${
                      category === c.id ? "text-accent" : ""
                    }`}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Max Price · Rs {maxPrice}</div>
            <input
              type="range"
              min={100}
              max={700}
              step={20}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <div className="eyebrow mb-4">Minimum Rating</div>
            <div className="flex gap-1.5">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`text-xs px-3 py-1.5 border transition ${
                    minRating === r
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-4 hairline">
            <div className="text-sm text-muted-foreground">{filtered.length} results</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm border-b border-border py-1 focus:outline-none focus:border-foreground"
            >
              {sortOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              No pieces match these filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-12">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}