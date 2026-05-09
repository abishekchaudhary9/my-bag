import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, Check, X, Eye, CheckCircle2, Circle } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl } from "@/lib/api";

const STATUS_MAP = {
  processing: { color: "bg-amber-500", label: "Processing", icon: Package },
  shipped: { color: "bg-blue-500", label: "Shipped", icon: Truck },
  delivered: { color: "bg-emerald-500", label: "Delivered", icon: Check },
  cancelled: { color: "bg-red-500", label: "Cancelled", icon: X },
};

export default function Orders() {
  const { state, isAdmin, socket, fetchOrders } = useAuth();

  useEffect(() => {
    if (!socket || !state.isAuthenticated) return;

    socket.on("order_update", () => {
      fetchOrders();
    });

    return () => {
      socket.off("order_update");
    };
  }, [socket, state.isAuthenticated, fetchOrders]);

  if (isAdmin) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Restricted</div>
          <h1 className="font-display text-5xl md:text-6xl">Admin Order Management</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">
            Manage all orders from the Admin Panel.
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

  if (!state.isAuthenticated) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Orders</div>
          <h1 className="font-display text-5xl md:text-6xl">Sign in to view orders</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">
            You need to be signed in to view your order history.
          </p>
          <Link
            to="/login"
            className="mt-10 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-luxe pt-12 pb-8">
        <div className="eyebrow mb-3">Your Account</div>
        <h1 className="font-display text-4xl md:text-5xl">Order History</h1>
        <p className="mt-3 text-muted-foreground text-sm">
          {state.orders.length} {state.orders.length === 1 ? "order" : "orders"} placed
        </p>
      </section>

      <section className="container-luxe pb-24">
        {state.orders.length === 0 ? (
          <div className="py-20 text-center animate-fade-up">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-6" strokeWidth={1} />
            <h2 className="font-display text-2xl mb-3">No orders yet</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Once you place your first order, it will appear here.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {state.orders.map((order, idx) => {
              const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.processing;
              const StatusIcon = status.icon;
              return (
                <article
                  key={order.id}
                  className="border border-border p-5 md:p-7 animate-fade-up hover:border-foreground/30 transition-colors"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="font-display text-xl">{order.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${status.color}`} />
                      <span className="text-sm">{status.label}</span>
                      <StatusIcon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                  </div>

                  <div className="mb-8">
                    {order.status === "cancelled" ? (
                      <div className="bg-red-500/10 text-red-500 p-4 border border-red-500/20 text-sm flex items-center gap-2">
                        <X className="h-4 w-4" /> This order has been cancelled.
                      </div>
                    ) : (
                      <OrderTracker currentStatus={order.status} />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mb-5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-secondary/40 px-3 py-2">
                        <div className="h-10 w-10 bg-secondary flex-shrink-0 grid place-items-center">
                          {item.image ? (
                            <img src={resolveAssetUrl(item.image)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground">{item.color} · ×{item.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 gap-6 border-t border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground eyebrow !mb-0 lowercase">Total</span>
                      <span className="font-display text-xl tracking-tight">Rs {order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      {order.trackingNumber && (
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground border-l border-border pl-4">
                          Ref: {order.trackingNumber}
                        </div>
                      )}
                      <div className="flex items-center gap-4 ml-auto sm:ml-0">
                        <Link
                          to={`/order-confirmation/${order.id}`}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Details
                        </Link>
                        {order.status === "delivered" && order.items.length > 0 && (
                          <Link
                            to={`/product/${order.items[0].name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-accent font-bold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}

function OrderTracker({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { id: "processing", label: "Processing", desc: "Preparing" },
    { id: "shipped", label: "Shipped", desc: "In Transit" },
    { id: "delivered", label: "Delivered", desc: "Arrived" }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="relative py-4 px-2 overflow-x-auto no-scrollbar">
      <div className="min-w-[300px]">
        <div className="absolute top-[34px] left-10 right-10 h-[1px] bg-border -z-10" />
        <div 
          className="absolute top-[34px] left-10 h-[1px] bg-foreground -z-10 transition-all duration-1000 ease-in-out"
          style={{ width: currentIndex <= 0 ? '0%' : currentIndex === 1 ? '45%' : '80%' }}
        />
        
        <div className="flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = currentIndex >= idx;
            const isCurrent = currentIndex === idx;
            
            return (
              <div key={step.id} className="flex flex-col items-center w-1/3 relative">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-background border transition-all duration-700 ${isCompleted ? 'border-foreground text-foreground' : 'border-border text-muted-foreground'} ${isCurrent ? 'ring-8 ring-foreground/5 scale-110' : ''}`}>
                  {isCompleted ? (
                    <CheckCircle2 className={`h-5 w-5 ${isCurrent ? 'animate-pulse text-accent' : ''}`} />
                  ) : (
                    <Circle className="h-4 w-4 opacity-20" />
                  )}
                </div>
                <div className={`mt-4 text-[9px] uppercase tracking-[0.2em] font-black transition-colors duration-500 text-center ${isCompleted ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  {step.label}
                </div>
                {isCurrent && (
                  <div className="text-[8px] uppercase tracking-widest text-accent mt-1.5 font-bold animate-fade-in">
                    {step.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
