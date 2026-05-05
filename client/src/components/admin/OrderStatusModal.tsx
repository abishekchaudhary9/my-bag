import { useState } from "react";
import { X } from "lucide-react";

const STATUSES = ["processing", "shipped", "delivered", "cancelled"] as const;

export default function OrderStatusModal({
  order, onClose, onSave,
}: {
  order: { id: string; status: string; trackingNumber?: string };
  onClose: () => void;
  onSave: (orderNumber: string, data: { status: string; trackingNumber?: string }) => Promise<void>;
}) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(order.id, { status, trackingNumber: tracking || undefined });
      onClose();
    } catch {} finally { setSaving(false); }
  };

  const statusColor: Record<string, string> = {
    processing: "bg-amber-500", shipped: "bg-blue-500",
    delivered: "bg-emerald-500", cancelled: "bg-red-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background w-full max-w-md border border-border p-6 md:p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Update Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="mb-4 text-sm text-muted-foreground">Order: <span className="text-foreground font-medium">{order.id}</span></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="eyebrow">Status</span>
            <div className="flex gap-2 mt-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider border transition-colors capitalize ${
                    status === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusColor[s]}`} />
                  {s}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="eyebrow">Tracking Number</span>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. 1Z999AA10123456784"
              className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-foreground text-background py-3 text-[12px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Update Order"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-border text-[12px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
