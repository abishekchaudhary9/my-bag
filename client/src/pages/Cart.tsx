import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Minus, Plus, X, Truck, ShieldCheck, Tag } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useStore, CartItem } from "@/context/StoreContext";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const { state, totals, removeItem, setQty, saveForLater, moveToCart, applyCoupon, clearCoupon, itemKey } = useStore();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  if (isAdmin) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Restricted</div>
          <h1 className="font-display text-5xl md:text-6xl">Admin accounts cannot place orders.</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">
            Please use a customer account to place orders. Admin accounts are for store management only.
          </p>
          <Link
            to="/admin"
            className="mt-10 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
          >
            Go to Admin Panel
          </Link>
        </div>
      </Layout>
    );
  }

  const submitCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = applyCoupon(code);
    if (ok) toast.success("Coupon applied");
    else toast.error("Invalid code", { description: "Try WELCOME10, MAISON15, or ATELIER20" });
  };

  if (state.cart.length === 0 && state.saved.length === 0) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Your bag</div>
          <h1 className="font-display text-5xl md:text-6xl">Quietly empty.</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">
            Nothing inside yet. Begin with a piece from the collection.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
          >
            Browse the Collection
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-luxe pt-12 pb-6">
        <div className="eyebrow mb-3">Your bag</div>
        <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>
      </section>

      <section className="container-luxe pb-24 grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16">
        <div className="space-y-10">
          {state.cart.length > 0 && (
            <div>
              <div className="eyebrow mb-5">In your bag · {totals.count}</div>
              <ul className="hairline">
                {state.cart.map((item) => (
                  <Row
                    key={itemKey(item)}
                    item={item}
                    onRemove={() => removeItem(itemKey(item))}
                    onQty={(q) => setQty(itemKey(item), q)}
                    onSave={() => saveForLater(itemKey(item))}
                  />
                ))}
              </ul>
            </div>
          )}

          {state.saved.length > 0 && (
            <div>
              <div className="eyebrow mb-5">Saved for later · {state.saved.length}</div>
              <ul className="hairline">
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

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-28 lg:self-start bg-secondary/60 p-7 space-y-6">
          <div>
            <div className="eyebrow mb-4">Order summary</div>
            <dl className="space-y-3 text-sm">
              <Line label="Subtotal" value={`Rs ${totals.subtotal.toFixed(2)}`} />
              {state.coupon && (
                <Line
                  label={
                    <span className="flex items-center gap-2 text-accent">
                      <Tag className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {state.coupon.code} · −{state.coupon.pct}%
                      <button onClick={clearCoupon} className="opacity-60 hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  }
                  value={`−Rs ${totals.discount.toFixed(2)}`}
                />
              )}
              <Line label="Shipping" value={totals.shipping === 0 ? "Complimentary" : `Rs ${totals.shipping}`} />
            </dl>
            <div className="mt-5 pt-5 border-t border-border flex justify-between items-baseline">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl">Rs {totals.total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={submitCoupon} className="flex border-b border-foreground/30 focus-within:border-foreground">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Promo code"
              className="flex-1 bg-transparent py-2.5 text-sm focus:outline-none"
            />
            <button className="text-[12px] uppercase tracking-[0.18em] hover:text-accent">Apply</button>
          </form>

          <button
            disabled={state.cart.length === 0}
            onClick={() => navigate("/checkout")}
            className="w-full bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Secure checkout
          </button>

          <div className="space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5" strokeWidth={1.5} /> Complimentary shipping over Rs 250</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Secure payment · Stripe, PayPal, Apple Pay</div>
          </div>
        </aside>
      </section>
    </Layout>
  );
}

function Row({
  item, saved, onRemove, onQty, onSave,
}: {
  item: CartItem; saved?: boolean;
  onRemove: () => void; onQty: (q: number) => void; onSave: () => void;
}) {
  return (
    <li className="grid grid-cols-[100px_1fr_auto] md:grid-cols-[120px_1fr_auto] gap-5 py-6 border-t border-border first:border-t-0">
      <Link to={`/product/${item.slug}`} className="block bg-secondary aspect-[4/5] overflow-hidden">
        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0">
        <Link to={`/product/${item.slug}`} className="font-display text-lg link-underline">{item.name}</Link>
        <div className="text-xs text-muted-foreground mt-1">{item.color} · {item.size}</div>
        <div className="mt-3 flex items-center gap-4 text-xs">
          {!saved && (
            <div className="flex items-center border border-border">
              <button onClick={() => onQty(item.qty - 1)} className="p-1.5 hover:bg-secondary"><Minus className="h-3 w-3" /></button>
              <span className="w-7 text-center">{item.qty}</span>
              <button onClick={() => onQty(item.qty + 1)} className="p-1.5 hover:bg-secondary"><Plus className="h-3 w-3" /></button>
            </div>
          )}
          <button onClick={onSave} className="link-underline text-muted-foreground hover:text-foreground">
            {saved ? "Move to bag" : "Save for later"}
          </button>
          <button onClick={onRemove} className="link-underline text-muted-foreground hover:text-destructive">Remove</button>
        </div>
      </div>
      <div className="text-right">
        <div className="text-base">Rs {(item.price * item.qty).toFixed(2)}</div>
      </div>
    </li>
  );
}

function Line({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}