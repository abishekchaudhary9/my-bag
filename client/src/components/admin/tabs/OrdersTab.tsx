import * as React from "react";
import { 
  Clock, 
  Truck, 
  CheckCircle, 
  DollarSign, 
  Search, 
  Eye, 
  Settings 
} from "lucide-react";
import { MetricCard, StatusPill } from "../AdminShared";
import { TableSkeleton } from "../AdminSkeletons";
import { formatCurrency, parseCurrency } from "@/utils/adminUtils";

interface OrdersTabProps {
  loading: boolean;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  visibleOrders: any[];
  orderSearch: string;
  setOrderSearch: (s: string) => void;
  orderFilter: string;
  setOrderFilter: (s: string) => void;
  fetchOrders: (status?: string) => void;
  handleViewOrder: (id: string) => void;
  setEditOrder: (order: any) => void;
}

export function OrdersTab({
  loading,
  processingOrders,
  shippedOrders,
  deliveredOrders,
  visibleOrders,
  orderSearch,
  setOrderSearch,
  orderFilter,
  setOrderFilter,
  fetchOrders,
  handleViewOrder,
  setEditOrder
}: OrdersTabProps) {
  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Clock} label="Processing" value={processingOrders} detail="Awaiting shipment" tone="text-amber-600" index={0} />
        <MetricCard icon={Truck} label="Shipped" value={shippedOrders} detail="En route to customer" tone="text-blue-600" index={1} />
        <MetricCard icon={CheckCircle} label="Delivered" value={deliveredOrders} detail="Completed sales" tone="text-emerald-600" index={2} />
        <MetricCard icon={DollarSign} label="Visible Value" value={formatCurrency(visibleOrders.reduce((sum, order) => sum + parseCurrency(order.total), 0))} detail="Filtered total amount" index={3} />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search orders by ID, customer name, email..." className="w-full bg-background border border-border px-10 py-2.5 text-sm focus:border-foreground focus:outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <button key={s} onClick={() => { setOrderFilter(s); fetchOrders(s); }} className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${orderFilter === s ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:border-foreground/40"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border text-muted-foreground">No orders matching your filters.</div>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/30 text-left">
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Order ID</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Customer</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Total</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest text-right">Actions</th>
            </tr></thead>
            <tbody>
              {visibleOrders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 font-medium">#{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer}</div>
                    <div className="text-[10px] text-muted-foreground">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3">{o.total}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleViewOrder(o.id)} className="p-1.5 border border-border hover:border-foreground transition-colors"><Eye className="h-4 w-4" strokeWidth={1.5} /></button>
                      <button onClick={() => setEditOrder(o)} className="p-1.5 border border-border hover:border-foreground transition-colors"><Settings className="h-4 w-4" strokeWidth={1.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

