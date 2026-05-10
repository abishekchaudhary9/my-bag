import { Mail, MapPin, Phone, ShoppingBag, User, X } from "lucide-react";

function money(value: number | string | undefined) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function fallback(value?: string | number | null) {
  return value === undefined || value === null || value === "" ? "Not provided" : String(value);
}

export default function OrderDetailsModal({
  order,
  loading,
  onClose,
  onCancel,
}: {
  order: any | null;
  loading: boolean;
  onClose: () => void;
  onCancel?: () => void;
}) {
  const cancel = onCancel || onClose;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={cancel}>
      <div
        className="bg-background w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-border animate-fade-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 md:px-8 py-5 flex items-center justify-between">
          <div>
            <div className="eyebrow mb-1">Order Details</div>
            <h2 className="font-display text-3xl tracking-tight">{order?.id || "Loading..."}</h2>
          </div>
          <button onClick={cancel} className="p-2 hover:bg-secondary transition-colors" aria-label="Close">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {loading || !order ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading order details...</div>
        ) : (
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid md:grid-cols-4 gap-3">
              <SummaryCard label="Status" value={order.status} />
              <SummaryCard label="Date" value={order.date} />
              <SummaryCard label="Payment" value={order.paymentMethod} />
              <SummaryCard label="Total" value={money(order.total)} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <section className="border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-accent" strokeWidth={1.5} />
                  <div className="eyebrow">Customer Account</div>
                </div>
                <div className="space-y-3 text-sm">
                  <Detail label="Name" value={order.customer?.name} />
                  <Detail label="Email" value={order.customer?.email} icon={Mail} />
                  <Detail label="Phone" value={order.customer?.phone} icon={Phone} />
                  <Detail label="Customer ID" value={order.customer?.id} />
                  <Detail label="Joined" value={order.customer?.joined ? new Date(order.customer.joined).toLocaleDateString() : "N/A"} />
                  <Detail label="Registered Address" value={order.customer?.registeredAddress?.formatted} icon={MapPin} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                  <MiniStat label="Orders" value={order.customer?.stats?.totalOrders || 0} />
                  <MiniStat label="Spent" value={money(order.customer?.stats?.totalSpent)} />
                  <MiniStat
                    label="Last Order"
                    value={order.customer?.stats?.lastOrderDate ? new Date(order.customer.stats.lastOrderDate).toLocaleDateString() : "None"}
                  />
                </div>
              </section>

              <section className="border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-accent" strokeWidth={1.5} />
                  <div className="eyebrow">Shipping Details</div>
                </div>
                <div className="space-y-3 text-sm">
                  <Detail label="Recipient" value={order.shippingContact?.name || order.customer?.name} />
                  <Detail label="Email" value={order.shippingContact?.email || order.customer?.email} icon={Mail} />
                  <Detail label="Phone" value={order.shippingContact?.phone || order.customer?.phone} icon={Phone} />
                  <Detail label="Address" value={order.shippingAddress?.formatted} icon={MapPin} />
                  <Detail label="Tracking" value={order.trackingNumber} />
                </div>
              </section>
            </div>

            <section className="border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-accent" strokeWidth={1.5} />
                <div className="eyebrow">Items Ordered</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Item</th>
                      <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Color</th>
                      <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Size</th>
                      <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Qty</th>
                      <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Price</th>
                      <th className="px-5 py-3 text-xs text-muted-foreground font-medium text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any, idx: number) => (
                      <tr key={`${item.name}-${item.color}-${item.size}-${idx}`} className="border-b border-border/50 last:border-0">
                        <td className="px-5 py-3 font-medium">{item.name}</td>
                        <td className="px-5 py-3">{fallback(item.color)}</td>
                        <td className="px-5 py-3">{fallback(item.size)}</td>
                        <td className="px-5 py-3">{item.qty}</td>
                        <td className="px-5 py-3">{money(item.price)}</td>
                        <td className="px-5 py-3 text-right">{money(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="max-w-sm ml-auto space-y-2 text-sm">
              <TotalRow label="Subtotal" value={money(order.subtotal)} />
              <TotalRow label="Shipping" value={money(order.shipping)} />
              <TotalRow label="Discount" value={`-${money(order.discount)}`} />
              <div className="pt-3 border-t border-border flex justify-between font-medium">
                <span>Total</span>
                <span>{money(order.total)}</span>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border border-border p-4">
      <div className="eyebrow mb-2">{label}</div>
      <div className="text-sm capitalize">{value || "..."}</div>
    </div>
  );
}

function Detail({ label, value, icon: Icon }: { label: string; value?: string; icon?: typeof Mail }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.5} />}
        {label}
      </div>
      <div>{fallback(value)}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-secondary/40 p-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

