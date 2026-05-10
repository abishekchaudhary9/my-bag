import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Edit3, Trash2, Star, Sparkles, Quote } from "lucide-react";
import { useProductReviews } from "@/hooks/useProductReviews";
import PromptModal from "@/components/admin/PromptModal";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";
import { useState } from "react";

export default function ProductReviewsContainer({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const {
    authState,
    isAdmin,
    reviews,
    stats,
    eligible,
    showForm,
    setShowForm,
    loading,
    editTarget,
    setEditTarget,
    rating,
    setRating,
    title,
    setTitle,
    body,
    setBody,
    submitting,
    submitReview,
    deleteReview,
    fetchReviews,
    editReview,
  } = useProductReviews(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview(
      () => toast.success("Review shared", { description: "Thank you for your feedback." }),
      (message) => toast.error(message)
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteReview(id);
      toast.success("Review removed");
    } catch (err: any) {
      toast.error(err.message || "Could not delete review");
    }
  };

  if (loading && reviews.length === 0) return null;

  return (
    <section className="container-luxe py-24 border-t border-border/30">
      <div className="grid lg:grid-cols-12 gap-16">
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

          {reviews.length >= 2 && (
            <div className="pt-6 border-t border-border/30">
              <AiReviewSummary reviews={reviews} />
            </div>
          )}
        </div>

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
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Exceptional quality"
                      className="w-full bg-background border border-border p-4 text-sm focus:border-accent outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Your Experience</label>
                    <textarea
                      rows={5}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
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
                      <p className="text-muted-foreground font-light leading-relaxed text-sm mb-6 max-w-2xl">{r.body}</p>

                      <div className="flex items-center justify-between">
                        <div className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
                            <Star className="h-3.5 w-3.5" /> Maison Atelier Response
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
          defaultValue={editTarget.body}
          confirmLabel="Update Review"
          onConfirm={async (text) => {
            try {
              await editReview(editTarget.id, text);
              toast.success("Review updated");
              setEditTarget(null);
              fetchReviews();
            } catch (err: any) {
              toast.error(err.message || "Failed to update review");
            }
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </section>
  );
}

function AiReviewSummary({ reviews }: { reviews: any[] }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const allText = reviews.map(r => `[Rating: ${r.rating}/5] ${r.body}`).join("\n---\n");
      const { summary } = await aiApi.summarize(`Below are customer reviews for a luxury product. Please provide a 2-sentence summary of the overall community sentiment and key product strengths:\n\n${allText}`);
      setSummary(summary);
    } catch (err: any) {
      toast.error("Could not generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          <Sparkles className="h-3 w-3" />
          Community Insight
        </div>
        {!summary && !loading && (
          <button 
            onClick={handleSummarize}
            className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Summarize Sentiment
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-secondary rounded w-full" />
          <div className="h-3 bg-secondary rounded w-3/4" />
        </div>
      )}

      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-5 bg-accent/5 border border-accent/20 italic font-light text-sm text-foreground/80 leading-relaxed"
        >
          <Quote className="absolute -top-2 -left-2 h-4 w-4 text-accent/20 rotate-180" />
          {summary}
        </motion.div>
      )}
    </div>
  );
}
