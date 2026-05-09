import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { state, isAdmin } = useAuth();
  const location = useLocation();

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isPhoneUser = !state.user?.email && !!state.user?.phone;
  if (!state.user?.emailVerified && !isPhoneUser && location.pathname !== "/verify") {
    return <Navigate to="/verify" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
