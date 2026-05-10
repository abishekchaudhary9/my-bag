import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, User, Bot, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("maison_chat_history");
    return saved ? JSON.parse(saved) : [
      { role: "assistant", content: "Welcome to Maison. I am your concierge. How may I assist you today?" }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("maison_chat_history", JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user", content: userMsg }] as Message[];
    
    setInput("");
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send last 10 messages for context to avoid huge payloads
      const history = newMessages.slice(-10);
      const { reply } = await aiApi.concierge(userMsg, history);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I apologize, but I am having trouble connecting to my creative center. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    const initialMessage = [{ role: "assistant", content: "Welcome to Maison. I am your concierge. How may I assist you today?" }] as Message[];
    setMessages(initialMessage);
    localStorage.removeItem("maison_chat_history");
  };

  return (
    <>
      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] h-14 w-14 rounded-full bg-foreground text-background shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
      >
        <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-background border border-border text-[10px] uppercase tracking-widest font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none shadow-xl">AI Concierge</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-8 z-[100] w-[min(400px,calc(100vw-4rem))] bg-background/80 backdrop-blur-2xl border border-border rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-6 bg-secondary/30 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest font-bold">Maison Concierge</div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-muted-foreground uppercase font-medium">Online Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearHistory}
                  title="Clear Conversation"
                  className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar overscroll-contain touch-pan-y"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center border border-border ${m.role === "user" ? "bg-secondary" : "bg-foreground text-background"}`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user" 
                        ? "bg-accent text-accent-foreground" 
                        : "bg-secondary/50 text-foreground"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center bg-foreground text-background">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/50 flex gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-secondary/10">
              <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Tell me about your style..."
                  className="w-full bg-background border border-border rounded-2xl px-6 py-4 pr-14 text-sm outline-none focus:border-foreground transition-colors shadow-sm"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-3 bg-foreground text-background rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 text-center text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Powered by Maison AI</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
