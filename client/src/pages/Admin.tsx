import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle,
  ChevronDown,
  Clock,
  DollarSign,
  Edit,
  Eye,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  TrendingUp,
  Trash2,
  Truck,
  Users,
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
  YAxis,
} from "recharts";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { adminApi, productsApi } from "@/lib/api";
import { products as localProducts } from "@/data/products";
import ProductModal from "@/components/admin/ProductModal";
import OrderStatusModal from "@/components/admin/OrderStatusModal";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "sonner";

/* ─── Admin Layout ─────────────────────────────────────── */
function AdminLayout({ children }: { children: React.ReactNode }) {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); toast.success("Signed out"); navigate("/"); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-display text-xl md:text-2xl tracking-tight">MAISON<span className="text-accent">.</span></Link>
            <span className="text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 bg-accent text-accent-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3" strokeWidth={2} /> Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">{state.user?.firstName} {state.user?.lastName}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-destructive hover:underline">
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

/* ─── Status helpers ───────────────────────────────────── */
const statusColor: Record<string, string> = {
  processing: "bg-amber-500", shipped: "bg-blue-500", delivered: "bg-emerald-500", cancelled: "bg-red-500",
};

const statusTone: Record<string, string> = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const chartColors = ["#111827", "#b98f47", "#2563eb", "#059669", "#dc2626", "#7c3aed"];

const parseCurrency = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number) => `Rs ${Math.round(value).toLocaleString()}`;

