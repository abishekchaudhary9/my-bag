import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  title, message, confirmLabel = "Delete", onConfirm, onClose,
}: {
  title: string; message: string; confirmLabel?: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background w-full max-w-sm border border-border p-6 md:p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="h-10 w-10 rounded-full bg-destructive/10 grid place-items-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-xl">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-destructive text-destructive-foreground py-3 text-[12px] uppercase tracking-[0.16em] hover:opacity-90 transition-opacity">
            {confirmLabel}
          </button>
          <button onClick={onClose} className="flex-1 border border-border py-3 text-[12px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
