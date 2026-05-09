import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, Truck, ChevronLeft, ChevronRight, ShieldCheck, Check, MapPin } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";
import { motion, AnimatePresence } from "framer-motion";

type Step = "shipping" | "payment" | "review";
const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: "shipping", label: "Address", icon: MapPin },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Finalize", icon: Check },
];

const Input = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    <input {...props} className="w-full bg-secondary/50 border border-border p-4 text-[14px] outline-none focus:border-accent transition-colors" />
  </div>
);

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

  const [payment, setPayment] = useState({ method: "khalti" as "khalti" | "esewa" | "cod" });
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleStepChange = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateShipping = () => {
    if (!shipping.firstName.trim() || !shipping.lastName.trim() || !shipping.street.trim() || !shipping.city.trim()) {
      toast.error("Please complete your delivery address.");
      return false;
    }
    if (!isValidEmail(shipping.email)) {
      toast.error("Please provide a valid email.");
      return false;
    }
    if (!isValidNepalPhone(shipping.phone)) {
      toast.error("Valid contact number required.");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cartState.cart.map(i => ({ name: i.name, color: i.color, size: i.size, qty: i.qty, price: i.price, image: i.image })),
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        discount: totals.discount,
        total: totals.total,
        shippingInfo: { ...shipping, phone: formatNepalPhone(shipping.phone), country: shipping.country || DEFAULT_COUNTRY },
        paymentMethod: payment.method,
      };

      if (payment.method === "cod") {
        const { order } = await ordersApi.create(orderData);
        addOrder(order);
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      } else if (payment.method === "khalti") {
        toast.loading("Connecting to Khalti...", { id: "khalti-init" });
        const { order } = await ordersApi.create(orderData);
        const khaltiRes = await ordersApi.khaltiInitiate({
          amount: totals.total,
          purchase_order_id: `order_${order.id}`,
          purchase_order_name: "Maison Luxury Purchase",
          return_url: `${window.location.origin}/order-confirmation/${order.id}?q=khalti`,
          website_url: window.location.origin,
          customer_info: {
            name: `${shipping.firstName} ${shipping.lastName}`.trim() || "Customer",
            email: shipping.email || "customer@example.com",
            phone: formatNepalPhone(shipping.phone) || "9800000000"
          }
        });
        if (khaltiRes.payment_url) {
          toast.dismiss("khalti-init");
          addOrder(order);
          clearCart();
          window.location.href = khaltiRes.payment_url;
        }
      } else if (payment.method === "esewa") {
        const { order } = await ordersApi.create(orderData);
        addOrder(order);
        clearCart();

        const cleanTotal = Math.round(totals.total).toString();
        const transaction_uuid = `MAISON_${Date.now()}`;
        const product_code = "EPAYTEST";
        const message = `total_amount=${cleanTotal},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const secret = "8gBm/:&EnhH.1/q";
        
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          enc.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
        const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        const esewaPath = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        const params = {
          amount: cleanTotal,
          tax_amount: "0",
          total_amount: cleanTotal,
          transaction_uuid: transaction_uuid,
          product_code: product_code,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${window.location.origin}/order-confirmation/${order.id}`,
          failure_url: window.location.href,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature,
        };

        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", esewaPath);

        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", key);
          input.setAttribute("value", value.toString());
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (authState.user?.role === "admin") {
    return (
      <Layout>
        <div className="container-luxe py-40 text-center space-y-8">
           <div className="eyebrow">Restriction</div>
           <h1 className="font-display text-5xl md:text-7xl">Admins cannot place orders.</h1>
           <Link to="/admin" className="inline-block bg-foreground text-background px-12 py-5 text-[11px] font-bold uppercase tracking-widest hover:bg-accent transition-colors">Return to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-secondary/10 border-b border-border/50">
        <div className="container-luxe py-16 md:py-24">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div>
                <div className="eyebrow mb-4 text-accent">Checkout</div>
                <h1 className="font-display text-5xl md:text-7xl tracking-tighter">Finalize Order</h1>
              </div>
              <div className="flex items-center gap-4 md:gap-10 overflow-x-auto no-scrollbar pb-2 snap-x">
                {STEPS.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2 md:gap-4 group shrink-0 snap-start">
                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition-all duration-700 ${i <= stepIndex ? 'border-accent bg-accent text-background' : 'border-border text-muted-foreground'}`}>
                      {i < stepIndex ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <s.icon className="h-3 w-3 md:h-4 md:w-4" />}
                    </div>
                    <div className="hidden md:block">
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </section>

      <section className="container-luxe py-20 grid lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-8">
           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
             >
               {step === "shipping" && (
                 <div className="space-y-12">
                   <div className="space-y-8">
                     <div className="eyebrow pb-6 border-b border-border/50">Contact Information</div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Email" value={shipping.email} onChange={e => setShipping({...shipping, email: e.target.value})} type="email" />
                        <Input label="Phone" value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} type="tel" />
                     </div>
                   </div>
                   <div className="space-y-8">
                     <div className="eyebrow pb-6 border-b border-border/50">Delivery Address</div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <Input label="First Name" value={shipping.firstName} onChange={e => setShipping({...shipping, firstName: e.target.value})} />
                        <Input label="Last Name" value={shipping.lastName} onChange={e => setShipping({...shipping, lastName: e.target.value})} />
                        <div className="md:col-span-2"><Input label="Street" value={shipping.street} onChange={e => setShipping({...shipping, street: e.target.value})} /></div>
                        <Input label="City" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
                        <Input label="Province" value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} />
                     </div>
                   </div>
                   <div className="pt-10 flex justify-end">
                     <button onClick={() => { if(validateShipping()) handleStepChange("payment"); }} className="bg-foreground text-background h-16 px-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500">Continue to Payment</button>
                   </div>
                 </div>
               )}

               {step === "payment" && (
                 <div className="space-y-12">
                   <div className="eyebrow pb-6 border-b border-border/50">Payment Method</div>
                   <div className="grid md:grid-cols-3 gap-4">
                     {["khalti", "esewa", "cod"].map((m) => (
                       <button
                         key={m}
                         onClick={() => setPayment({ method: m as any })}
                         className={`h-24 border text-[10px] font-bold uppercase tracking-widest transition-all ${payment.method === m ? 'border-accent bg-accent/5' : 'border-border hover:border-foreground/50'}`}
                       >
                         {m === "khalti" ? "Khalti" : m === "esewa" ? "eSewa" : "Cash on Delivery"}
                       </button>
                     ))}
                   </div>
                   <div className="pt-10 flex justify-between">
                     <button onClick={() => handleStepChange("shipping")} className="h-16 px-10 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">Back</button>
                     <button onClick={() => handleStepChange("review")} className="bg-foreground text-background h-16 px-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500">Review Order</button>
                   </div>
                 </div>
               )}

               {step === "review" && (
                 <div className="space-y-12">
                   <div className="eyebrow pb-6 border-b border-border/50">Order Review</div>
                   <div className="grid md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipping To</div>
                       <p className="text-sm font-light leading-relaxed">{shipping.firstName} {shipping.lastName}<br/>{shipping.street}<br/>{shipping.city}, {shipping.state}</p>
                     </div>
                     <div className="space-y-4">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Method</div>
                       <p className="text-sm font-light uppercase tracking-widest">{payment.method}</p>
                     </div>
                   </div>
                   <div className="pt-10 flex justify-between">
                     <button onClick={() => handleStepChange("payment")} className="h-16 px-10 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">Back</button>
                     <button onClick={handlePlaceOrder} disabled={loading} className="bg-foreground text-background h-16 px-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500 disabled:opacity-50">
                       {loading ? "Processing..." : `Place Order · Rs ${totals.total}`}
                     </button>
                   </div>
                 </div>
               )}
             </motion.div>
           </AnimatePresence>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
           <div className="glass p-8 space-y-8">
              <div className="eyebrow">Your Bag</div>
              <ul className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {cartState.cart.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="h-20 w-16 bg-secondary flex-shrink-0"><img src={item.image} className="w-full h-full object-cover" alt=""/></div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-widest truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{item.color} · {item.qty}x</div>
                      <div className="text-xs font-medium">Rs {item.price * item.qty}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-border/50 space-y-4">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground uppercase tracking-widest">Subtotal</span><span>Rs {totals.subtotal}</span></div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-widest">Shipping</span>
                  <span className="text-accent uppercase tracking-widest">
                    {totals.shipping === 0 ? "Free" : `Rs ${totals.shipping}`}
                  </span>
                </div>
                {totals.discount > 0 && <div className="flex justify-between text-xs text-accent"><span className="uppercase tracking-widest">Discount</span><span>- Rs {totals.discount}</span></div>}
                <div className="flex justify-between text-lg font-medium pt-4 border-t border-border/50"><span>Total</span><span>Rs {totals.total}</span></div>
              </div>
           </div>
        </aside>
      </section>
    </Layout>
  );
}
