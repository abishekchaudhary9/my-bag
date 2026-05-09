import { X } from "lucide-react";
import { useState } from "react";

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  defaultValue?: any;
}

interface PromptModalProps {
  title: string;
  message?: string;
  label?: string; // fallback for single field
  defaultValue?: string; // fallback for single field
  fields?: Field[];
  confirmLabel?: string;
  onConfirm: (data: any) => void;
  onCancel?: () => void;
  onClose?: () => void; // alias for onCancel
}

export default function PromptModal({
  title,
  message,
  label,
  defaultValue = "",
  fields,
  confirmLabel = "Save",
  onConfirm,
  onCancel,
  onClose,
}: PromptModalProps) {
  const cancel = onCancel || onClose || (() => {});
  
  // Initialize state based on fields or single value
  const [formData, setFormData] = useState(() => {
    if (fields) {
      const data: any = {};
      fields.forEach(f => {
        data[f.name] = f.defaultValue !== undefined ? f.defaultValue : "";
      });
      return data;
    }
    return defaultValue;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={cancel}>
      <div className="bg-background w-full max-w-md border border-border p-6 md:p-8 animate-fade-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-2xl tracking-tight">{title}</h2>
          <button onClick={cancel} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {message && <p className="text-sm text-muted-foreground mb-6">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields ? (
            <div className="grid gap-4">
              {fields.map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={formData[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full bg-transparent border border-border focus:border-foreground px-3 py-2.5 text-sm focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {label && <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</label>}
              <textarea
                autoFocus
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                className="w-full bg-transparent border border-border focus:border-foreground p-3 text-sm focus:outline-none transition-colors min-h-[120px] resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-foreground text-background py-3 text-[12px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
              {confirmLabel}
            </button>
            <button type="button" onClick={cancel} className="flex-1 border border-border py-3 text-[12px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
