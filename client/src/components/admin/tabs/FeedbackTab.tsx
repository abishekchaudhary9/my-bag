import * as React from "react";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Smile 
} from "lucide-react";
import { MetricCard } from "../AdminShared";
import { FeedbackSkeleton } from "../AdminSkeletons";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";

interface FeedbackTabProps {
  loading: boolean;
  unresolvedFeedback: number;
  feedback: { reviews: any[]; questions: any[] };
  setReplyReviewTarget: (r: any) => void;
  setEditReviewTarget: (r: any) => void;
  setDeleteTargetReview: (r: any) => void;
  setReplyQuestionTarget: (q: any) => void;
  setEditQuestionTarget: (q: any) => void;
  setDeleteTargetQuestion: (q: any) => void;
}

export function FeedbackTab({
  loading,
  unresolvedFeedback,
  feedback,
  setReplyReviewTarget,
  setEditReviewTarget,
  setDeleteTargetReview,
  setReplyQuestionTarget,
  setEditQuestionTarget,
  setDeleteTargetQuestion
}: FeedbackTabProps) {
  if (loading) return <FeedbackSkeleton />;

  return (
    <div className="space-y-12 animate-fade-up">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Activity} label="Open Items" value={unresolvedFeedback} detail="Reviews and questions" tone="text-violet-600" index={0} />
        <MetricCard icon={TrendingUp} label="Reviews" value={feedback.reviews.length} detail="Waiting for replies" tone="text-amber-600" index={1} />
        <MetricCard icon={AlertTriangle} label="Questions" value={feedback.questions.length} detail="Waiting for answers" tone="text-red-600" index={2} />
        <MetricCard icon={CheckCircle} label="Resolution" value="94%" detail="Avg. response rate" tone="text-emerald-600" index={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="eyebrow border-b border-border pb-4">Product Reviews</h2>
          {feedback.reviews.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground bg-secondary/10">No pending reviews.</div>
          ) : (
            <div className="space-y-4">
              {feedback.reviews.map((r) => (
                <div key={r.id} id={`feedback-review-${r.id}`} className="border border-border p-5 bg-background hover:border-foreground/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-sm">{r.userName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{r.productName}</div>
                    </div>
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Smile key={i} className={`h-3 w-3 ${i < r.rating ? "fill-current" : "opacity-20"}`} />)}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 mb-4">"{r.body}"</p>
                  <div className="flex gap-4">
                    <button onClick={() => setReplyReviewTarget(r)} className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-80">Reply</button>
                    <button 
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;
                        btn.innerText = "Summarizing...";
                        btn.disabled = true;
                        try {
                          const { summary } = await aiApi.summarize(r.body);
                          toast.success(summary, { duration: 6000 });
                        } catch (err: any) {
                          toast.error(err.message || "Summarization failed");
                        } finally {
                          btn.innerText = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-violet-600 hover:opacity-80"
                    >
                      AI Summarize
                    </button>
                    <button 
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;
                        btn.innerText = "Drafting...";
                        btn.disabled = true;
                        try {
                          const { reply } = await aiApi.draftReply(r.body, r.rating > 3 ? "positive" : "negative");
                          toast.success("AI Draft Ready", { 
                            description: reply,
                            duration: 10000,
                            action: {
                              label: "Copy",
                              onClick: () => {
                                navigator.clipboard.writeText(reply);
                                toast.success("Copied to clipboard");
                              }
                            }
                          });
                        } catch (err: any) {
                          toast.error(err.message || "Drafting failed");
                        } finally {
                          btn.innerText = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 hover:opacity-80"
                    >
                      AI Draft Reply
                    </button>
                    <button onClick={() => setEditReviewTarget(r)} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground">Edit</button>
                    <button onClick={() => setDeleteTargetReview(r)} className="text-[10px] uppercase tracking-widest font-bold text-destructive hover:opacity-80">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="eyebrow border-b border-border pb-4">Customer Questions</h2>
          {feedback.questions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground bg-secondary/10">No pending questions.</div>
          ) : (
            <div className="space-y-4">
              {feedback.questions.map((q) => (
                <div key={q.id} id={`feedback-question-${q.id}`} className="border border-border p-5 bg-background hover:border-foreground/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-sm">{q.userName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{q.productName}</div>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-secondary text-muted-foreground">New</span>
                  </div>
                  <p className="text-sm font-medium mb-4">Q: {q.text}</p>
                  <div className="flex gap-4 items-center mt-4">
                    <button onClick={() => setReplyQuestionTarget(q)} className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-80">Answer</button>
                    <button 
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;
                        btn.innerText = "Summarizing...";
                        btn.disabled = true;
                        try {
                          const { summary } = await aiApi.summarize(q.text);
                          toast.success(summary, { duration: 6000 });
                        } catch (err: any) {
                          toast.error(err.message || "Summarization failed");
                        } finally {
                          btn.innerText = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-violet-600 hover:opacity-80"
                    >
                      AI Summarize
                    </button>
                    <button 
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;
                        btn.innerText = "Drafting...";
                        btn.disabled = true;
                        try {
                          const { reply } = await aiApi.draftReply(q.text, "neutral");
                          toast.success("AI Answer Ready", { 
                            description: reply,
                            duration: 10000,
                            action: {
                              label: "Copy",
                              onClick: () => {
                                navigator.clipboard.writeText(reply);
                                toast.success("Copied to clipboard");
                              }
                            }
                          });
                        } catch (err: any) {
                          toast.error(err.message || "Drafting failed");
                        } finally {
                          btn.innerText = originalText;
                          btn.disabled = false;
                        }
                      }}
                      className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 hover:opacity-80"
                    >
                      AI Draft Answer
                    </button>
                    <button onClick={() => setEditQuestionTarget(q)} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground">Edit</button>
                    <button onClick={() => setDeleteTargetQuestion(q)} className="text-[10px] uppercase tracking-widest font-bold text-destructive hover:opacity-80">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

