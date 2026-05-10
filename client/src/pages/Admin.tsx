import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import Layout from "@/components/layouts/Layout";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";

// Shared Components & Constants
import { AdminLayout } from "@/components/admin/AdminShared";
import { AdminTab } from "@/constants/adminConstants";

// Modals
import ProductModal from "@/components/admin/ProductModal";
import OrderStatusModal from "@/components/admin/OrderStatusModal";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import PromptModal from "@/components/admin/PromptModal";

// Tab Components
import { DashboardTab } from "@/components/admin/tabs/DashboardTab";
import { ProductsTab } from "@/components/admin/tabs/ProductsTab";
import { OrdersTab } from "@/components/admin/tabs/OrdersTab";
import { CustomersTab } from "@/components/admin/tabs/CustomersTab";
import { FeedbackTab } from "@/components/admin/tabs/FeedbackTab";
import { NotificationsTab } from "@/components/admin/tabs/NotificationsTab";
import { CouponsTab } from "@/components/admin/tabs/CouponsTab";
import { ProfileTab } from "@/components/admin/tabs/ProfileTab";

// Hooks
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/hooks/useAdminActions";

// UI Components
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Activity, 
  Bell, 
  Ticket, 
  User 
} from "lucide-react";

const TABS_CONFIG = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "feedback", label: "Feedback", icon: Activity },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "coupons", label: "Coupons", icon: Ticket },
  { key: "profile", label: "Profile", icon: User },
] as const;

