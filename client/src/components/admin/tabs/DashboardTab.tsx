import * as React from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Activity, 
  Eye, 
  RefreshCw 
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { MetricCard, Panel, ChartTooltip, StatusPill } from "../AdminShared";
import { DashboardSkeleton } from "../AdminSkeletons";
import { formatCurrency } from "@/utils/adminUtils";
import { AdminTab } from "@/constants/adminConstants";

interface DashboardTabProps {
  loading: boolean;
  displayRevenue: number;
  displayOrders: number;
  processingOrders: number;
  shippedOrders: number;
  displayCustomers: number;
  topCustomers: any[];
  displayAvgOrder: number;
  deliveredOrders: number;
  revenueTrend: any[];
  statusData: any[];
  categoryData: any[];
  lowStockProducts: any[];
  unresolvedFeedback: number;
  inventoryStats: { value: number; avg: number };
  recentOrders: any[];
  viewOrderLoading: boolean;
  viewOrder: any;
  setTab: (tab: AdminTab) => void;
  setOrderFilter: (filter: string) => void;
  fetchOrders: (status?: string) => void;
  handleViewOrder: (id: string) => void;
  setEditProduct: (product: any) => void;
}

export function DashboardTab({
  loading,
  displayRevenue,
  displayOrders,
  processingOrders,
  shippedOrders,
  displayCustomers,
  topCustomers,
  displayAvgOrder,
  deliveredOrders,
  revenueTrend,
  statusData,
  categoryData,
  lowStockProducts,
  unresolvedFeedback,
  inventoryStats,
  recentOrders,
  viewOrderLoading,
  viewOrder,
  setTab,
  setOrderFilter,
  fetchOrders,
  handleViewOrder,
  setEditProduct
}: DashboardTabProps) {
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} label="Revenue" value={formatCurrency(displayRevenue)} detail={`${displayOrders} orders tracked`} tone="text-emerald-600" index={0} />
        <MetricCard icon={ShoppingBag} label="Orders" value={displayOrders} detail={`${processingOrders} processing, ${shippedOrders} shipped`} tone="text-blue-600" index={1} />
        <MetricCard icon={Users} label="Customers" value={displayCustomers} detail={`${topCustomers.length} high-value profiles`} tone="text-violet-600" index={2} />
        <MetricCard icon={TrendingUp} label="Avg. Order" value={formatCurrency(displayAvgOrder)} detail={`${deliveredOrders} delivered orders`} tone="text-amber-600" index={3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <Panel title="Revenue Trend" eyebrow="Last active order days" index={4} action={<button onClick={() => setTab("orders")} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">Orders</button>}>
          {revenueTrend.length === 0 ? (
            <div className="grid h-[280px] place-items-center text-sm text-muted-foreground border border-dashed border-border">No revenue data yet.</div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b98f47" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#b98f47" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} width={42} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#b98f47" strokeWidth={2} fill="url(#revenueGradient)" />
                  <Area type="monotone" dataKey="orders" name="Orders" stroke="#111827" strokeWidth={1.8} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Order Mix" eyebrow="Status distribution" index={5}>
          {statusData.length === 0 ? (
            <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">No order status data.</div>
          ) : (
            <div className="grid gap-4">
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="orders" nameKey="label" innerRadius={48} outerRadius={76} paddingAngle={3}>
                      {statusData.map((entry) => <Cell key={entry.status} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {statusData.map((item) => (
                  <button key={item.status} onClick={() => { setOrderFilter(item.status); setTab("orders"); fetchOrders(item.status); }} className="flex w-full items-center justify-between border border-border px-3 py-2 text-left text-xs hover:border-foreground/40">
                    <span className="flex items-center gap-2 capitalize">
                      <span className="h-2 w-2" style={{ background: item.fill }} />
                      {item.status}
                    </span>
                    <span className="font-medium">{item.orders}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <Panel title="Inventory by Category" eyebrow="Stock value and quantity" index={6}>
          {categoryData.length === 0 ? (
            <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">No inventory data yet.</div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={42} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar yAxisId="left" dataKey="value" name="Inventory value" fill="#111827" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="stock" name="Stock" fill="#b98f47" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Operations Queue" eyebrow="Action center" index={7}>
          <div className="grid gap-3">
            {[
              { label: "Processing orders", value: processingOrders, icon: Clock, tone: "text-amber-600", action: () => { setOrderFilter("processing"); setTab("orders"); fetchOrders("processing"); } },
              { label: "Shipped orders", value: shippedOrders, icon: Truck, tone: "text-blue-600", action: () => { setOrderFilter("shipped"); setTab("orders"); fetchOrders("shipped"); } },
              { label: "Low stock items", value: lowStockProducts.length, icon: AlertTriangle, tone: "text-red-600", action: () => setTab("products") },
              { label: "Open feedback", value: unresolvedFeedback, icon: Activity, tone: "text-violet-600", action: () => setTab("feedback") },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={item.action} className="flex items-center justify-between border border-border p-3 text-left hover:border-foreground/40 hover:bg-secondary/30">
                  <span className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.tone}`} strokeWidth={1.5} />
                    <span className="text-sm">{item.label}</span>
                  </span>
                  <span className="font-display text-xl">{item.value}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-xs">
            <div>
              <div className="text-muted-foreground">Inventory value</div>
              <div className="mt-1 font-medium">{formatCurrency(inventoryStats.value)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Avg. stock</div>
              <div className="mt-1 font-medium">{inventoryStats.avg} units</div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Panel title="Recent Orders" eyebrow="Customer activity" index={8} action={<button onClick={() => setTab("orders")} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">View all</button>}>
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left">
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Order</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Customer</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Total</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium text-right">Action</th>
                </tr></thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{o.id}</td>
                      <td className="py-3">
                        <div className="font-medium">{o.customer}</div>
                        <div className="max-w-[210px] truncate text-xs text-muted-foreground">{o.customerEmail || new Date(o.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3">{o.total}</td>
                      <td className="py-3"><StatusPill status={o.status} /></td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleViewOrder(o.id)} disabled={viewOrderLoading && viewOrder?.id === o.id} className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs hover:border-foreground disabled:opacity-50">
                          {viewOrderLoading && viewOrder?.id === o.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                          )}
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Low Stock Watchlist" eyebrow="Inventory attention" index={9}>
          {lowStockProducts.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No low stock products.</div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <button key={product.id} onClick={() => setEditProduct(product)} className="flex w-full items-center justify-between border border-border p-3 text-left hover:border-foreground/40">
                  <span className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 bg-secondary flex-shrink-0">
                      {product.colors?.[0]?.image && <img src={product.colors[0].image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{product.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.category}</div>
                    </div>
                  </span>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${(Number(product.stock) || 0) <= 5 ? "text-red-600" : "text-amber-600"}`}>{product.stock} left</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">In stock</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

