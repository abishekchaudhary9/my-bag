import { useState } from "react";
import { Search, Package, Truck, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/site/Layout";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setOrder(null);
    try {
      // We'll use a public tracking endpoint (which we need to create on the server)
      // For now, let's assume we have one or use the admin one if the user is admin
      // But we want a public one. I'll create it.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/track/${trackingNumber.trim()}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container-luxe py-24 md:py-32 min-h-[80vh]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <div className="eyebrow mb-4">Logistics</div>
            <h1 className="font-display text-4xl md:text-5xl">Track Your Shipment</h1>
            <p className="mt-4 text-muted-foreground">
              Enter your Maison tracking number to follow your order's journey from our atelier to your doorstep.
            </p>
          </div>

          <form onSubmit={handleTrack} className="relative mb-16">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. MSN-TRK-XXXX-XXXX"
              className="w-full bg-secondary py-5 pl-12 pr-32 text-sm focus:outline-none focus:ring-1 focus:ring-accent tracking-widest uppercase"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-foreground text-background px-6 text-[11px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-border p-8 bg-secondary/20"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Order Number</div>
                    <div className="font-display text-xl tracking-tight">{order.order_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className={`h-2 w-2 rounded-full ${
                        order.status === 'delivered' ? 'bg-emerald-500' : 
                        order.status === 'shipped' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      <span className="text-sm font-medium capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {order.status === "cancelled" ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-red-500/5 text-red-500 p-6 border border-red-500/10 text-sm flex items-start gap-3 my-8"
                    >
                      <Package className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <div className="font-bold uppercase tracking-widest text-[10px] mb-1">Order Cancelled</div>
                        <p className="opacity-80">This shipment has been cancelled and is no longer being tracked. Please contact support if you believe this is an error.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="relative py-8">
                      <div className="absolute top-[52px] left-0 right-0 h-[1px] bg-border" />
                      <div 
                        className="absolute top-[52px] left-0 h-[1px] bg-foreground transition-all duration-1000"
                        style={{ width: order.status === 'processing' ? '0%' : order.status === 'shipped' ? '50%' : '100%' }}
                      />
                      
                      <div className="flex justify-between relative">
                        {[
                          { id: 'processing', label: 'Atelier', icon: Package },
                          { id: 'shipped', label: 'Transit', icon: Truck },
                          { id: 'delivered', label: 'Arrived', icon: CheckCircle2 }
                        ].map((step, idx) => {
                          const stages = ['processing', 'shipped', 'delivered'];
                          const isCompleted = stages.indexOf(order.status) >= idx;
                          const Icon = step.icon;
                          
                          return (
                            <div key={step.id} className="flex flex-col items-center">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-background border transition-all duration-700 ${
                                isCompleted ? 'border-foreground text-foreground' : 'border-border text-muted-foreground/30'
                              }`}>
                                <Icon className="h-5 w-5" strokeWidth={1.5} />
                              </div>
                              <div className={`mt-4 text-[9px] uppercase tracking-[0.2em] font-bold ${
                                isCompleted ? 'text-foreground' : 'text-muted-foreground/40'
                              }`}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Estimated arrival: {order.status === 'delivered' ? 'Delivered' : '2-4 Business Days'}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
}
