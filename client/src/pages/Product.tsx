import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, RotateCcw, Shield } from "lucide-react";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { getProduct, products, recommend } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { productsApi, reviewsApi, questionsApi } from "@/lib/api";
import { toast } from "sonner";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const localProduct = getProduct(slug);
  const [apiProduct, setApiProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const product = apiProduct || localProduct;

  const { addToCart, toggleWish, isWished, markViewed, state } = useStore();
  const { isAdmin, state: authState } = useAuth();
  const navigate = useNavigate();
  const [color, setColor] = useState(product?.colors?.[0]);
  const [size, setSize] = useState(product?.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);

  // Always fetch from API to get the correct database ID
  useEffect(() => {
    if (slug) {
      productsApi.get(slug)
        .then((d) => { if (d.product) setApiProduct(d.product); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug]);

  useEffect(() => {
    if (product) markViewed(product.id);
    setColor(product?.colors?.[0]);
    setSize(product?.sizes?.[0] ?? "");
    setQty(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center">
          <div className="font-display text-3xl animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!product || !color) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center">
          <h1 className="font-display text-3xl">Piece not found</h1>
          <Link to="/shop" className="mt-6 inline-block link-underline">Back to the collection</Link>
        </div>
      </Layout>
    );
  }

  const recs = recommend(product, 3);
  const recent = state.recent
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const handleAdd = () => {
    if (!authState.isAuthenticated) {
      toast.info("Sign in required", { description: "Please sign in to add items to your bag." });
      navigate("/login");
      return;
    }
    if (isAdmin) {
      toast.error("Admin accounts cannot place orders", { description: "Please use a customer account to shop." });
      return;
    }
    addToCart(product, { color: color.name, size, qty });
    toast.success(`${product.name} added`, { description: `${color.name} · ${size}` });
  };

  const handleWishToggle = () => {
    if (!authState.isAuthenticated) {
      toast.info("Sign in required", { description: "Please sign in to save items to your wishlist." });
      navigate("/login");
      return;
    }
    if (isAdmin) {
      toast.error("Admin accounts cannot use wishlist");
      return;
    }
    toggleWish(product);
  };

  return (
    <Layout>
      {/* breadcrumb */}
      <div className="container-luxe pt-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-foreground capitalize">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="container-luxe py-10 grid lg:grid-cols-12 gap-10 lg:gap-16">
        {/* GALLERY */}
        <div className="lg:col-span-7 animate-fade-in">
          <div
            className="relative aspect-[4/5] bg-secondary overflow-hidden cursor-zoom-in"
            onClick={() => setZoom((z) => !z)}
          >
            {product.colors.map((c) => (
              <img
                key={c.name}
                src={c.image}
                alt={`${product.name} — ${c.name}`}
                width={1200}
                height={1500}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-luxe ${
                  c.name === color.name ? "opacity-100" : "opacity-0"
                } ${zoom && c.name === color.name ? "scale-150" : "scale-100"}`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                className={`aspect-square overflow-hidden bg-secondary border transition ${
                  color.name === c.name ? "border-foreground" : "border-transparent hover:border-border"
                }`}
                aria-label={`View ${c.name}`}
              >
                <img src={c.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start animate-fade-up">
          <div className="eyebrow mb-3 capitalize">{product.category}</div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
          <p className="mt-3 text-muted-foreground italic font-display text-lg">{product.tagline}</p>

          <div className="mt-5 flex items-center gap-4">
            <div className="text-2xl">Rs {product.price}</div>
            {product.compareAt && (
              <div className="text-base text-muted-foreground line-through">Rs {product.compareAt}</div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" strokeWidth={1} />
              {product.rating} <span className="opacity-60">· {product.reviews}</span>
            </div>
          </div>

          <div className="mt-8 hairline pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow">Color</div>
              <div className="text-sm">{color.name}</div>
            </div>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  aria-label={c.name}
                  className={`h-9 w-9 rounded-full border transition ${
                    color.name === c.name
                      ? "ring-1 ring-offset-2 ring-offset-background ring-foreground"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {product.sizes.length > 1 && (
            <div className="mt-6 hairline pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="eyebrow">Size</div>
                <button className="text-xs text-muted-foreground link-underline">Size guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2.5 text-sm border transition ${
                      size === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-secondary transition" aria-label="Decrease">
                <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <div className="w-10 text-center text-sm">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-secondary transition" aria-label="Increase">
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-foreground text-background py-3.5 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
            >
              Add to bag — Rs {product.price * qty}
            </button>
            <button
              onClick={handleWishToggle}
              aria-label="Wishlist"
              className="p-3.5 border border-border hover:border-foreground transition"
            >
              <Heart className={`h-4 w-4 ${isWished(product.id) ? "fill-accent text-accent" : ""}`} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
            In stock · ships within 48 hours · arrives by{" "}
            {new Date(Date.now() + 5 * 86400000).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </div>

          <p className="mt-8 leading-relaxed text-foreground/85">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {product.details.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="text-accent">—</span> {d}
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            <Perk icon={Truck} label="Free shipping over Rs 250" />
            <Perk icon={RotateCcw} label="30-day returns" />
            <Perk icon={Shield} label="Lifetime repairs" />
          </div>
        </div>
      </section>

      {/* REVIEWS & QUESTIONS (Only if product is synced to database) */}
      {(typeof product.id === "number" || !isNaN(Number(product.id)) || apiProduct) && (
        <>
          <ReviewsSection productId={product.id.toString()} productRating={product.rating} productReviews={product.reviews} />
          <QuestionsSection productId={product.id.toString()} />
        </>
      )}

      {/* RECOMMENDATIONS */}
      <section className="container-luxe py-20">
        <div className="eyebrow mb-3">You may also like</div>
        <h2 className="font-display text-3xl md:text-5xl mb-12">Frequently paired with</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-12">
          {recs.map((r, i) => (
            <ProductCard key={r.id} product={r} index={i} />
          ))}
        </div>
      </section>

      {/* RECENTLY VIEWED */}
      {recent.length > 0 && (
        <section className="container-luxe pb-24">
          <div className="eyebrow mb-3">Recently viewed</div>
          <h2 className="font-display text-2xl md:text-3xl mb-8">Your last carries</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
            {recent.map((p, i) => p && <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </Layout>
  );
}

function Perk({ icon: Icon, label }: { icon: typeof Truck; label: string }) {
  return (
    <div className="flex flex-col items-start gap-2 p-3 bg-secondary/60">
      <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
      <div className="text-[11px] leading-tight">{label}</div>
    </div>
  );
}

const SAMPLE_REVIEWS = [
  { id: 0, name: "Elena R.", rating: 5, title: "Better in person", text: "The leather is exceptional. Soft, structured, and the stitching is impeccable. Worth every cent." },
  { id: 1, name: "Marcus T.", rating: 5, title: "Made for daily life", text: "I've carried this every day for three months and it's only gotten more beautiful. The patina is incredible." },
  { id: 2, name: "Aiko S.", rating: 4, title: "Quietly luxurious", text: "Exactly the understated piece I was looking for. The cognac shade is perfect — warm without being loud." },
];

function ReviewsSection({ productId, productRating, productReviews }: { productId: string; productRating: number; productReviews: number }) {
  const { state: authState, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<any[]>(SAMPLE_REVIEWS);
  const [avgRating, setAvgRating] = useState(productRating || 0);
  const [totalReviews, setTotalReviews] = useState(productReviews || 0);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [replyingToReview, setReplyingToReview] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  useEffect(() => {
    reviewsApi.get(productId)
      .then((d) => {
        if (d.reviews.length > 0) {
          setReviews(d.reviews);
          setAvgRating(d.average);
          setTotalReviews(d.count);
        }
      })
      .catch(() => {});

    // Check if logged-in user can review
    if (authState.isAuthenticated && !isAdmin) {
      reviewsApi.checkEligibility(productId)
        .then((d) => { setEligible(d.eligible); setEligibilityReason(d.reason); })
        .catch(() => {});
    }
  }, [productId, authState.isAuthenticated, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) { toast.error("Please fill in all fields"); return; }
    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, { rating: formRating, title: formTitle, body: formBody });
      toast.success("Review submitted!");
      setShowForm(false);
      setEligible(false);
      setEligibilityReason("already_reviewed");
      setFormTitle(""); setFormBody(""); setFormRating(5);
      const d = await reviewsApi.get(productId);
      setReviews(d.reviews); setAvgRating(d.average); setTotalReviews(d.count);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  const eligibilityMessage = () => {
    if (eligibilityReason === "already_reviewed") return "You've already reviewed this product.";
    if (eligibilityReason === "no_delivered_order") return "You can review after your order is delivered.";
    return null;
  };

  const handleAdminReply = async (reviewId: number) => {
    if (!replyText.trim()) return;
    try {
      await reviewsApi.reply(reviewId, { reply: replyText });
      toast.success("Reply added");
      setReplyingToReview(null);
      setReplyText("");
      const d = await reviewsApi.get(productId);
      setReviews(d.reviews);
    } catch (err: any) {
      toast.error(err.message || "Failed to add reply");
    }
  };

  const startEditReview = (r: any) => {
    setEditingReviewId(r.id);
    setEditRating(r.rating);
    setEditTitle(r.title);
    setEditBody(r.text);
  };

  const handleEditReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editBody.trim() || !editingReviewId) return;
    try {
      await reviewsApi.edit(editingReviewId, { rating: editRating, title: editTitle, body: editBody });
      toast.success("Review updated!");
      setEditingReviewId(null);
      const d = await reviewsApi.get(productId);
      setReviews(d.reviews); setAvgRating(d.average); setTotalReviews(d.count);
    } catch (err: any) { toast.error(err.message || "Failed to update review"); }
  };

  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;
    try {
      await reviewsApi.delete(deletingReviewId);
      toast.success("Review deleted");
      const d = await reviewsApi.get(productId);
      setReviews(d.reviews); setAvgRating(d.average); setTotalReviews(d.count);
      setEligible(true); setEligibilityReason(null);
      setDeletingReviewId(null);
    } catch (err: any) { toast.error(err.message || "Failed to delete review"); }
  };

  return (
    <section className="container-luxe py-16 hairline">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="eyebrow mb-3">Reviews</div>
          <div className="font-display text-5xl">{avgRating}</div>
          <div className="flex gap-0.5 mt-2 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-gold" : ""}`} strokeWidth={1} />
            ))}
          </div>
          <div className="text-sm text-muted-foreground mt-2">{totalReviews} verified reviews</div>

          {/* Review button / status */}
          {authState.isAuthenticated && !isAdmin && eligible === true && !showForm && (
            <button onClick={() => setShowForm(true)} className="mt-6 bg-foreground text-background px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
              Write a Review
            </button>
          )}
          {authState.isAuthenticated && !isAdmin && eligible === false && (
            <div className="mt-6 text-xs text-muted-foreground italic">
              {eligibilityMessage()}
            </div>
          )}
          {!authState.isAuthenticated && (
            <div className="mt-6 text-xs text-muted-foreground">
              <Link to="/login" className="link-underline text-accent">Sign in</Link> to write a review
            </div>
          )}
        </div>
        <div className="md:col-span-8 space-y-8">
          {/* Review Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-6 bg-secondary/30 border border-border space-y-4 animate-fade-up">
              <div className="eyebrow">Your Review</div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Rating</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormRating(s)}
                      className="p-0.5"
                    >
                      <Star className={`h-5 w-5 transition-colors ${s <= (hoverRating || formRating) ? "fill-gold text-gold" : "text-muted-foreground"}`} strokeWidth={1} />
                    </button>
                  ))}
                </div>
              </div>
              <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Review title" required
                className="w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
              <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="Share your experience..." rows={3} required
                className="w-full bg-transparent border border-border focus:border-foreground p-3 text-sm focus:outline-none resize-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="bg-foreground text-background px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-border text-[11px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Review List */}
          {reviews.map((r) => (
            <article key={r.id} className="hairline pb-8 last:border-0 relative">
              {editingReviewId === r.id ? (
                <form onSubmit={handleEditReviewSubmit} className="p-6 bg-secondary/30 border border-border space-y-4 animate-fade-in">
                  <div className="eyebrow">Edit Review</div>
                  <div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setEditRating(s)} className="p-0.5">
                          <Star className={`h-5 w-5 transition-colors ${s <= (hoverRating || editRating) ? "fill-gold text-gold" : "text-muted-foreground"}`} strokeWidth={1} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Review title" required className="w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
                  <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} placeholder="Share your experience..." rows={3} required className="w-full bg-transparent border border-border focus:border-foreground p-3 text-sm focus:outline-none resize-none" />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-foreground text-background px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">Save</button>
                    <button type="button" onClick={() => setEditingReviewId(null)} className="px-6 py-2.5 border border-border text-[11px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.name} · Verified buyer</div>
                    </div>
                    <div className="flex gap-0.5 text-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-gold" : ""}`} strokeWidth={1} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{r.text}</p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
                    {authState.user?.id == r.userId && (
                      deletingReviewId === r.id ? (
                        <div className="flex items-center gap-3 animate-fade-in">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic hidden sm:inline">Confirm delete?</span>
                          <button onClick={handleDeleteReview} className="text-[10px] uppercase tracking-wider text-background bg-destructive px-3 py-1 hover:opacity-90 transition-opacity">Delete</button>
                          <button onClick={() => setDeletingReviewId(null)} className="text-[10px] uppercase tracking-wider text-foreground hover:opacity-70 px-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEditReview(r)} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Edit</button>
                          <button onClick={() => setDeletingReviewId(r.id)} className="text-[10px] uppercase tracking-wider text-destructive hover:opacity-80">Delete</button>
                        </div>
                      )
                    )}
                  </div>
                  
                  {r.adminReply && (
                    <div className="mt-4 p-4 bg-secondary/50 border-l-2 border-foreground">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1">Maison Reply</div>
                      <p className="text-sm text-muted-foreground">{r.adminReply}</p>
                    </div>
                  )}

                  {isAdmin && !r.adminReply && replyingToReview !== r.id && (
                    <button onClick={() => { setReplyingToReview(r.id); setReplyText(""); }} className="mt-3 text-xs uppercase tracking-wider text-accent link-underline">
                      Add Reply
                    </button>
                  )}

                  {replyingToReview === r.id && (
                    <div className="mt-4">
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} placeholder="Admin reply..." className="w-full bg-transparent border border-border p-2 text-sm focus:outline-none resize-none" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleAdminReply(r.id)} className="bg-foreground text-background px-4 py-1.5 text-[10px] uppercase tracking-wider hover:bg-accent transition-colors">Submit</button>
                        <button onClick={() => setReplyingToReview(null)} className="px-4 py-1.5 border border-border text-[10px] uppercase tracking-wider hover:border-foreground transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuestionsSection({ productId }: { productId: string }) {
  const { state: authState, isAdmin } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answeringQuestion, setAnsweringQuestion] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);

  useEffect(() => {
    questionsApi.get(productId)
      .then((d) => setQuestions(d.questions))
      .catch(() => {});
  }, [productId]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);
    try {
      await questionsApi.submit(productId, { text: questionText });
      toast.success("Question submitted!");
      setShowForm(false);
      setQuestionText("");
      const d = await questionsApi.get(productId);
      setQuestions(d.questions);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit question");
    } finally { setSubmitting(false); }
  };

  const handleAdminAnswer = async (questionId: number) => {
    if (!answerText.trim()) return;
    try {
      await questionsApi.answer(questionId, { answer: answerText });
      toast.success("Answer added");
      setAnsweringQuestion(null);
      setAnswerText("");
      const d = await questionsApi.get(productId);
      setQuestions(d.questions);
    } catch (err: any) {
      toast.error(err.message || "Failed to add answer");
    }
  };

  const startEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.text);
  };

  const handleEditQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuestionText.trim() || !editingQuestionId) return;
    try {
      await questionsApi.edit(editingQuestionId, { text: editQuestionText });
      toast.success("Question updated!");
      setEditingQuestionId(null);
      const d = await questionsApi.get(productId);
      setQuestions(d.questions);
    } catch (err: any) { toast.error(err.message || "Failed to update question"); }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestionId) return;
    try {
      await questionsApi.delete(deletingQuestionId);
      toast.success("Question deleted");
      const d = await questionsApi.get(productId);
      setQuestions(d.questions);
      setDeletingQuestionId(null);
    } catch (err: any) { toast.error(err.message || "Failed to delete question"); }
  };

  if (questions.length === 0 && !authState.isAuthenticated) {
    return null; // hide if empty and not logged in to save space
  }

  return (
    <section className="container-luxe pb-16 hairline-bottom">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="eyebrow mb-3">Q&A</div>
          <h2 className="font-display text-3xl">Questions</h2>
          {authState.isAuthenticated && !isAdmin && !showForm && (
            <button onClick={() => setShowForm(true)} className="mt-6 bg-foreground text-background px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
              Ask a Question
            </button>
          )}
          {!authState.isAuthenticated && (
            <div className="mt-6 text-xs text-muted-foreground">
              <Link to="/login" className="link-underline text-accent">Sign in</Link> to ask a question
            </div>
          )}
        </div>
        
        <div className="md:col-span-8 space-y-8">
          {showForm && (
            <form onSubmit={handleAskQuestion} className="p-6 bg-secondary/30 border border-border space-y-4 animate-fade-up">
              <div className="eyebrow">Your Question</div>
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="What would you like to know?" rows={2} required
                className="w-full bg-transparent border border-border focus:border-foreground p-3 text-sm focus:outline-none resize-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="bg-foreground text-background px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit Question"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-border text-[11px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {questions.length === 0 && !showForm && (
            <div className="text-sm text-muted-foreground italic py-4">No questions yet. Be the first to ask!</div>
          )}

          {questions.map((q) => (
            <article key={q.id} className="hairline pb-8 last:border-0 relative">
              {editingQuestionId === q.id ? (
                <form onSubmit={handleEditQuestionSubmit} className="p-6 bg-secondary/30 border border-border space-y-4 animate-fade-in">
                  <div className="eyebrow">Edit Question</div>
                  <textarea value={editQuestionText} onChange={(e) => setEditQuestionText(e.target.value)} required rows={2} className="w-full bg-transparent border border-border focus:border-foreground p-3 text-sm focus:outline-none resize-none" />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-foreground text-background px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">Save</button>
                    <button type="button" onClick={() => setEditingQuestionId(null)} className="px-6 py-2.5 border border-border text-[11px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="font-medium mb-1">Q: {q.text}</div>
                  <div className="text-xs text-muted-foreground flex justify-between items-center mb-4">
                    <span>Asked by {q.name} on {new Date(q.date).toLocaleDateString()}</span>
                    {authState.user?.id == q.userId && (
                      deletingQuestionId === q.id ? (
                        <div className="flex items-center gap-3 animate-fade-in">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic hidden sm:inline">Confirm delete?</span>
                          <button onClick={handleDeleteQuestion} className="text-[10px] uppercase tracking-wider text-background bg-destructive px-3 py-1 hover:opacity-90 transition-opacity">Delete</button>
                          <button onClick={() => setDeletingQuestionId(null)} className="text-[10px] uppercase tracking-wider text-foreground hover:opacity-70 px-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEditQuestion(q)} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Edit</button>
                          <button onClick={() => setDeletingQuestionId(q.id)} className="text-[10px] uppercase tracking-wider text-destructive hover:opacity-80">Delete</button>
                        </div>
                      )
                    )}
                  </div>
                  
                  {q.answer ? (
                    <div className="p-4 bg-secondary/50 border-l-2 border-foreground">
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1">Maison Answer</div>
                      <p className="text-sm text-muted-foreground">{q.answer}</p>
                    </div>
                  ) : (
                    isAdmin ? (
                      answeringQuestion !== q.id ? (
                        <button onClick={() => { setAnsweringQuestion(q.id); setAnswerText(""); }} className="text-xs uppercase tracking-wider text-accent link-underline">
                          Answer Question
                        </button>
                      ) : (
                        <div className="mt-4">
                          <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} rows={2} placeholder="Admin answer..." className="w-full bg-transparent border border-border p-2 text-sm focus:outline-none resize-none" />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleAdminAnswer(q.id)} className="bg-foreground text-background px-4 py-1.5 text-[10px] uppercase tracking-wider hover:bg-accent transition-colors">Submit Answer</button>
                            <button onClick={() => setAnsweringQuestion(null)} className="px-4 py-1.5 border border-border text-[10px] uppercase tracking-wider hover:border-foreground transition-colors">Cancel</button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-xs text-muted-foreground italic">Awaiting answer...</div>
                    )
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
