import { useCallback, useEffect, useState } from "react";
import { questionsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useProductQuestions(productId: string) {
  const { state: authState, isAdmin } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!productId) return;
    try {
      const data = await questionsApi.get(productId);
      setQuestions(data.questions);
    } catch {
      setQuestions([]);
    }
  }, [productId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const submitQuestion = async (onSuccess: () => void, onError: (message: string) => void) => {
    if (!text.trim()) {
      onError("Please enter a question");
      return;
    }

    setSubmitting(true);
    try {
      await questionsApi.submit(productId, { text });
      onSuccess();
      fetchQuestions();
      setText("");
      setShowForm(false);
    } catch (err: any) {
      onError(err.message || "Failed to send question");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    await questionsApi.delete(id);
    fetchQuestions();
  };

  const editQuestion = async (id: number, newText: string) => {
    await questionsApi.edit(id, { text: newText });
    fetchQuestions();
    setEditTarget(null);
  };

  return {
    questions,
    text,
    setText,
    submitting,
    showForm,
    setShowForm,
    editTarget,
    setEditTarget,
    fetchQuestions,
    submitQuestion,
    deleteQuestion,
    editQuestion,
    authState,
    isAdmin,
  };
}
