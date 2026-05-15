import { useEffect } from "react";
import { toast } from "sonner";
import { productsApi, adminApi, reviewsApi, questionsApi } from "@/lib/api";
import { AdminTab } from "@/constants/adminConstants";

export function useAdminActions({
  isAdmin,
  ioSocket,
  fetchStats,
  fetchOrders,
  fetchNotifications,
  fetchFeedback,
  fetchCustomers,
  fetchProducts,
  fetchCoupons,
  handleTabChange,
  setOrderSearch,
  setOrders,
  editProduct,
  setEditProduct,
  setShowAddCoupon,
  setDeleteTargetCoupon,
  setDeleteTarget,
  tab,
  orderFilter
}: any) {

  useEffect(() => {
    if (!ioSocket || !isAdmin) return;

    const unwrap = (payload: any) => payload?.data && payload?.type ? payload.data : payload;

    const notifyAdmin = (title: string, message: string, targetTab: AdminTab, id?: string) => {
      toast(title, {
        description: message,
        action: {
          label: "View",
          onClick: () => {
            handleTabChange(targetTab);
            if (id) {
              if (targetTab === "orders") setOrderSearch(id);
              if (targetTab === "feedback") {
                setTimeout(() => {
                  const element = document.getElementById(id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    element.classList.add("ring-2", "ring-accent", "ring-offset-[12px]", "bg-secondary/30");
                    setTimeout(() => element.classList.remove("ring-2", "ring-accent", "ring-offset-[12px]", "bg-secondary/30"), 4000);
                  }
                }, 500);
              }
            }
          }
        },
        duration: 8000,
      });
    };

    ioSocket.on("new_order", (payload: any) => {
      const data = unwrap(payload);
      notifyAdmin("New Order", `Order #${data?.orderNumber || 'received'} just came in!`, "orders", data?.orderNumber);
      fetchStats();
      fetchOrders();
      fetchNotifications();
    });

    ioSocket.on("order_update", (payload: any) => {
      const data = unwrap(payload);
      notifyAdmin("Order Updated", `Order #${data?.orderNumber || 'updated'} changed to ${data?.status || 'a new status'}.`, "orders", data?.orderNumber);
      fetchStats();
      fetchOrders();
      fetchNotifications();
    });

    ioSocket.on("new_message", () => {
      notifyAdmin("New Message", "A customer sent a new contact message.", "notifications");
      fetchNotifications();
    });

    ioSocket.on("new_review", (payload: any) => {
      const data = unwrap(payload);
      notifyAdmin("New Review", `New review for ${data?.productName || 'a product'}.`, "feedback", `feedback-review-${data?.id}`);
      fetchFeedback();
      fetchNotifications();
    });

    ioSocket.on("new_question", (payload: any) => {
      const data = unwrap(payload);
      notifyAdmin("New Question", `Customer asked a question about ${data?.productName || 'a product'}.`, "feedback", `feedback-question-${data?.id}`);
      fetchFeedback();
      fetchNotifications();
    });

    ioSocket.on("new_customer", (payload: any) => {
      const data = unwrap(payload);
      notifyAdmin("New Customer", `${data?.name || 'A new user'} just registered.`, "customers");
      fetchStats();
      fetchCustomers();
      fetchNotifications();
    });

    ioSocket.on("stock_update", () => {
      fetchStats();
      fetchProducts();
    });

    ioSocket.on("notification", (data: any) => {
      fetchNotifications();
    });

    return () => {
      ioSocket.off("new_order");
      ioSocket.off("order_update");
      ioSocket.off("new_message");
      ioSocket.off("new_review");
      ioSocket.off("new_question");
      ioSocket.off("new_customer");
      ioSocket.off("stock_update");
      ioSocket.off("notification");
    };
  }, [ioSocket, isAdmin, fetchStats, fetchOrders, fetchNotifications, fetchFeedback, fetchCustomers, fetchProducts, handleTabChange, setOrderSearch]);

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

  const handleSaveCoupon = async (data: { code: string; discount_pct: number; description?: string; terms?: string }) => {
    try {
      await adminApi.createCoupon({ ...data, active: true });
      toast.success("Coupon created!");
      setShowAddCoupon(false);
      await fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
      throw err;
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await adminApi.deleteCoupon(Number(id));
      toast.success("Coupon deleted");
      setDeleteTargetCoupon(null);
      await fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon");
    }
  };

  const handleDeleteProduct = async (p: any) => {
    try {
      await productsApi.delete(String(p.id));
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
      setOrders((prev: any[]) => prev.map((o) => o.id === orderNumber ? { ...o, status: data.status, trackingNumber: data.trackingNumber } : o));
      toast.success("Order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
      throw err;
    }
  };

  const refresh = () => {
    Promise.all([
      fetchStats(), 
      fetchOrders(tab === "orders" ? orderFilter : "all"), 
      fetchCustomers(), 
      fetchProducts(), 
      fetchFeedback(), 
      fetchNotifications(), 
      fetchCoupons()
    ]).then(() => toast.success("Data refreshed"));
  };

  return {
    handleSaveProduct,
    handleSaveCoupon,
    handleDeleteCoupon,
    handleDeleteProduct,
    handleUpdateOrder,
    handleReplyReview: async (id: number, reply: string) => {
      await reviewsApi.reply(id, { reply });
      toast.success("Reply posted");
      fetchFeedback();
    },
    handleEditReview: async (id: number, data: any) => {
      await reviewsApi.edit(id, data);
      toast.success("Review updated");
      fetchFeedback();
    },
    handleDeleteReview: async (id: number) => {
      await reviewsApi.delete(id);
      toast.success("Review deleted");
      fetchFeedback();
    },
    handleReplyQuestion: async (id: number, answer: string) => {
      await questionsApi.answer(id, { answer });
      toast.success("Answer posted");
      fetchFeedback();
    },
    handleEditQuestion: async (id: number, text: string) => {
      await questionsApi.edit(id, { text });
      toast.success("Question updated");
      fetchFeedback();
    },
    handleDeleteQuestion: async (id: number) => {
      await questionsApi.delete(id);
      toast.success("Question deleted");
      fetchFeedback();
    },
    refresh
  };
}

