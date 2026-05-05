import { Link } from "react-router-dom";
import { Package, Truck, Check, X, Eye, CheckCircle2, Circle } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";

const STATUS_MAP = {
  processing: { color: "bg-amber-500", label: "Processing", icon: Package },
  shipped: { color: "bg-blue-500", label: "Shipped", icon: Truck },
  delivered: { color: "bg-emerald-500", label: "Delivered", icon: Check },
  cancelled: { color: "bg-red-500", label: "Cancelled", icon: X },
};

export default function Orders() {
  const { state, isAdmin } = useAuth();

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
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
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

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-display text-lg">Rs {order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.trackingNumber && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          Tracking: {order.trackingNumber}
                        </span>
                      )}
                      <Link
                        to={`/order-confirmation/${order.id}`}
                        className="flex items-center gap-2 text-xs text-accent link-underline"
                      >
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                        View
                      </Link>
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
    { id: "processing", label: "Processing", desc: "We are preparing your order." },
    { id: "shipped", label: "Shipped", desc: "Your order is on the way." },
    { id: "delivered", label: "Delivered", desc: "Your order has arrived." }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-secondary -z-10" />
      <div 
        className="absolute top-4 left-4 h-0.5 bg-foreground -z-10 transition-all duration-1000"
        style={{ width: currentIndex === -1 ? '0%' : `${(currentIndex / (steps.length - 1)) * 100}%` }}
      />
      
      <div className="flex justify-between">
        {steps.map((step, idx) => {
          const isCompleted = currentIndex >= idx;
          const isCurrent = currentIndex === idx;
          
          return (
            <div key={step.id} className="flex flex-col items-center w-1/3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-background border-2 transition-colors duration-500 ${isCompleted ? 'border-foreground text-foreground' : 'border-border text-muted-foreground'}`}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 opacity-20" />}
              </div>
              <div className={`mt-3 text-[11px] uppercase tracking-widest font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </div>
              {isCurrent && (
                <div className="text-[10px] text-muted-foreground mt-1 text-center max-w-[120px] hidden sm:block animate-fade-in">
                  {step.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
