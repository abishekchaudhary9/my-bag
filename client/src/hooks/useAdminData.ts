import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { adminApi, productsApi } from "@/lib/api";
import { products as localProducts } from "@/data/products";
import { parseCurrency } from "@/utils/adminUtils";

export function useAdminData() {
  const [loadingCount, setLoadingCount] = useState(0);
  const loading = loadingCount > 0;
  
  const incrementLoading = useCallback(() => setLoadingCount(c => c + 1), []);
  const decrementLoading = useCallback(() => setLoadingCount(c => Math.max(0, c - 1)), []);

  // Dashboard & Stats
  const [stats, setStats] = useState<any>(null);
  const [productList, setProductList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState({ reviews: [] as any[], questions: [] as any[] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [paymentPendingOrders, setPaymentPendingOrders] = useState(0);

  const fetchStats = useCallback(async () => {
    incrementLoading();
    try { 
      const d = await adminApi.stats(); 
      const nextStats = d?.stats || {};
      setStats(nextStats); 
      setPaymentPendingOrders(nextStats.paymentPendingOrders || 0);
    } catch (err: any) { 
      console.error("Stats fetch failed:", err);
      toast.error("Could not load dashboard stats");
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  const fetchOrders = useCallback(async (status?: string) => {
    incrementLoading();
    try {
      const d = await adminApi.orders(status === "all" ? undefined : status);
      setOrders(Array.isArray(d?.orders) ? d.orders : []);
    } catch (err: any) {
      console.error("Orders fetch failed:", err);
      toast.error("Could not load orders list");
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  const fetchCustomers = useCallback(async () => {
    incrementLoading();
    try { 
      const d = await adminApi.customers(); 
      setCustomers(Array.isArray(d?.customers) ? d.customers : []); 
    } catch (err: any) {
      console.error("Customers fetch failed:", err);
      toast.error("Could not load customers list");
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  const fetchProducts = useCallback(async () => {
    incrementLoading();
    try {
      const d = await productsApi.list();
      setProductList(Array.isArray(d?.products) ? d.products : localProducts as any[]);
    } catch {
      setProductList(Array.isArray(localProducts) ? localProducts as any[] : []);
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  const fetchFeedback = useCallback(async () => {
    incrementLoading();
    try { 
      const d = await adminApi.feedback(); 
      if (d) setFeedback({ reviews: d.reviews || [], questions: d.questions || [] }); 
    } catch (err: any) {
      console.error("Feedback fetch failed:", err);
      toast.error("Could not load reviews/questions");
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  const fetchNotifications = useCallback(async () => {
    incrementLoading();
    try { 
      const d = await adminApi.notifications(); 
      if (d && d.notifications) setNotifications(d.notifications); 
    } catch (err: any) {
      console.error("Notifications fetch failed:", err);
      toast.error("Could not load notifications");
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  const fetchCoupons = useCallback(async () => {
    incrementLoading();
    try { 
      const d = await adminApi.coupons(); 
      if (d && d.coupons) setCoupons(d.coupons); 
    } catch (err: any) {
      console.error("Coupons fetch failed:", err);
      toast.error("Could not load coupons");
    } finally {
      decrementLoading();
    }
  }, [incrementLoading, decrementLoading]);

  // Computed Values
  const displayRevenue = stats?.revenue || 0;
  const displayOrders = stats?.orders || 0;
  const displayCustomers = stats?.customers || 0;
  const displayAvgOrder = displayOrders > 0 ? displayRevenue / displayOrders : 0;
  const pendingOrders = paymentPendingOrders;
  const processingOrders = stats?.processingOrders || 0;
  const shippedOrders = stats?.shippedOrders || 0;
  const deliveredOrders = stats?.deliveredOrders || 0;
  
  const revenueTrend = stats?.revenueTrend || [];
  const statusData = useMemo(() => [
    { status: "processing", label: "Processing", orders: processingOrders, fill: "#b98f47" },
    { status: "shipped", label: "Shipped", orders: shippedOrders, fill: "#2563eb" },
    { status: "payment_pending", label: "Unpaid", orders: paymentPendingOrders, fill: "#f59e0b" },
    { status: "delivered", label: "Delivered", orders: deliveredOrders, fill: "#059669" },
    { status: "cancelled", label: "Cancelled", orders: stats?.cancelledOrders || 0, fill: "#dc2626" },
  ].filter(d => d.orders > 0), [stats, processingOrders, shippedOrders, deliveredOrders, paymentPendingOrders]);

  const categoryData = stats?.categoryTrend || [];
  const topCustomers = stats?.topCustomers || [];
  const safeProductList = Array.isArray(productList) ? productList : [];
  const lowStockProducts = safeProductList.filter((p) => (Number(p.stock) || 0) <= 10).slice(0, 5);
  const unresolvedFeedback = feedback.reviews.length + feedback.questions.length;

  const inventoryStats = useMemo(() => {
    const value = safeProductList.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
    const avg = safeProductList.length ? Math.round(safeProductList.reduce((acc, p) => acc + (Number(p.stock) || 0), 0) / safeProductList.length) : 0;
    return { value, avg };
  }, [safeProductList]);

  const recentOrders = useMemo(() => Array.isArray(orders) ? orders.slice(0, 6) : [], [orders]);
  const customerOrderCount = customers.reduce((acc, c) => acc + (Number(c.orders) || 0), 0);
  const customerLifetimeValue = customers.reduce((acc, c) => acc + parseCurrency(c.spent), 0);

  return {
    loading,
    stats,
    productList,
    orders,
    customers,
    feedback,
    notifications,
    coupons,
    fetchStats,
    fetchOrders,
    fetchCustomers,
    fetchProducts,
    fetchFeedback,
    fetchNotifications,
    fetchCoupons,
    displayRevenue,
    displayOrders,
    displayCustomers,
    displayAvgOrder,
    paymentPendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    revenueTrend,
    statusData,
    categoryData,
    topCustomers,
    lowStockProducts,
    unresolvedFeedback,
    inventoryStats,
    recentOrders,
    customerOrderCount,
    customerLifetimeValue,
    setProductList,
    setOrders,
    setFeedback,
    setNotifications,
    setCoupons
  };
}

