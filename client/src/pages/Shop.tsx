import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard"; // v1.0.1
import { categories, products as localProducts, Category } from "@/data/products";
import { productsApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

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
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>(localProducts as any[]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productsApi.list()
      .then((d) => { if (d.products?.length) setAllProducts(d.products); })
      .catch(() => {});
  }, []);

  // Scroll to top when category or search changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category, q]);

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
      default: break; // Featured / Default
    }
    return list;
  }, [allProducts, category, q, sort, maxPrice, minRating]);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const setCategory = (c: Category | null) => {
    const next = new URLSearchParams(params);
    if (c) next.set("category", c); else next.delete("category");
    setParams(next, { replace: true });
    setIsFiltersOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="eyebrow">Category</div>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setCategory(null)}
              className={`text-[12px] font-bold uppercase tracking-widest transition-all ${!category ? "text-accent pl-2 border-l-2 border-accent" : "text-muted-foreground hover:text-foreground"}`}
            >
              All Collections
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategory(c.id)}
                className={`text-[12px] font-bold uppercase tracking-widest transition-all capitalize ${
                  category === c.id ? "text-accent pl-2 border-l-2 border-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6">
        <div className="eyebrow">Price Range</div>
        <div className="space-y-4">
          <input
            type="range"
            min={100}
            max={50000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>Rs 100</span>
            <span>Up to Rs {maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="eyebrow">Minimal Rating</div>
        <div className="flex gap-2">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`h-10 w-10 flex items-center justify-center text-[11px] font-bold border transition-all ${minRating === r ? "bg-foreground text-background border-foreground" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50"}`}
            >
              {r}+
            </button>
          ))}
          <button
            onClick={() => setMinRating(0)}
            className={`h-10 w-10 flex items-center justify-center text-[11px] font-bold border transition-all ${minRating === 0 ? "bg-foreground text-background border-foreground" : "bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50"}`}
          >
            All
          </button>
        </div>
      </div>

      <button 
        onClick={() => { setCategory(null); setMaxPrice(50000); setMinRating(0); setIsFiltersOpen(false); }}
        className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] bg-secondary/50 hover:bg-secondary transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <Layout>
      <div ref={containerRef}>
        <section className="bg-secondary/10 border-b border-border/50">
          <div className="container-luxe pt-24 md:pt-32 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="eyebrow mb-6 text-accent tracking-[0.3em]">
                {category ? "Category" : "The House"}
              </div>
              <h1 className="font-display text-5xl md:text-8xl capitalize tracking-tighter leading-none mb-6">
                {category ? categories.find((c) => c.id === category)?.label : "The Collection"}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between">
                <p className="text-muted-foreground max-w-xl font-light text-base md:text-lg">
                  A curated selection of {filtered.length} pieces, designed in Florence and built for a lifetime of exploration.
                </p>
                
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <button 
                    onClick={() => setIsFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-border px-6 py-3 hover:bg-secondary transition-colors"
                  >
                    <div className="flex flex-col gap-1 w-4">
                      <div className="h-0.5 w-full bg-current" />
                      <div className="h-0.5 w-2/3 bg-current" />
                      <div className="h-0.5 w-full bg-current" />
                    </div>
                    Filters
                  </button>

                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sort By</span>
                    <select 
                      value={sort} 
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-transparent border-none text-[10px] md:text-sm font-bold uppercase tracking-widest focus:ring-0 cursor-pointer"
                    >
                      {sortOptions.map(opt => (
                        <option key={opt.id} value={opt.id} className="bg-background">{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container-luxe py-12 md:py-20 grid lg:grid-cols-[260px_1fr] gap-16">
          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block space-y-12 lg:sticky lg:top-32 lg:self-start">
            <FilterContent />
          </aside>

          {/* PRODUCT GRID */}
          <div className="space-y-12">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12 md:gap-y-20">
                <AnimatePresence mode="popLayout">
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center space-y-4"
              >
                <div className="font-display text-3xl">No pieces found</div>
                <p className="text-muted-foreground font-light">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => { setCategory(null); setMaxPrice(50000); setMinRating(0); }}
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] link-underline"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </div>
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFiltersOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-background border-l border-border z-[70] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="eyebrow">Refine Collection</div>
                <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                  <div className="h-6 w-6 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-foreground rotate-45 absolute" />
                    <div className="w-full h-0.5 bg-foreground -rotate-45 absolute" />
                  </div>
                </button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}