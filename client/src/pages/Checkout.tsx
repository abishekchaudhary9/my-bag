import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, Truck, ChevronLeft, ChevronRight, ShieldCheck, Check } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

type Step = "shipping" | "payment" | "review";
const STEPS: { key: Step; label: string; icon: typeof Truck }[] = [
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: Check },
];

export default function Checkout() {
  const { state: cartState, totals, clearCart, removeFromWish } = useStore();
  const { state: authState, addOrder } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: authState.user?.firstName ?? "",
    lastName: authState.user?.lastName ?? "",
    email: authState.user?.email ?? "",
    phone: authState.user?.phone ?? "",
    street: authState.user?.address?.street ?? "",
    city: authState.user?.address?.city ?? "",
    state: authState.user?.address?.state ?? "",
    zip: authState.user?.address?.zip ?? "",
    country: authState.user?.address?.country ?? DEFAULT_COUNTRY,
  });

  const [payment, setPayment] = useState({
    method: "card" as "card" | "paypal" | "apple",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleStepChange = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateShipping = () => {
    if (!shipping.firstName.trim() || !shipping.lastName.trim() || !shipping.street.trim() || !shipping.city.trim()) {
      toast.error("Complete your shipping name and address.");
      return false;
    }

    if (!isValidEmail(shipping.email)) {
      toast.error("Enter a valid email address.");
      return false;
    }

    if (!isValidNepalPhone(shipping.phone)) {
      toast.error("Enter a valid Nepal mobile number.", {
        description: "Use 98XXXXXXXX, 97XXXXXXXX, or +97798XXXXXXXX.",
      });
      return false;
    }

    setShipping((current) => ({
      ...current,
      phone: formatNepalPhone(current.phone),
      country: current.country || DEFAULT_COUNTRY,
    }));
    return true;
  };

  const validatePayment = () => {
    if (payment.method !== "card") return true;

    const cardDigits = payment.cardNumber.replace(/\D/g, "");
    const cvvDigits = payment.cvv.replace(/\D/g, "");

    if (cardDigits.length < 13 || cardDigits.length > 19) {
      toast.error("Enter a valid card number.");
      return false;
    }

    if (!payment.cardName.trim()) {
      toast.error("Enter the name on the card.");
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\s*\/?\s*\d{2}$/.test(payment.expiry.trim())) {
      toast.error("Enter expiry as MM/YY.");
      return false;
    }

    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      toast.error("Enter a valid CVV.");
      return false;
    }

    return true;
  };

  if (authState.user?.role === "admin") {
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

  if (!authState.isAuthenticated) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Sign In Required</div>
          <h1 className="font-display text-5xl md:text-6xl">Please sign in to checkout.</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">Create an account or sign in to complete your purchase.</p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              to="/login"
              className="inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex border border-foreground px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-foreground hover:text-background transition-colors duration-500"
            >
              Create Account
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (cartState.cart.length === 0) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Checkout</div>
          <h1 className="font-display text-5xl md:text-6xl">Nothing to check out.</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">Add some pieces to your bag first.</p>
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

  const handlePlaceOrder = async () => {
    if (!validateShipping() || !validatePayment()) return;

    setLoading(true);
    try {
      const orderData = {
        items: cartState.cart.map((i) => ({
          name: i.name,
          color: i.color,
          size: i.size,
          qty: i.qty,
          price: i.price,
          image: i.image,
        })),
        subtotal: totals.subtotal,
        shipping: shippingMethod === "express" ? 25 : totals.shipping,
        discount: totals.discount,
        total: totals.total + (shippingMethod === "express" ? 25 : 0),
        shippingInfo: { ...shipping, phone: formatNepalPhone(shipping.phone), country: shipping.country || DEFAULT_COUNTRY },
        paymentMethod: payment.method,
      };

      const { order } = await ordersApi.create(orderData);
      addOrder(order);
      // Remove ordered items from wishlist
      cartState.cart.forEach((item) => {
        removeFromWish(item.productId);
      });
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      const message = err?.message || "";
      if (message && message !== "Server error") {
        toast.error(message);
        return;
      }

      // Fallback: create order locally if backend is unavailable
      const fallbackOrder = {
        id: `ORD-${Date.now().toString().slice(-8)}`,
        date: new Date().toISOString().split("T")[0],
        status: "processing" as const,
        items: cartState.cart.map((i) => ({
          name: i.name, color: i.color, size: i.size, qty: i.qty, price: i.price, image: i.image,
        })),
        subtotal: totals.subtotal,
        shipping: shippingMethod === "express" ? 25 : totals.shipping,
        discount: totals.discount,
        total: totals.total + (shippingMethod === "express" ? 25 : 0),
      };
      addOrder(fallbackOrder);
      // Remove ordered items from wishlist
      cartState.cart.forEach((item) => {
        removeFromWish(item.productId);
      });
      clearCart();
      navigate(`/order-confirmation/${fallbackOrder.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container-luxe pt-10 pb-6">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground link-underline mb-6">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back to bag
        </Link>
        <div className="eyebrow mb-3">Secure Checkout</div>
        <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>
      </section>

      {/* Progress Steps */}
      <section className="container-luxe pb-10">
        <div className="flex items-center gap-2 md:gap-4 max-w-lg">
          {STEPS.map((s, i) => {
            const isActive = i === stepIndex;
            const isDone = i < stepIndex;
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-9 w-9 rounded-full grid place-items-center text-xs font-medium transition-all duration-500 ${
                    isActive
                      ? "bg-foreground text-background"
                      : isDone
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2} /> : i + 1}
                </div>
                <span
                  className={`hidden sm:inline text-xs uppercase tracking-[0.14em] transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${isDone ? "bg-accent" : "bg-border"} transition-colors`} />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-luxe pb-24 grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
        {/* LEFT — Forms */}
        <div className="animate-fade-up">
          {/* SHIPPING STEP */}
          {step === "shipping" && (
            <div className="space-y-6">
              <div className="eyebrow mb-6">Shipping Address</div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} />
                <Field label="Last Name" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} />
              </div>
              <Field label="Email" type="email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} />
              <Field label="Phone" type="tel" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} placeholder="+977 98XXXXXXXX" />
              <Field label="Street Address" value={shipping.street} onChange={(v) => setShipping({ ...shipping, street: v })} />
              <div className="grid grid-cols-3 gap-4">
                <Field label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                <Field label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                <Field label="ZIP Code" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} />
              </div>
              <Field label="Country" value={shipping.country} onChange={(v) => setShipping({ ...shipping, country: v })} />

              <div className="pt-6">
                <div className="eyebrow mb-4">Shipping Method</div>
                <div className="space-y-3">
                  <ShippingOption
                    selected={shippingMethod === "standard"}
                    onSelect={() => setShippingMethod("standard")}
                    title="Standard Shipping"
                    desc="5–7 business days"
                    price={totals.subtotal > 250 ? "Free" : "Rs 18.00"}
                  />
                  <ShippingOption
                    selected={shippingMethod === "express"}
                    onSelect={() => setShippingMethod("express")}
                    title="Express Shipping"
                    desc="2–3 business days"
                    price="Rs 25.00"
                  />
                </div>
              </div>

              <button
                onClick={() => { if (validateShipping()) handleStepChange("payment"); }}
                className="group flex items-center justify-center gap-3 w-full bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 mt-4"
              >
                Continue to Payment
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* PAYMENT STEP */}
          {step === "payment" && (
            <div className="space-y-6">
              <div className="eyebrow mb-6">Payment Method</div>

              <div className="flex gap-3 mb-6">
                {(["card", "paypal", "apple"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment({ ...payment, method: m })}
                    className={`flex-1 py-3 border text-[13px] uppercase tracking-[0.14em] transition-all ${
                      payment.method === m
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {m === "card" ? "Card" : m === "paypal" ? "PayPal" : "Apple Pay"}
                  </button>
                ))}
              </div>

              {payment.method === "card" && (
                <div className="space-y-5 animate-fade-in">
                  <Field
                    label="Card Number"
                    value={payment.cardNumber}
                    onChange={(v) => setPayment({ ...payment, cardNumber: v })}
                    placeholder="4242 4242 4242 4242"
                  />
                  <Field
                    label="Name on Card"
                    value={payment.cardName}
                    onChange={(v) => setPayment({ ...payment, cardName: v })}
                    placeholder="Chiara Rosetti"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Expiry"
                      value={payment.expiry}
                      onChange={(v) => setPayment({ ...payment, expiry: v })}
                      placeholder="MM / YY"
                    />
                    <Field
                      label="CVV"
                      type="password"
                      value={payment.cvv}
                      onChange={(v) => setPayment({ ...payment, cvv: v })}
                      placeholder="•••"
                    />
                  </div>
                </div>
              )}

              {payment.method === "paypal" && (
                <div className="text-center py-12 bg-secondary/40 animate-fade-in">
                  <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your purchase.</p>
                </div>
              )}

              {payment.method === "apple" && (
                <div className="text-center py-12 bg-secondary/40 animate-fade-in">
                  <p className="text-sm text-muted-foreground">Confirm with Touch ID or Face ID on your device.</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                Your payment information is encrypted and secure.
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleStepChange("shipping")}
                  className="flex items-center gap-2 px-6 py-4 border border-border text-[13px] uppercase tracking-[0.18em] hover:border-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                  Back
                </button>
                <button
                  onClick={() => { if (validatePayment()) handleStepChange("review"); }}
                  className="group flex-1 flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
                >
                  Review Order
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* REVIEW STEP */}
          {step === "review" && (
            <div className="space-y-8">
              <div className="eyebrow mb-6">Order Review</div>

              {/* Shipping summary */}
              <div className="p-5 bg-secondary/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="eyebrow">Ship to</div>
                  <button onClick={() => handleStepChange("shipping")} className="text-xs link-underline text-accent">Edit</button>
                </div>
                <div className="text-sm leading-relaxed">
                  {shipping.firstName} {shipping.lastName}<br />
                  {shipping.street}<br />
                  {shipping.city}, {shipping.state} {shipping.zip}<br />
                  {shipping.country}
                </div>
              </div>

              {/* Payment summary */}
              <div className="p-5 bg-secondary/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="eyebrow">Payment</div>
                  <button onClick={() => handleStepChange("payment")} className="text-xs link-underline text-accent">Edit</button>
                </div>
                <div className="text-sm">
                  {payment.method === "card"
                    ? `Card ending in ${payment.cardNumber.slice(-4) || "••••"}`
                    : payment.method === "paypal"
                    ? "PayPal"
                    : "Apple Pay"}
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="eyebrow mb-4">Items · {totals.count}</div>
                <ul className="space-y-4">
                  {cartState.cart.map((item, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-secondary overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.color} · {item.size} · Qty {item.qty}</div>
                      </div>
                      <div className="text-sm">Rs {(item.price * item.qty).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleStepChange("payment")}
                  className="flex items-center gap-2 px-6 py-4 border border-border text-[13px] uppercase tracking-[0.18em] hover:border-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="group flex-1 flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <>
                      Place Order — Rs {(totals.total + (shippingMethod === "express" ? 25 : 0)).toFixed(2)}
                      <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Order Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-secondary/60 p-7 space-y-5">
            <div className="eyebrow mb-4">Order Summary</div>
            <ul className="space-y-4 max-h-[280px] overflow-y-auto">
              {cartState.cart.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-14 w-14 bg-secondary overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground">{item.color} · {item.size} × {item.qty}</div>
                  </div>
                  <div className="text-xs">Rs {(item.price * item.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs {totals.subtotal.toFixed(2)}</span></div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-accent"><span>Discount</span><span>−Rs {totals.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingMethod === "express" ? "Rs 25.00" : totals.shipping === 0 ? "Free" : `Rs ${totals.shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border flex justify-between items-baseline">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-2xl">Rs {(totals.total + (shippingMethod === "express" ? 25 : 0)).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-muted-foreground px-2">
            <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> SSL Encrypted · 256-bit</div>
            <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5" strokeWidth={1.5} /> Free returns within 30 days</div>
          </div>
        </aside>
      </section>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors"
      />
    </label>
  );
}

function ShippingOption({
  selected,
  onSelect,
  title,
  desc,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
  price: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-4 border transition-all ${
        selected ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-4 w-4 rounded-full border-2 transition-all ${
            selected ? "border-foreground bg-foreground" : "border-border"
          }`}
        >
          {selected && <div className="h-full w-full rounded-full border-2 border-background" />}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <div className="text-sm font-medium">{price}</div>
    </button>
  );
}
