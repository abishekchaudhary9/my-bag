import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Edit3, Trash2, MessageSquare, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import PromptModal from "@/components/admin/PromptModal";
import { toast } from "sonner";

export default function ProductQuestionsContainer({ productId }: { productId: string }) {
  const navigate = useNavigate();
  const {
    authState,
    isAdmin,
    questions,
    text,
    setText,
    submitting,
    showForm,
    setShowForm,
    editTarget,
    setEditTarget,
    submitQuestion,
    deleteQuestion,
    editQuestion,
    fetchQuestions,
  } = useProductQuestions(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuestion(
      () => toast.success("Question sent", { description: "The atelier will respond shortly." }),
      (message) => toast.error(message)
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteQuestion(id);
      toast.success("Question removed");
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
                        <button onClick={() => setEditTarget(q)} className="text-accent hover:underline">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="text-destructive hover:underline">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">
                    Asked by {q.name || "Client"} · {new Date(q.createdAt).toLocaleDateString()}
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
            <div className="text-center py-10 opacity-40 font-light italic text-sm">No questions yet.</div>
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
              onChange={(e) => setText(e.target.value)}
              placeholder="What would you like to know about this piece?"
              className="w-full bg-background border border-border p-4 text-sm focus:border-accent outline-none resize-none"
            />
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100">
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
            await editQuestion(editTarget.id, text);
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