const formatCompact = (value: number) => {
  if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}K`;
  return formatCurrency(value);
};

const getInitials = (name = "") => name
  .split(" ")
  .filter(Boolean)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "text-muted-foreground",
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  detail: string;
  tone?: string;
}) {
  return (
    <div className="border border-border bg-background p-5 transition-colors hover:border-foreground/30">
      <div className="flex items-center justify-between gap-4">
        <Icon className={`h-5 w-5 ${tone}`} strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-5 break-words font-display text-2xl tracking-tight md:text-3xl">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-border bg-background p-5 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h2 className="font-display text-xl tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-xs capitalize ${statusTone[status] || "bg-secondary text-foreground border-border"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusColor[status] || "bg-muted-foreground"}`} />
      {status}
    </span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="mb-1 font-medium">{label}</div>
      <div className="space-y-1">
        {payload.map((item: any) => (
          <div key={`${item.name}-${item.value}`} className="flex items-center gap-2">
            <span className="h-2 w-2" style={{ background: item.color }} />
            <span className="text-muted-foreground">{String(item.name).charAt(0).toUpperCase() + String(item.name).slice(1)}:</span>
            <span className="font-medium">
              {typeof item.value === "number" && ["revenue", "value", "spent"].some((key) => item.name?.toLowerCase().includes(key)) ? formatCompact(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Tab = "dashboard" | "products" | "orders" | "customers" | "feedback" | "notifications" | "coupons";

/* ─── Main Admin Page ──────────────────────────────────── */
export default function Admin() {
  const { state, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  /* Data states */
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ reviews: any[], questions: any[] }>({ reviews: [], questions: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* Modal states */
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editOrder, setEditOrder] = useState<any | null>(null);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [viewOrderLoading, setViewOrderLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  /* ─── Data fetching ─────────────────────────────────── */
  const fetchStats = useCallback(async () => {
    try { const d = await adminApi.stats(); setStats(d.stats); } catch { /* fallback */ }
  }, []);

  const fetchOrders = useCallback(async (status?: string) => {
    try {
      const d = await adminApi.orders(status === "all" ? undefined : status);
      setOrders(d.orders);
    } catch { /* keep existing */ }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try { const d = await adminApi.customers(); setCustomers(d.customers); } catch {}
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const d = await productsApi.list();
      setProductList(d.products);
    } catch {
      setProductList(localProducts as any[]);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try { 
      const d = await adminApi.feedback(); 
      if (d) setFeedback({ reviews: d.reviews || [], questions: d.questions || [] }); 
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try { 
      const d = await adminApi.notifications(); 
      if (d && d.notifications) setNotifications(d.notifications); 
    } catch {}
  }, []);

  const fetchCoupons = useCallback(async () => {
    try { 
      const d = await adminApi.coupons(); 
      if (d && d.coupons) setCoupons(d.coupons); 
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    fetchOrders();
    fetchCustomers();
    fetchProducts();
    fetchFeedback();
    fetchNotifications();
    fetchCoupons();
  }, [isAdmin, fetchStats, fetchOrders, fetchCustomers, fetchProducts, fetchFeedback, fetchNotifications, fetchCoupons]);

  /* ─── Auth guard ────────────────────────────────────── */
  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" strokeWidth={1} />
          <div className="eyebrow animate-pulse">Authenticating Admin...</div>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Restricted</div>
          <h1 className="font-display text-5xl md:text-6xl">Admin Access Required</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">Sign in with an admin account to access this panel.</p>
          <Link to="/login" className="mt-10 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">Sign In as Admin</Link>
        </div>
      </Layout>
    );
  }

  /* ─── CRUD handlers ─────────────────────────────────── */
  const handleSaveProduct = async (data: any) => {
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, data);
        toast.success("Product updated");
      } else {
        await productsApi.create(data);
        toast.success("Product created");
      }
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
      throw err;
    }
  };

  const handleCreateCoupon = async () => {
    const code = prompt("Enter coupon code (e.g., SUMMER20):");
    if (!code) return;
    const pct = prompt("Enter discount percentage (1-100):");
    if (!pct || isNaN(Number(pct))) return;

    try {
      await adminApi.createCoupon({ code, discount_pct: Number(pct), active: true });
      toast.success("Coupon created!");
      await fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    }
  };

  const handleDeleteProduct = async (p: any) => {
    try {
      await productsApi.delete(p.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleUpdateOrder = async (orderNumber: string, data: any) => {
    try {
      await adminApi.updateOrder(orderNumber, data);
      setOrders((prev) => prev.map((o) => o.id === orderNumber ? { ...o, status: data.status, trackingNumber: data.trackingNumber } : o));
      toast.success("Order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
      throw err;
    }
  };

  const handleViewOrder = async (orderNumber: string) => {
    setViewOrderLoading(true);
    setViewOrder({ id: orderNumber });
    try {
      const res = await adminApi.orderDetails(orderNumber);
      if (res && res.order) {
        setViewOrder(res.order);
      } else {
        toast.error("Order details not found");
        setViewOrder(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load order details");
      setViewOrder(null);
    } finally {
      setViewOrderLoading(false);
    }
  };

  const refresh = () => {
    setLoading(true);
    Promise.all([fetchStats(), fetchOrders(tab === "orders" ? orderFilter : "all"), fetchCustomers(), fetchProducts(), fetchFeedback(), fetchNotifications(), fetchCoupons()])
      .finally(() => { setLoading(false); toast.success("Data refreshed"); });
  };

  /* ─── Tab config ────────────────────────────────────── */
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "customers", label: "Customers", icon: Users },
    { key: "feedback", label: "Feedback", icon: TrendingUp },
    { key: "notifications", label: "Notifications", icon: AlertTriangle },
    { key: "coupons", label: "Coupons", icon: DollarSign },
  ];

  /* ─── Calculations ──────────────────────────────────── */
  const filteredProducts = useMemo(() => productList.filter((p) => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())), [productList, searchQ]);
  
  const visibleOrders = useMemo(() => orders.filter((o) => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return [o.id, o.customer, o.customerEmail, o.customerPhone, o.customerAddress]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  }), [orders, orderSearch]);

  const orderRevenue = useMemo(() => orders.reduce((sum, order) => sum + parseCurrency(order.total), 0), [orders]);
  const statsRevenue = stats ? parseCurrency(stats.revenue) : 0;
  const displayRevenue = stats ? statsRevenue : orderRevenue;
  const displayOrders = stats?.orders ?? orders.length;
  const displayCustomers = stats?.customers ?? customers.length;
  const displayAvgOrder = stats ? parseCurrency(stats.avgOrder) : (orders.length ? orderRevenue / orders.length : 0);
  
  const inventoryStats = useMemo(() => {
    const value = productList.reduce((sum, product) => sum + parseCurrency(product.price) * (Number(product.stock) || 0), 0);
    const avg = productList.length
      ? Math.round(productList.reduce((sum, product) => sum + (Number(product.stock) || 0), 0) / productList.length)
      : 0;
    return { value, avg };
  }, [productList]);

  const statusData = useMemo(() => ["processing", "shipped", "delivered", "cancelled"].map((status, index) => {
    const matching = orders.filter((order) => order.status === status);
    return {
      status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      orders: matching.length,
      revenue: matching.reduce((sum, order) => sum + parseCurrency(order.total), 0),
      fill: chartColors[index + 1],
    };
  }).filter((item) => item.orders > 0), [orders]);

  const revenueTrend = useMemo(() => {
    const buckets = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt || order.date);
      if (Number.isNaN(date.getTime())) return acc;
      const key = date.toISOString().slice(0, 10);
      if (!acc[key]) {
        acc[key] = {
          sort: date.getTime(),
          date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          revenue: 0,
          orders: 0,
        };
      }
      acc[key].revenue += parseCurrency(order.total);
      acc[key].orders += 1;
      return acc;
    }, {} as Record<string, { sort: number; date: string; revenue: number; orders: number }>);

    return Object.keys(buckets)
      .map((k) => buckets[k])
      .sort((a, b) => a.sort - b.sort)
      .slice(-7)
      .map((item) => ({
        date: item.date,
        revenue: item.revenue,
        orders: item.orders
      }));
  }, [orders]);

  const categoryData = useMemo(() => {
    const map = productList.reduce((acc, product) => {
      const category = product.category || "Uncategorized";
      if (!acc[category]) acc[category] = { category, products: 0, stock: 0, value: 0 };
      acc[category].products += 1;
      acc[category].stock += Number(product.stock) || 0;
      acc[category].value += parseCurrency(product.price) * (Number(product.stock) || 0);
      return acc;
    }, {} as Record<string, { category: string; products: number; stock: number; value: number }>);

    return Object.keys(map)
      .map((k) => map[k])
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [productList]);

  const lowStockProducts = useMemo(() => productList
    .filter((product) => (Number(product.stock) || 0) <= 10)
    .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
    .slice(0, 5), [productList]);

  const topCustomers = useMemo(() => customers
    .map((customer) => ({ ...customer, spentValue: parseCurrency(customer.spent) }))
    .sort((a, b) => b.spentValue - a.spentValue)
    .slice(0, 5), [customers]);
    
  const customerOrderCount = useMemo(() => customers.reduce((sum, customer) => sum + (Number(customer.orders) || 0), 0), [customers]);
  const customerLifetimeValue = useMemo(() => customers.reduce((sum, customer) => sum + parseCurrency(customer.spent), 0), [customers]);

  const processingOrders = orders.filter((order) => order.status === "processing").length;
  const shippedOrders = orders.filter((order) => order.status === "shipped").length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const unresolvedFeedback = feedback.reviews.length + feedback.questions.length;
  const recentOrders = orders.slice(0, 6);

  return (
    <AdminLayout>
      <section className="container-luxe pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow mb-3">Administration</div>
            <h1 className="font-display text-4xl md:text-5xl">Admin Panel</h1>
          </div>
          <button onClick={refresh} disabled={loading} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} /> Refresh
          </button>
        </div>
      </section>

      <section className="container-luxe pb-6">
        <div className="relative md:hidden">
          <select
            value={tab}
            onChange={(event) => {
              const nextTab = event.target.value as Tab;
              setTab(nextTab);
              if (nextTab === "orders") fetchOrders(orderFilter);
              if (nextTab === "dashboard") fetchOrders();
            }}
            className="w-full appearance-none border border-border bg-background px-4 py-3 pr-10 text-[13px] uppercase tracking-[0.14em] text-foreground focus:border-foreground focus:outline-none"
          >
            {tabs.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="hidden gap-1 border-b border-border md:flex">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => { setTab(t.key); if (t.key === "orders") fetchOrders(orderFilter); if (t.key === "dashboard") fetchOrders(); }}
                className={`flex items-center gap-2 px-5 py-3 text-[13px] uppercase tracking-[0.14em] border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" strokeWidth={1.5} /> {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="container-luxe pb-24">
        {/* ─── DASHBOARD ─── */}
        {tab === "dashboard" && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon={DollarSign} label="Revenue" value={formatCurrency(displayRevenue)} detail={`${displayOrders} orders tracked`} tone="text-emerald-600" />
              <MetricCard icon={ShoppingBag} label="Orders" value={displayOrders} detail={`${processingOrders} processing, ${shippedOrders} shipped`} tone="text-blue-600" />
              <MetricCard icon={Users} label="Customers" value={displayCustomers} detail={`${topCustomers.length} high-value profiles`} tone="text-violet-600" />
              <MetricCard icon={TrendingUp} label="Avg. Order" value={formatCurrency(displayAvgOrder)} detail={`${deliveredOrders} delivered orders`} tone="text-amber-600" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
              <Panel title="Revenue Trend" eyebrow="Last active order days" action={<button onClick={() => setTab("orders")} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">Orders</button>}>
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

              <Panel title="Order Mix" eyebrow="Status distribution">
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
              <Panel title="Inventory by Category" eyebrow="Stock value and quantity">
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

              <Panel title="Operations Queue" eyebrow="Action center">
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
              <Panel title="Recent Orders" eyebrow="Customer activity" action={<button onClick={() => setTab("orders")} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">View all</button>}>
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
                              <div className="max-w-[210px] truncate text-xs text-muted-foreground">{o.customerEmail || o.date}</div>
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

              <Panel title="Low Stock Watchlist" eyebrow="Inventory attention">
                {lowStockProducts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No low stock products.</div>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <button key={product.id} onClick={() => setEditProduct(product)} className="flex w-full items-center justify-between border border-border p-3 text-left hover:border-foreground/40">
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 flex-shrink-0 place-items-center bg-secondary">
                            <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{product.name}</span>
                            <span className="text-xs capitalize text-muted-foreground">{product.category}</span>
                          </span>
                        </span>
                        <span className="text-sm font-medium text-red-600">{Number(product.stock) || 0}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </div>
        )}

        {/* ─── PRODUCTS ─── */}
        {tab === "products" && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard icon={Package} label="Products" value={productList.length} detail={`${filteredProducts.length} matching search`} />
              <MetricCard icon={Boxes} label="Inventory" value={formatCurrency(inventoryStats.value)} detail={`${inventoryStats.avg} avg. units in stock`} tone="text-blue-600" />
              <MetricCard icon={AlertTriangle} label="Low Stock" value={lowStockProducts.length} detail="10 units or fewer" tone="text-red-600" />
              <MetricCard icon={BarChart3} label="Categories" value={categoryData.length} detail="Active product groups" tone="text-amber-600" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search products..." className="w-full bg-secondary/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent sm:w-64" />
              </div>
              <button onClick={() => { setEditProduct(null); setShowAddProduct(true); }} className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[12px] uppercase tracking-[0.16em] hover:bg-accent transition-colors">
                <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left">
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Product</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Category</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Price</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Stock</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium">Rating</th>
                  <th className="pb-3 text-xs text-muted-foreground font-medium text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-secondary overflow-hidden flex-shrink-0 grid place-items-center">
                            {p.colors && p.colors.length > 0 ? (
                              <img src={p.colors[0].image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                            )}
                          </div>
                          <div className="font-medium">{p.name}</div>
                        </div>
                      </td>
                      <td className="py-3 capitalize">{p.category}</td>
                      <td className="py-3">Rs {p.price}</td>
                      <td className="py-3"><span className={p.stock < 10 ? "text-amber-600" : ""}>{p.stock}</span></td>
                      <td className="py-3">{p.rating}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditProduct(p)} className="p-2 hover:bg-secondary transition-colors" title="Edit"><Edit className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-2 hover:bg-destructive/10 text-destructive transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {tab === "orders" && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Processing", value: processingOrders, icon: Clock, tone: "text-amber-600" },
                { label: "Shipped", value: shippedOrders, icon: Truck, tone: "text-blue-600" },
                { label: "Delivered", value: deliveredOrders, icon: CheckCircle, tone: "text-emerald-600" },
                { label: "Visible value", value: formatCurrency(visibleOrders.reduce((sum, order) => sum + parseCurrency(order.total), 0)), icon: DollarSign, tone: "text-foreground" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Icon className={`h-4 w-4 ${item.tone}`} strokeWidth={1.5} />
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</span>
                    </div>
                    <div className="mt-3 font-display text-2xl">{item.value}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto">
                {["all", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                  <button key={s} onClick={() => { setOrderFilter(s); fetchOrders(s); }} className={`px-4 py-2 text-xs uppercase tracking-wider capitalize transition-colors ${orderFilter === s ? "bg-foreground text-background" : "border border-border hover:border-foreground"}`}>{s}</button>
                ))}
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search orders, customers, email..." className="w-full bg-secondary/40 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
              </div>
            </div>
            {visibleOrders.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Order</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Customer</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Contact</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Items</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Total</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Status</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Date</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {visibleOrders.map((o) => (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3 font-medium">{o.id}</td>
                        <td className="py-3">
                          <div className="font-medium">{o.customer}</div>
                          <div className="text-xs text-muted-foreground max-w-[220px] truncate">{o.customerAddress || "No saved address"}</div>
                        </td>
                        <td className="py-3">
                          <div>{o.customerEmail}</div>
                          <div className="text-xs text-muted-foreground">{o.customerPhone || "No phone"}</div>
                        </td>
                        <td className="py-3">{o.items}</td>
                        <td className="py-3">{o.total}</td>
                        <td className="py-3"><StatusPill status={o.status} /></td>
                        <td className="py-3 text-muted-foreground">{o.date}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleViewOrder(o.id)} disabled={viewOrderLoading && viewOrder?.id === o.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-foreground transition-colors text-xs disabled:opacity-50">
                            {viewOrderLoading && viewOrder?.id === o.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                            )}
                            Details
                          </button>
                          <button onClick={() => setEditOrder(o)} className="p-2 hover:bg-secondary transition-colors"><Edit className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── CUSTOMERS ─── */}
        {tab === "customers" && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard icon={Users} label="Customers" value={customers.length} detail="Registered accounts" />
              <MetricCard icon={ShoppingBag} label="Orders" value={customerOrderCount} detail="Placed by customers" tone="text-blue-600" />
              <MetricCard icon={DollarSign} label="Lifetime Value" value={formatCurrency(customerLifetimeValue)} detail="Tracked customer spend" tone="text-emerald-600" />
              <MetricCard icon={TrendingUp} label="Avg. Customer" value={formatCurrency(customers.length ? customerLifetimeValue / customers.length : 0)} detail="Average total spend" tone="text-amber-600" />
            </div>

            {topCustomers.length > 0 && (
              <Panel title="Top Customers" eyebrow="By total spend">
                <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-5">
                  {topCustomers.map((customer) => (
                    <div key={customer.email} className="border-b border-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-xs font-medium text-background">{getInitials(customer.name)}</div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.orders} orders</div>
                        </div>
                      </div>
                      <div className="mt-4 font-display text-xl">{formatCurrency(customer.spentValue)}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {customers.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No customers yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Customer</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Email</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Orders</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Total Spent</th>
                    <th className="pb-3 text-xs text-muted-foreground font-medium">Joined</th>
                  </tr></thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.email} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-ink text-background grid place-items-center text-xs font-medium">{getInitials(c.name)}</div>
                            <span className="font-medium">{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">{c.email}</td>
                        <td className="py-3">{c.orders}</td>
                        <td className="py-3">{c.spent}</td>
                        <td className="py-3 text-muted-foreground">{c.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── FEEDBACK ─── */}
        {tab === "feedback" && (
          <div className="space-y-8 animate-fade-up">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard icon={Activity} label="Open Items" value={unresolvedFeedback} detail="Reviews and questions" tone="text-violet-600" />
              <MetricCard icon={TrendingUp} label="Reviews" value={feedback.reviews.length} detail="Waiting for replies" tone="text-amber-600" />
              <MetricCard icon={Users} label="Questions" value={feedback.questions.length} detail="Customer questions" tone="text-blue-600" />
              <MetricCard icon={CheckCircle} label="Resolved" value={unresolvedFeedback === 0 ? "Clear" : "Pending"} detail="Current queue state" tone={unresolvedFeedback === 0 ? "text-emerald-600" : "text-red-600"} />
            </div>

            <div>
              <div className="eyebrow mb-4">Unresolved Reviews</div>
              {feedback.reviews.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground border border-border">No unresolved reviews.</div>
              ) : (
                <div className="grid gap-4">
                  {feedback.reviews.map((r) => (
                    <div key={`rev-${r.id}`} className="p-5 border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link to={`/product/${r.productSlug}`} className="text-xs uppercase tracking-wider text-accent link-underline mb-1 inline-block">{r.productName}</Link>
                          <div className="font-medium text-sm">{r.title}</div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <div>{r.userName}</div>
                          <div>{new Date(r.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-sm text-foreground/80 mb-3">{r.text}</div>
                      <Link to={`/product/${r.productSlug}`} className="text-xs uppercase tracking-wider bg-foreground text-background px-4 py-1.5 hover:bg-accent transition-colors inline-block">Go to Product to Reply</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="eyebrow mb-4">Unanswered Questions</div>
              {feedback.questions.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground border border-border">No unanswered questions.</div>
              ) : (
                <div className="grid gap-4">
                  {feedback.questions.map((q) => (
                    <div key={`q-${q.id}`} className="p-5 border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link to={`/product/${q.productSlug}`} className="text-xs uppercase tracking-wider text-accent link-underline mb-1 inline-block">{q.productName}</Link>
                          <div className="font-medium text-sm">Q: {q.text}</div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <div>{q.userName}</div>
                          <div>{new Date(q.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Link to={`/product/${q.productSlug}`} className="mt-2 text-xs uppercase tracking-wider bg-foreground text-background px-4 py-1.5 hover:bg-accent transition-colors inline-block">Go to Product to Answer</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── NOTIFICATIONS ─── */}
        {tab === "notifications" && (
          <div className="space-y-6 animate-fade-up">
            <Panel title="System Notifications" eyebrow="User activity alerts">
              {notifications.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground border border-dashed border-border">No recent notifications.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left">
                      <th className="pb-3 text-xs text-muted-foreground font-medium">Recipient</th>
                      <th className="pb-3 text-xs text-muted-foreground font-medium">Title</th>
                      <th className="pb-3 text-xs text-muted-foreground font-medium">Message</th>
                      <th className="pb-3 text-xs text-muted-foreground font-medium text-right">Date</th>
                    </tr></thead>
                    <tbody>
                      {notifications.map((n) => (
                        <tr key={n.id} className="border-b border-border/50">
                          <td className="py-3">
                            <div className="font-medium">{(n.first_name || n.last_name) ? `${n.first_name || ""} ${n.last_name || ""}` : "System User"}</div>
                            <div className="text-xs text-muted-foreground">{n.user_email || "System"}</div>
                          </td>
                          <td className="py-3 font-medium">{n.title}</td>
                          <td className="py-3 text-muted-foreground max-w-xs truncate">{n.message}</td>
                          <td className="py-3 text-right text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* ─── COUPONS ─── */}
        {tab === "coupons" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex justify-between items-center">
              <h2 className="eyebrow">Active Discount Codes</h2>
              <button onClick={handleCreateCoupon} className="text-xs bg-foreground text-background px-4 py-2 uppercase tracking-wider">New Coupon</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.id} className="border border-border p-5 bg-secondary/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-display text-xl tracking-wider">{c.code}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {c.active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="text-3xl font-display mb-1">{c.discount_pct}% OFF</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest">Discount rate</div>
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="col-span-full py-16 text-center text-sm text-muted-foreground border border-dashed border-border">No coupons found.</div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ─── Modals ─── */}
      {(showAddProduct || editProduct) && (
        <ProductModal
          product={editProduct || undefined}
          onClose={() => { setShowAddProduct(false); setEditProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}
      {editOrder && (
        <OrderStatusModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
          onSave={handleUpdateOrder}
        />
      )}
      {viewOrder && (
        <OrderDetailsModal
          order={viewOrder}
          loading={viewOrderLoading}
          onClose={() => setViewOrder(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete Product"
          onConfirm={() => handleDeleteProduct(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
