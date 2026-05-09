import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, RotateCcw, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { getProduct, products, recommend } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { productsApi, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const localProduct = getProduct(slug);
  const [apiProduct, setApiProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const product = apiProduct || localProduct;

  const { addToCart, toggleWish, isWished, markViewed, state } = useStore();
  const { isAdmin, state: authState, socket } = useAuth();
  const navigate = useNavigate();
  const [color, setColor] = useState(product?.colors?.[0]);
  const [size, setSize] = useState(product?.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const canUseWishlist = authState.isAuthenticated && !isAdmin;

  const containerRef = useRef(null);

  const fetchProduct = useCallback(() => {
    if (slug) {
      productsApi.get(slug)
        .then((d) => { if (d.product) setApiProduct(d.product); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (!socket || !product?.id) return;

    const productId = product.id;
    socket.emit("join_product", productId);

    socket.on("stock_update", (data) => {
      if (data.productId === productId) {
        setApiProduct((prev: any) => prev ? { ...prev, stock: data.stock } : prev);
      }
    });

    socket.on("new_review", () => fetchProduct());
    socket.on("new_question", () => fetchProduct());
    socket.on("product_update", () => fetchProduct());

    return () => {
      socket.emit("leave_product", productId);
      socket.off("stock_update");
      socket.off("new_review");
      socket.off("new_question");
      socket.off("product_update");
    };
  }, [socket, product?.id, fetchProduct]);

  useEffect(() => {
    if (product) {
      markViewed(product.id);
      if (!color) setColor(product?.colors?.[0]);
      if (!size) setSize(product?.sizes?.[0] ?? "");
    }
    setQty(1);
  }, [product?.id]);

  if (loading) return (
    <Layout>
      <div className="h-screen flex items-center justify-center">
        <div className="font-display text-4xl animate-pulse tracking-widest uppercase opacity-20">Maison</div>
      </div>
    </Layout>
  );

  if (!product || !color) return (
    <Layout>
      <div className="container-luxe py-40 text-center space-y-6">
        <h1 className="font-display text-4xl">The piece you seek is currently unavailable.</h1>
        <Link to="/shop" className="inline-block text-[10px] font-bold uppercase tracking-widest link-underline">Return to collection</Link>
      </div>
    </Layout>
  );

  const recs = recommend(product).slice(0, 3);

  return (
    <Layout>
      <div ref={containerRef}>
        <div className="container-luxe pt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-foreground capitalize">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </div>

        <section className="container-luxe py-12 md:py-20 grid lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/5] bg-secondary overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={color.name}
                  src={resolveAssetUrl(color.image)}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                  alt={product.name}
                />
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-4 gap-4">
               {(product.colors || []).map(c => (
                 <button 
                  key={c.name}
                  onClick={() => setColor(c)}
                  className={`aspect-square overflow-hidden bg-secondary border-2 transition-all duration-500 ${color.name === c.name ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                   <img src={resolveAssetUrl(c.image)} className="w-full h-full object-cover" alt="" />
                 </button>
               ))}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-10">
            <div className="space-y-4">
              <div className="eyebrow">{product.category} · Handcrafted</div>
              <h1 className="font-display text-5xl md:text-6xl tracking-tighter leading-[0.95]">{product.name}</h1>
              <p className="text-xl text-muted-foreground font-light italic opacity-80">{product.tagline}</p>
            </div>

            <div className="flex items-center gap-6 pb-6 border-b border-border/50">
               <div className="text-3xl font-medium tracking-tight">Rs {product.price}</div>
               {product.compareAt && <div className="text-lg text-muted-foreground line-through opacity-50">Rs {product.compareAt}</div>}
               <div className="ml-auto flex items-center gap-2">
                 <div className="flex text-gold">
                   {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />)}
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{product.reviews} Reviews</span>
               </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Color: <span className="text-accent">{color.name}</span></div>
                <div className="flex gap-4">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${color.name === c.name ? 'border-accent scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {product.sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Size</div>
                    <button className="text-[9px] font-bold uppercase tracking-widest link-underline">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${size === s ? 'bg-foreground text-background' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    if (!authState.isAuthenticated) { navigate("/login"); return; }
                    addToCart(product, { color: color.name, size: size || "Universal", qty });
                    toast.success("Added to Bag", { description: product.name });
                  }}
                  className="flex-1 bg-foreground text-background h-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500 flex items-center justify-center gap-4 group"
                >
                  Add to Bag
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                </button>
                {canUseWishlist && (
                  <button 
                    onClick={() => toggleWish(product)}
                    className={`h-16 w-16 glass flex items-center justify-center transition-all ${isWished(product.id) ? 'text-accent' : 'hover:text-accent'}`}
                  >
                    <Heart className={`h-5 w-5 ${isWished(product.id) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-4 p-4 glass">
                 <Truck className="h-5 w-5 text-accent" strokeWidth={1} />
                 <div className="text-[9px] font-bold uppercase tracking-widest">Free Shipping</div>
              </div>
              <div className="flex items-center gap-4 p-4 glass">
                 <RotateCcw className="h-5 w-5 text-accent" strokeWidth={1} />
                 <div className="text-[9px] font-bold uppercase tracking-widest">Heritage Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary/10 py-24 md:py-32">
          <div className="container-luxe grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="eyebrow">The Details</div>
              <h2 className="font-display text-4xl md:text-6xl leading-tight">Masterfully shaped in our Florentine atelier.</h2>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed font-light text-lg">
                  Every Maison piece is a testament to the quiet power of honest materials and meticulous craftsmanship.
                </p>
                <ul className="grid grid-cols-2 gap-x-10 gap-y-6">
                  {product.details?.slice(0, 4).map((d: string, i: number) => (
                    <li key={i} className="flex items-center gap-4">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
               <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Craftsmanship" />
            </div>
          </div>
        </section>

        {recs.length > 0 && (
          <section className="container-luxe py-24 md:py-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-3xl md:text-5xl">You may also like</h2>
              <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest link-underline">View all pieces</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recs.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
