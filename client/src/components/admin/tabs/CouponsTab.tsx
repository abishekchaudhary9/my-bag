import * as React from "react";
import { Trash2 } from "lucide-react";
import { TableSkeleton } from "../AdminSkeletons";

interface CouponsTabProps {
  loading: boolean;
  coupons: any[];
  handleCreateCoupon: () => void;
  setDeleteTargetCoupon: (coupon: any) => void;
}

export function CouponsTab({
  loading,
  coupons,
  handleCreateCoupon,
  setDeleteTargetCoupon
}: CouponsTabProps) {
  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="eyebrow">Active Discount Codes</h2>
        <button onClick={handleCreateCoupon} className="text-xs bg-foreground text-background px-4 py-2 uppercase tracking-wider">New Coupon</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.id} className="border border-border p-5 bg-secondary/10">
            <div className="flex justify-between items-start mb-4">
              <span className="font-display text-xl tracking-wider">{c.code}</span>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {c.active ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="text-3xl font-display mb-1">{c.discount_pct}% OFF</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Discount rate</div>
            {c.description && (
              <div className="text-xs border-t border-border/50 pt-3 italic text-foreground/70 mb-4">
                "{c.description}"
              </div>
            )}
            <div className="flex justify-end border-t border-border/50 pt-4">
              <button 
                onClick={() => setDeleteTargetCoupon(c)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Delete Coupon"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground border border-dashed border-border">No coupons found.</div>
        )}
      </div>
    </div>
  );
}
