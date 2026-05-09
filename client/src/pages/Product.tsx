import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, RotateCcw, Shield, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { getProduct, products, recommend } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { productsApi, reviewsApi, questionsApi, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import { Edit3, Trash2, MessageSquare, AlertCircle, Send } from "lucide-react";
import PromptModal from "@/components/admin/PromptModal";

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
        .catch(() => { })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-accent", "ring-offset-[12px]");
          setTimeout(() => element.classList.remove("ring-2", "ring-accent", "ring-offset-[12px]"), 4000);
        }
      }, 600);
    }
  }, [loading]);

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
      socket.off("review_update");
      socket.off("question_update");
      socket.off("product_update");
    };
  }, [socket, product?.id, fetchProduct]);

  useEffect(() => {
    if (product) {
      markViewed(product.id);
      // Force reset selections on product change
      setColor(product?.colors?.[0]);
      setSize(product?.sizes?.[0] ?? "");
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
              <h1 className="font-display text-3xl md:text-6xl tracking-tighter leading-[0.95]">{product.name}</h1>
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
                {!isAdmin ? (
                  <>
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
                  </>
                ) : (
                  <Link
                    to="/admin?tab=products"
                    className="flex-1 bg-secondary text-foreground h-16 text-[11px] font-bold uppercase tracking-[0.3em] border border-border flex items-center justify-center gap-4 hover:bg-secondary/80 transition-all"
                  >
                    Management: Edit in Admin Panel
                    <Shield className="h-4 w-4" />
                  </Link>
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

        <ProductReviews productId={product.id} />
        <ProductQuestions productId={product.id} />

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

/* ─── Reviews Section ─────────────────────────────────── */
function ProductReviews({ productId }: { productId: string }) {
  const { state: authState, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [eligible, setEligible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewsApi.get(productId);
      setReviews(data.reviews);
      setStats({ average: data.average, count: data.count });
    } catch (err) {
      console.error("Reviews fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const checkEligibility = useCallback(async () => {
    if (!authState.isAuthenticated || isAdmin) return;
    try {
      const { eligible } = await reviewsApi.checkEligibility(productId);
      setEligible(eligible);
    } catch {
      setEligible(false);
    }
  }, [authState.isAuthenticated, isAdmin, productId]);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [fetchReviews, checkEligibility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return toast.error("Please fill all fields");

    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, { rating, title, body });
      toast.success("Review shared", { description: "Thank you for your feedback." });
      setTitle("");
      setBody("");
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await reviewsApi.delete(id);
      toast.success("Review removed");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || "Could not delete review");
    }
  };

  if (loading && reviews.length === 0) return null;

  return (
    <section className="container-luxe py-24 border-t border-border/30">
      <div className="grid lg:grid-cols-12 gap-16">
        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-8">
          <div className="eyebrow">Customer Experience</div>
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="font-display text-7xl leading-none">{stats.average.toFixed(1)}</span>
              <div className="pb-2">
                <div className="flex text-gold mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(stats.average) ? "fill-current" : "opacity-20"}`} />
                  ))}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Based on {stats.count} reviews</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Maison pieces are crafted to be lived in. See how our community is styling and wearing their collection.
            </p>
          </div>

          {!isAdmin && eligible && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full h-14 border border-foreground text-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all"
            >
              Share Your Experience
            </button>
          )}

          {!authState.isAuthenticated && (
            <Link to="/login" className="block text-center py-4 border border-dashed border-border text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
              Sign in to write a review
            </Link>
          )}
        </div>

        {/* Reviews List / Form */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass p-8 md:p-10 space-y-8"
              >
                <div className="flex justify-between items-center">
                  <div className="eyebrow text-accent">Write a Review</div>
                  <button onClick={() => setShowForm(false)} className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100">Cancel</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Rating</div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className={`h-10 w-10 flex items-center justify-center border transition-all ${rating >= num ? "border-gold text-gold bg-gold/5" : "border-border text-muted-foreground/30"}`}
                        >
                          <Star className={`h-4 w-4 ${rating >= num ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Review Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Exceptional quality"
                      className="w-full bg-background border border-border p-4 text-sm focus:border-accent outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Your Experience</label>
                    <textarea
                      rows={5}
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="Share your thoughts on the material, fit, and craftsmanship..."
                      className="w-full bg-background border border-border p-4 text-sm focus:border-accent outline-none resize-none"
                    />
                  </div>

                  <button
                    disabled={submitting}
                    className="h-14 px-12 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all disabled:opacity-50"
                  >
                    {submitting ? "Sharing..." : "Post Review"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {reviews.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-border text-muted-foreground/60 font-light italic">
                    No reviews yet. Be the first to share your experience.
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div id={`review-${r.id}`} key={r.id} className="group pb-10 border-b border-border/30 last:border-0 transition-all duration-500">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex text-gold gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-current" : "opacity-20"}`} />
                            ))}
                          </div>
                          <h4 className="font-medium text-lg leading-tight">{r.title}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase tracking-widest">{r.name}</div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Verified Client</div>
                        </div>
                      </div>
                      <p className="text-muted-foreground font-light leading-relaxed text-sm mb-6 max-w-2xl">
                        {r.text}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                          {new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </div>

                        {(authState.user?.id === r.user_id || isAdmin) && (
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditTarget(r)}
                              className="text-[9px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="h-3 w-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-[9px] font-bold uppercase tracking-widest text-destructive hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {r.adminReply && (
                        <div className="mt-8 p-6 bg-secondary/30 border-l-2 border-accent/50 space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-accent">
                            <Shield className="h-3 w-3" /> Maison Atelier Response
                          </div>
                          <p className="text-sm font-light italic opacity-80">{r.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {editTarget && (
        <PromptModal
          title="Edit Your Review"
          label="Review Body"
          defaultValue={editTarget.text}
          confirmLabel="Update Review"
          onConfirm={async (text) => {
            await reviewsApi.edit(editTarget.id, { rating: editTarget.rating, title: editTarget.title, body: text });
            toast.success("Review updated");
            setEditTarget(null);
            fetchReviews();
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </section>
  );
}

/* ─── FAQ Section (Questions) ────────────────────────── */
function ProductQuestions({ productId }: { productId: string }) {
  const { state: authState, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await questionsApi.get(productId);
      setQuestions(data.questions);
    } catch (err) {
      console.error("Questions fetch failed", err);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await questionsApi.submit(productId, { text });
      toast.success("Question sent", { description: "The atelier will respond shortly." });
      setText("");
      setShowForm(false);
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Failed to send question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await questionsApi.delete(id);
      toast.success("Question removed");
      fetchQuestions();
    } catch (err: any) {
      toast.error(err.message || "Could not delete question");
    }
  };

  return (
    <section className="container-luxe py-24 border-t border-border/30 bg-secondary/5">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="eyebrow text-accent">Atelier Concierge</div>
          <h2 className="font-display text-4xl md:text-5xl">Curated Questions</h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Have a question about specific dimensions, materials, or care? Our atelier team is here to assist.
          </p>
        </div>

        <div className="space-y-8">
          {questions.map((q) => (
            <div id={`question-${q.id}`} key={q.id} className="group border-b border-border/30 pb-8 last:border-0 transition-all duration-500">
              <div className="flex gap-4 items-start mb-4">
                <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-base">{q.text}</p>
                    {(authState.user?.id === q.user_id || isAdmin) && (
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditTarget(q)}
                          className="text-accent hover:underline"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">
                    Asked by {q.name || "Client"} · {new Date(q.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {q.answer ? (
                <div className="ml-12 p-5 bg-background border border-border/50 rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Atelier Response
                  </div>
                  <p className="text-sm font-light leading-relaxed italic opacity-80">{q.answer}</p>
                </div>
              ) : (
                <div className="ml-12 flex items-center gap-2 text-[10px] text-muted-foreground/40 italic">
                  <AlertCircle className="h-3.5 w-3.5" /> Awaiting response from the concierge
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && !showForm && (
            <div className="text-center py-10 opacity-40 font-light italic text-sm">
              No questions yet.
            </div>
          )}
        </div>

        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => {
                if (!authState.isAuthenticated) return navigate("/login");
                setShowForm(true);
              }}
              className="px-10 py-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all"
            >
              Ask the Atelier
            </button>
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleSubmit}
            className="glass p-8 space-y-6"
          >
            <div className="eyebrow text-accent">New Inquiry</div>
            <textarea
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What would you like to know about this piece?"
              className="w-full bg-background border border-border p-4 text-sm focus:border-accent outline-none resize-none"
            />
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                disabled={submitting || !text.trim()}
                className="bg-foreground text-background px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? "Sending..." : <>Send Inquiry <Send className="h-3 w-3" /></>}
              </button>
            </div>
          </motion.form>
        )}
      </div>
      {editTarget && (
        <PromptModal
          title="Edit Your Question"
          label="Question Text"
          defaultValue={editTarget.text}
          confirmLabel="Update Question"
          onConfirm={async (text) => {
            await questionsApi.edit(editTarget.id, { text });
            toast.success("Question updated");
            setEditTarget(null);
            fetchQuestions();
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </section>
  );
}
