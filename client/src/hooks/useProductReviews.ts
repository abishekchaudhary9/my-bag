import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { reviewsApi } from "@/lib/api";

export function useProductReviews(productId: string) {
  const { state: authState, isAdmin } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [eligible, setEligible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await reviewsApi.get(productId);
      setReviews(data.reviews);
      setStats({ average: data.average, count: data.count });
    } catch {
      setReviews([]);
      setStats({ average: 0, count: 0 });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const checkEligibility = useCallback(async () => {
    if (!productId || !authState.isAuthenticated || isAdmin) {
      setEligible(false);
      return;
    }

    try {
      const { eligible } = await reviewsApi.checkEligibility(productId);
      setEligible(eligible);
    } catch {
      setEligible(false);
    }
  }, [productId, authState.isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [fetchReviews, checkEligibility]);

  const resetForm = () => {
    setRating(5);
    setTitle("");
    setBody("");
    setShowForm(false);
    setSubmitting(false);
  };

  const submitReview = async (onSuccess: () => void, onError: (message: string) => void) => {
    if (!title.trim() || !body.trim()) {
      onError("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, { rating, title, body });
      onSuccess();
      fetchReviews();
      resetForm();
    } catch (err: any) {
      onError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (id: number) => {
    await reviewsApi.delete(id);
    fetchReviews();
  };

  const editReview = async (id: number, text: string) => {
    await reviewsApi.edit(id, { rating: editTarget?.rating ?? 5, title: editTarget?.title ?? "", body: text });
    fetchReviews();
    setEditTarget(null);
  };

  return {
    authState,
    isAdmin,
    reviews,
    stats,
    eligible,
    showForm,
    setShowForm,
    loading,
    editTarget,
    setEditTarget,
    rating,
    setRating,
    title,
    setTitle,
    body,
    setBody,
    submitting,
    setSubmitting,
    fetchReviews,
    submitReview,
    deleteReview,
    editReview,
  };
}
