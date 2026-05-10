import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Check, Package, ArrowRight, Printer, Copy } from "lucide-react";
import Layout from "@/components/layouts/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ordersApi } from "@/lib/api";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, isAdmin, socket, fetchOrders } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const q = searchParams.get("q");
        const pidx = searchParams.get("pidx");
        const status = searchParams.get("status");

        let needsVerification = false;

        if ((q === "khalti" && pidx && status === "Completed") || q === "su") {
          needsVerification = true;
          const method = q === "khalti" ? "khalti" : "esewa";
          try {
            await ordersApi.verifyPayment(orderId, pidx || "", method);
            toast.success("Payment verified successfully!");
            // Clean up URL
            searchParams.delete("q");
            searchParams.delete("pidx");
            searchParams.delete("status");
            searchParams.delete("oid");
            searchParams.delete("amt");
            searchParams.delete("refId");
            setSearchParams(searchParams, { replace: true });
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        }

        const res = await ordersApi.get(orderId);
        setOrder(res.order);
        
        if (needsVerification) {
          fetchOrders();
        }
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;
    
    socket.on("order_update", (data) => {
      if (data.orderNumber === orderId) {
        ordersApi.get(orderId).then((res) => setOrder(res.order)).catch(console.error);
        fetchOrders();
      }
    });

    return () => {
      socket.off("order_update");
    };
  }, [socket, orderId, fetchOrders]);

  if (loading || state.loading) {
    return (
      <Layout>
        <div className="container-luxe py-32 grid place-items-center animate-fade-up">
          <div className="animate-spin h-8 w-8 border-2 border-border border-t-foreground rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <h1 className="font-display text-4xl">Order not found</h1>
          <p className="mt-4 text-muted-foreground">This order may have been placed in a different session.</p>
          <Link to={isAdmin ? "/admin" : "/shop"} className="mt-8 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">
            {isAdmin ? "Back to Admin Panel" : "Continue Shopping"}
          </Link>
        </div>
      </Layout>
    );
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied");
  };

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Success animation */}
          <div className="text-center animate-fade-up">
            <div className={`mx-auto h-24 w-24 rounded-full grid place-items-center mb-8 animate-scale-in ${
              order.paymentStatus === 'paid' || order.paymentMethod === 'cod' 
                ? 'bg-emerald-500/10' 
                : 'bg-amber-500/10'
            }`}>
              <div className={`h-16 w-16 rounded-full grid place-items-center ${
                order.paymentStatus === 'paid' || order.paymentMethod === 'cod' 
                  ? 'bg-emerald-500/20' 
                  : 'bg-amber-500/20'
              }`}>
                {order.paymentStatus === 'paid' || order.paymentMethod === 'cod' ? (
                  <Check className="h-8 w-8 text-emerald-600" strokeWidth={2} />
                ) : (
                  <Package className="h-8 w-8 text-amber-600 animate-pulse" strokeWidth={2} />
                )}
              </div>
            </div>
            
            <div className={`eyebrow mb-4 ${
              order.paymentStatus === 'paid' || order.paymentMethod === 'cod' 
                ? 'text-emerald-600' 
                : 'text-amber-600'
            }`}>
              {order.paymentMethod === 'cod' ? 'Order Placed' : order.paymentStatus === 'paid' ? 'Payment Verified' : 'Awaiting Payment'}
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl">
              {order.paymentStatus === 'paid' || order.paymentMethod === 'cod' ? 'Thank you.' : 'Processing...'}
            </h1>
            
            <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
              {order.paymentMethod === 'cod' 
                ? "Your order has been received and will be paid for upon delivery."
                : order.paymentStatus === 'paid'
                ? "Your payment has been successfully verified. Our atelier is now preparing your piece."
                : "We are currently verifying your payment with the provider. This usually takes a few moments."}
            </p>
          </div>

          {/* Order ID */}
          <div className="mt-10 flex items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="px-5 py-3 bg-secondary flex items-center gap-3">
              <Package className="h-4 w-4 text-accent" strokeWidth={1.5} />
              <span className="text-sm">Order</span>
              <span className="font-display text-lg">{order.id}</span>
              <button onClick={copyOrderId} className="text-muted-foreground hover:text-foreground transition-colors">
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Order details */}
          <div className="mt-12 bg-secondary/40 p-6 md:p-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="eyebrow">Order Details</div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground link-underline"
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
                Print
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Date & Time</div>
                <div className="text-sm">{new Date(order.createdAt).toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="text-sm capitalize">{order.status}</span>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="col-span-full mt-2 pt-4 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Tracking Number</div>
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                    navigator.clipboard.writeText(order.trackingNumber);
                    toast.success("Tracking number copied");
                  }}>
                    <span className="text-lg font-display tracking-tight text-accent">{order.trackingNumber}</span>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Use this code to track your atelier shipment.</p>
                </div>
              )}
            </div>

            <div className="hairline" />

            <ul className="py-6 space-y-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-secondary grid place-items-center text-xs text-muted-foreground flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6" strokeWidth={1} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.color} · {item.size} · Qty {item.qty}</div>
                  </div>
                  <div className="text-sm">Rs {(item.price * item.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>

            <div className="hairline" />

            <div className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs {order.subtotal.toFixed(2)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-accent"><span>Discount</span><span>−Rs {order.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? "Complimentary" : `Rs ${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-baseline">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-2xl">Rs {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
            <Link
              to={isAdmin ? "/admin" : "/orders"}
              className="group flex items-center justify-center gap-3 border border-border py-4 text-[13px] uppercase tracking-[0.18em] hover:border-foreground transition-colors"
            >
              {isAdmin ? "Back to Admin Panel" : "View All Orders"}
            </Link>
            {!isAdmin && (
              <Link
                to="/shop"
                className="group flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

