import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";
import { authApi, ordersApi, setToken } from "@/lib/api";

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
};

export type Order = {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: { name: string; color: string; size: string; qty: number; price: number; image: string }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber?: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  orders: Order[];
  loading: boolean;
};

type AuthAction =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; updates: Partial<User> }
  | { type: "SET_ORDERS"; orders: Order[] }
  | { type: "ADD_ORDER"; order: Order }
  | { type: "SET_LOADING"; loading: boolean };

const initial: AuthState = { user: null, isAuthenticated: false, orders: [], loading: true };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.user, isAuthenticated: true, loading: false };
    case "LOGOUT":
      return { ...initial, loading: false };
    case "UPDATE_PROFILE":
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.updates } };
    case "SET_ORDERS":
      return { ...state, orders: action.orders };
    case "ADD_ORDER":
      return { ...state, orders: [action.order, ...state.orders] };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

type AuthCtx = {
  state: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addOrder: (order: Order) => void;
  fetchOrders: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // On mount, try to restore session from stored JWT token
  useEffect(() => {
    const token = localStorage.getItem("maison.token");
    if (token) {
      authApi.me()
        .then(({ user }) => {
          dispatch({ type: "LOGIN", user });
        })
        .catch(() => {
          // Token expired or invalid
          setToken(null);
          dispatch({ type: "SET_LOADING", loading: false });
        });
    } else {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  // Fetch orders when user logs in
  useEffect(() => {
    if (state.isAuthenticated && state.user?.role !== "admin") {
      ordersApi.list()
        .then(({ orders }) => dispatch({ type: "SET_ORDERS", orders }))
        .catch(() => {});
    }
  }, [state.isAuthenticated, state.user?.role]);

  const fetchOrders = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const { orders } = await ordersApi.list();
      dispatch({ type: "SET_ORDERS", orders });
    } catch {}
  }, [state.isAuthenticated]);

  const value: AuthCtx = {
    state,
    login: async (email, password) => {
      try {
        const { user, token } = await authApi.login(email, password);
        setToken(token);
        dispatch({ type: "LOGIN", user });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Login failed" };
      }
    },
    signup: async ({ email, password, firstName, lastName }) => {
      try {
        const { user, token } = await authApi.signup({ email, password, firstName, lastName });
        setToken(token);
        dispatch({ type: "LOGIN", user });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Signup failed" };
      }
    },
    logout: () => {
      setToken(null);
      dispatch({ type: "LOGOUT" });
    },
    updateProfile: async (updates) => {
      try {
        const { user } = await authApi.updateProfile({
          firstName: updates.firstName,
          lastName: updates.lastName,
          phone: updates.phone,
          street: updates.address?.street,
          city: updates.address?.city,
          state: updates.address?.state,
          zip: updates.address?.zip,
          country: updates.address?.country,
        });
        dispatch({ type: "UPDATE_PROFILE", updates: user });
      } catch {
        // Fallback: update locally
        dispatch({ type: "UPDATE_PROFILE", updates });
      }
    },
    addOrder: (order) => dispatch({ type: "ADD_ORDER", order }),
    fetchOrders,
    isAdmin: state.user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
