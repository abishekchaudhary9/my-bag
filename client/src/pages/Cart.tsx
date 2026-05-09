import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Minus, Plus, X, Truck, ShieldCheck, ShoppingBag, ArrowRight } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useStore, CartItem } from "@/context/StoreContext";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { state, totals, removeItem, setQty, saveForLater, moveToCart, applyCoupon, clearCoupon, itemKey } = useStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  if (isAdmin) {
    return (
      <Layout>
        <div className="container-luxe py-40 text-center space-y-8 animate-fade-up">
          <div className="eyebrow">Restricted</div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tighter">Admin accounts cannot place orders.</h1>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto font-light leading-relaxed">
            Please use a customer account to experience the full shopping journey.
          </p>
          <Link to="/admin" className="inline-block bg-foreground text-background px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500">Go to Admin Panel</Link>
        </div>
      </Layout>
    );
  }

  if (state.cart.length === 0 && state.saved.length === 0) {
    return (
      <Layout>
        <div className="container-luxe py-40 text-center space-y-8 animate-fade-up">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-secondary/30 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tighter">Quietly empty.</h1>
          <Link to="/shop" className="inline-block bg-foreground text-background px-12 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500">Browse the Collection</Link>
        </div>
      </Layout>
    );
  }

  const submitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await applyCoupon(code);
    if (ok) { toast.success("Privilege code applied"); setCode(""); }
    else toast.error("Invalid code");
  };

  return (
    <Layout>
      <section className="bg-secondary/10 border-b border-border/50">
        <div className="container-luxe py-20 md:py-28">
           <div className="eyebrow mb-6 text-accent">Summary</div>
           <h1 className="font-display text-6xl md:text-8xl tracking-tighter leading-none">Your Selection</h1>
        </div>
      </section>

      <section className="container-luxe py-20 grid lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-8 space-y-16">
          {state.cart.length > 0 && (
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-border/50 pb-6">
                <div className="eyebrow tracking-[0.3em]">Current Bag ({totals.count})</div>
              </div>
              <ul className="space-y-8">
                <AnimatePresence initial={false}>
                  {state.cart.map((item) => (
                    <motion.li
                      key={itemKey(item)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Row
                        item={item}
                        onRemove={() => { removeItem(itemKey(item)); toast.info("Item removed from bag"); }}
                        onQty={(q) => setQty(itemKey(item), q)}
                        onSave={() => { saveForLater(itemKey(item)); toast.success("Saved for later"); }}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          {state.saved.length > 0 && (
            <div className="space-y-10 opacity-70">
              <div className="flex items-center justify-between border-b border-border/50 pb-6">
                <div className="eyebrow tracking-[0.3em]">Saved for Later ({state.saved.length})</div>
              </div>
              <ul className="space-y-8">
                {state.saved.map((item) => (
                  <Row
                    key={itemKey(item)}
                    item={item}
                    saved
                    onRemove={() => removeItem(itemKey(item))}
                    onQty={() => {}}
                    onSave={() => moveToCart(itemKey(item))}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
          <div className="glass p-8 space-y-8">
            <div className="eyebrow mb-6">Order Summary</div>
            <div className="space-y-4 pb-8 border-b border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rs {totals.subtotal}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-accent">
                  <span>Discount</span>
                  <span>- Rs {totals.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={totals.shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {totals.shipping === 0 ? "Complimentary" : `Rs ${totals.shipping}`}
                </span>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between text-xl font-medium tracking-tight">
                <span>Total</span>
                <span>Rs {totals.total}</span>
              </div>
              <button 
                onClick={() => navigate("/checkout")}
                className="w-full bg-foreground text-background h-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500 flex items-center justify-center gap-4 group"
              >
                Begin Checkout
                <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <form onSubmit={submitCoupon} className="pt-6 border-t border-border/50">
               <div className="flex gap-2">
                 <input value={code} onChange={e => setCode(e.target.value)} placeholder="Privilege Code" className="flex-1 bg-secondary/30 border-none px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent outline-none" />
                 <button className="px-6 bg-secondary/50 text-[9px] font-bold uppercase tracking-widest hover:bg-secondary/80 transition-colors">Apply</button>
               </div>
            </form>
            <div className="pt-4 space-y-4">
               <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60"><ShieldCheck className="h-4 w-4" strokeWidth={1} /> Secure encryption</div>
               <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60"><Truck className="h-4 w-4" strokeWidth={1} /> 2-3 Day Express</div>
            </div>
          </div>
        </aside>
      </section>
    </Layout>
  );
}

function Row({ item, onRemove, onQty, onSave, saved = false }: { item: CartItem; onRemove: () => void; onQty: (q: number) => void; onSave: () => void; saved?: boolean }) {
  return (
    <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 group">
      <div className="aspect-[4/5] bg-secondary overflow-hidden">
        <img src={item.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
      </div>
      <div className="flex flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h3 className="font-display text-xl sm:text-2xl tracking-tight leading-none">{item.name}</h3>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.color} · {item.size}</div>
          </div>
          <div className="text-lg sm:text-xl font-medium shrink-0">Rs {item.price * item.qty}</div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 sm:mt-0">
          <div className="flex items-center glass self-start">
            <button onClick={() => onQty(Math.max(1, item.qty - 1))} className="p-2 sm:p-3 hover:bg-secondary transition-colors" disabled={saved}><Minus className="h-3 w-3" strokeWidth={1.5} /></button>
            <span className="w-6 sm:w-8 text-center text-xs font-bold">{item.qty}</span>
            <button onClick={() => onQty(item.qty + 1)} className="p-2 sm:p-3 hover:bg-secondary transition-colors" disabled={saved}><Plus className="h-3 w-3" strokeWidth={1.5} /></button>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto">
            <button onClick={onSave} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] link-underline">{saved ? "Move to Bag" : "Save for Later"}</button>
            <button onClick={onRemove} className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-destructive/60 hover:text-destructive transition-colors">Remove</button>
          </div>
        </div>
      </div>
    </div>

  );
}