export default function Admin() {
  const { state, isAdmin, socket: ioSocket } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab handling
  const [tab, setTab] = useState<AdminTab>((searchParams.get("tab") as AdminTab) || "dashboard");
  const handleTabChange = useCallback((newTab: AdminTab) => {
    setTab(newTab);
    setSearchParams({ tab: newTab });
  }, [setSearchParams]);

  // Filters & State
  const [searchQ, setSearchQ] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [viewOrderLoading, setViewOrderLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [deleteTargetCoupon, setDeleteTargetCoupon] = useState<any>(null);
  const [replyReviewTarget, setReplyReviewTarget] = useState<any>(null);
  const [editReviewTarget, setEditReviewTarget] = useState<any>(null);
  const [deleteTargetReview, setDeleteTargetReview] = useState<any>(null);
  const [replyQuestionTarget, setReplyQuestionTarget] = useState<any>(null);
  const [editQuestionTarget, setEditQuestionTarget] = useState<any>(null);
  const [deleteTargetQuestion, setDeleteTargetQuestion] = useState<any>(null);

  // Custom Hooks for Data & Actions
  const adminData = useAdminData();
  const {
    handleSaveProduct,
    handleSaveCoupon,
    handleDeleteCoupon,
    handleDeleteProduct,
    handleUpdateOrder,
    handleReplyReview,
    handleEditReview,
    handleDeleteReview,
    handleReplyQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    refresh
  } = useAdminActions({
    isAdmin,
    ioSocket,
    ...adminData,
    handleTabChange,
    setOrderSearch,
    editProduct,
    setEditProduct,
    setShowAddCoupon,
    setDeleteTargetCoupon,
    setDeleteTarget,
    tab,
    orderFilter
  });

  const {
    fetchStats,
    fetchOrders,
    fetchCustomers,
    fetchProducts,
    fetchFeedback,
    fetchNotifications,
    fetchCoupons,
    notifications,
    orders,
    productList
  } = adminData;

  // Initial Fetch
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

  // Derived filtered data
  const safeProductList = Array.isArray(productList) ? productList : [];
  const filteredProducts = useMemo(() =>
    safeProductList.filter((p: any) => !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase())),
  [safeProductList, searchQ]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const visibleOrders = useMemo(() => safeOrders.filter((o: any) => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return true;
    return [o.id, o.customer, o.customerEmail, o.customerPhone, o.customerAddress]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  }), [safeOrders, orderSearch]);

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

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  return (
    <AdminLayout 
      notificationCount={unreadCount} 
      onBellClick={() => handleTabChange("notifications")}
      onProfileClick={() => handleTabChange("profile")}
      isBellBlinking={tab !== "notifications" && unreadCount > 0}
    >
      <section className="container-luxe pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow mb-3">Administration</div>
            <h1 className="font-display text-4xl md:text-5xl">Admin Panel</h1>
          </div>
          <button onClick={refresh} disabled={adminData.loading} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${adminData.loading ? "animate-spin" : ""}`} strokeWidth={1.5} /> Refresh
          </button>
        </div>
      </section>

      <section className="container-luxe pb-6">
        {/* Mobile Tabs */}
        <div className="md:hidden overflow-x-auto no-scrollbar border-b border-border">
          <div className="flex whitespace-nowrap min-w-max pb-px">
            {TABS_CONFIG.map((t) => {
              const Icon = t.icon;
              return (
                <button 
                  key={t.key} 
                  onClick={() => handleTabChange(t.key as AdminTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-[11px] uppercase tracking-[0.14em] border-b-2 transition-all ${
                    tab === t.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden gap-1 border-b border-border md:flex">
          {TABS_CONFIG.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => handleTabChange(t.key as AdminTab)}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "dashboard" && (
              <DashboardTab 
                {...adminData} 
                setTab={setTab} 
                setOrderFilter={setOrderFilter} 
                handleViewOrder={handleViewOrder} 
                viewOrder={viewOrder}
                viewOrderLoading={viewOrderLoading}
                setEditProduct={setEditProduct}
              />
            )}
            {tab === "products" && (
              <ProductsTab 
                {...adminData} 
                filteredProducts={filteredProducts}
                searchQ={searchQ}
                setSearchQ={setSearchQ}
                setShowAddProduct={setShowAddProduct}
                setEditProduct={setEditProduct}
                setDeleteTarget={setDeleteTarget}
              />
            )}
            {tab === "orders" && (
              <OrdersTab 
                {...adminData}
                visibleOrders={visibleOrders}
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                orderFilter={orderFilter}
                setOrderFilter={setOrderFilter}
                handleViewOrder={handleViewOrder}
                setEditOrder={setEditOrder}
              />
            )}
            {tab === "customers" && <CustomersTab {...adminData} />}
            {tab === "feedback" && (
              <FeedbackTab 
                {...adminData}
                setReplyReviewTarget={setReplyReviewTarget}
                setEditReviewTarget={setEditReviewTarget}
                setDeleteTargetReview={setDeleteTargetReview}
                setReplyQuestionTarget={setReplyQuestionTarget}
                setEditQuestionTarget={setEditQuestionTarget}
                setDeleteTargetQuestion={setDeleteTargetQuestion}
              />
            )}
            {tab === "notifications" && (
              <NotificationsTab 
                {...adminData}
                handleTabChange={handleTabChange}
                setOrderSearch={setOrderSearch}
              />
            )}
            {tab === "coupons" && (
              <CouponsTab 
                {...adminData}
                handleCreateCoupon={() => setShowAddCoupon(true)}
                setDeleteTargetCoupon={setDeleteTargetCoupon}
              />
            )}
            {tab === "profile" && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Modals */}
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
          onUpdate={handleUpdateOrder}
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
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => handleDeleteProduct(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showAddCoupon && (
        <PromptModal
          title="Create New Coupon"
          message="Enter the details for the new discount code."
          fields={[
            { name: "code", label: "Coupon Code (e.g. SUMMER25)", placeholder: "SUMMER25", required: true },
            { name: "discount_pct", label: "Discount Percentage", placeholder: "20", type: "number", required: true },
            { name: "description", label: "Description", placeholder: "Optional public description" },
            { name: "terms", label: "Terms & Conditions", placeholder: "Optional internal notes" },
          ]}
          onConfirm={handleSaveCoupon}
          onCancel={() => setShowAddCoupon(false)}
        />
      )}
      {deleteTargetCoupon && (
        <ConfirmModal
          title="Delete Coupon"
          message={`Delete coupon code "${deleteTargetCoupon.code}"?`}
          onConfirm={() => handleDeleteCoupon(deleteTargetCoupon.id)}
          onCancel={() => setDeleteTargetCoupon(null)}
        />
      )}

      {/* Feedback Modals */}
      {replyReviewTarget && (
        <PromptModal
          title="Reply to Review"
          message={`Responding to ${replyReviewTarget.userName}'s review for ${replyReviewTarget.productName}`}
          fields={[{ name: "reply", label: "Your Reply", placeholder: "Thank you for your feedback...", required: true }]}
          onConfirm={(data) => { handleReplyReview(replyReviewTarget.id, data.reply); setReplyReviewTarget(null); }}
          onCancel={() => setReplyReviewTarget(null)}
        />
      )}
      {editReviewTarget && (
        <PromptModal
          title="Edit Review"
          message={`Updating review from ${editReviewTarget.userName}`}
          fields={[
            { name: "rating", label: "Rating (1-5)", placeholder: "5", type: "number", required: true, defaultValue: editReviewTarget.rating },
            { name: "title", label: "Title", placeholder: "Review title", defaultValue: editReviewTarget.title },
            { name: "body", label: "Review Text", placeholder: "The review content...", required: true, defaultValue: editReviewTarget.body },
          ]}
          onConfirm={(data) => { handleEditReview(editReviewTarget.id, data); setEditReviewTarget(null); }}
          onCancel={() => setEditReviewTarget(null)}
        />
      )}
      {deleteTargetReview && (
        <ConfirmModal
          title="Delete Review"
          message="Delete this customer review? This cannot be undone."
          onConfirm={() => { handleDeleteReview(deleteTargetReview.id); setDeleteTargetReview(null); }}
          onCancel={() => setDeleteTargetReview(null)}
        />
      )}

      {replyQuestionTarget && (
        <PromptModal
          title="Answer Question"
          message={`Question from ${replyQuestionTarget.userName}: "${replyQuestionTarget.text}"`}
          fields={[{ name: "answer", label: "Your Answer", placeholder: "The answer to the customer's question...", required: true }]}
          onConfirm={(data) => { handleReplyQuestion(replyQuestionTarget.id, data.answer); setReplyQuestionTarget(null); }}
          onCancel={() => setReplyQuestionTarget(null)}
        />
      )}
      {editQuestionTarget && (
        <PromptModal
          title="Edit Question"
          message={`Updating question from ${editQuestionTarget.userName}`}
          fields={[{ name: "text", label: "Question Text", placeholder: "The question text...", required: true, defaultValue: editQuestionTarget.text }]}
          onConfirm={(data) => { handleEditQuestion(editQuestionTarget.id, data.text); setEditQuestionTarget(null); }}
          onCancel={() => setEditQuestionTarget(null)}
        />
      )}
      {deleteTargetQuestion && (
        <ConfirmModal
          title="Delete Question"
          message="Delete this customer question? This cannot be undone."
          onConfirm={() => { handleDeleteQuestion(deleteTargetQuestion.id); setDeleteTargetQuestion(null); }}
          onCancel={() => setDeleteTargetQuestion(null)}
        />
      )}
    </AdminLayout>
  );
}

