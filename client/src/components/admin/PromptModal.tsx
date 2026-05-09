import { X } from "lucide-react";
import { useState } from "react";

export default function PromptModal({
  title, label, defaultValue, confirmLabel = "Save", onConfirm, onClose,
}: {
  title: string; label: string; defaultValue: string; confirmLabel?: string;
  onConfirm: (value: string) => void; onClose: () => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background w-full max-w-sm border border-border p-6 md:p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</label>
            <textarea
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-transparent border border-border focus:border-foreground p-3 text-sm focus:outline-none transition-colors min-h-[120px] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => onConfirm(value)} className="flex-1 bg-foreground text-background py-3 text-[12px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
              {confirmLabel}
            </button>
            <button onClick={onClose} className="flex-1 border border-border py-3 text-[12px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
