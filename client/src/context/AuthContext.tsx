import { createContext, useContext, useEffect, useReducer, ReactNode, useCallback } from "react";
import {
  ConfirmationResult,
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { authApi, ordersApi, setToken } from "@/lib/api";
import {
  createRecaptchaVerifier,
  firebaseAuth,
  getConfiguredFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

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

let phoneLoginConfirmation: ConfirmationResult | null = null;
let phoneResetConfirmation: ConfirmationResult | null = null;

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

type AuthResult = Promise<{ success: boolean; error?: string }>;

type AuthCtx = {
  state: AuthState;
  login: (identifier: string, password: string) => AuthResult;
  googleLogin: () => AuthResult;
  sendPhoneLoginCode: (phone: string, recaptchaContainerId: string) => AuthResult;
  confirmPhoneLogin: (code: string) => AuthResult;
  signup: (data: { email: string; password: string; firstName: string; lastName: string }) => AuthResult;
  sendPasswordReset: (email: string) => AuthResult;
  sendPhonePasswordResetCode: (phone: string, recaptchaContainerId: string) => AuthResult;
  confirmPhonePasswordReset: (code: string, newPassword: string) => AuthResult;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addOrder: (order: Order) => void;
  fetchOrders: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

function authNotConfigured() {
  return {
    success: false,
    error: "Firebase authentication is not configured yet.",
  };
}

async function exchangeFirebaseUser(profile?: { firstName?: string; lastName?: string; phone?: string }) {
  const auth = getConfiguredFirebaseAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No Firebase user is signed in.");
  }

  const idToken = await currentUser.getIdToken();
  return authApi.firebaseLogin(idToken, profile);
}

function validatePassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const restore = async () => {
      const token = localStorage.getItem("maison.token");
      if (token) {
        try {
          const { user } = await authApi.me();
          if (active) dispatch({ type: "LOGIN", user });
          return;
        } catch {
          setToken(null);
        }
      }

      if (!isFirebaseConfigured || !firebaseAuth) {
        if (active) dispatch({ type: "SET_LOADING", loading: false });
        return;
      }

      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (!active) return;

        if (!firebaseUser) {
          dispatch({ type: "SET_LOADING", loading: false });
          return;
        }

        try {
          const { user, token } = await exchangeFirebaseUser();
          setToken(token);
          if (active) dispatch({ type: "LOGIN", user });
        } catch {
          setToken(null);
          if (active) dispatch({ type: "SET_LOADING", loading: false });
        }
      });
    };

    restore();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && state.user?.role !== "admin") {
      ordersApi.list()
        .then(({ orders }) => dispatch({ type: "SET_ORDERS", orders }))
        .catch(() => undefined);
    }
  }, [state.isAuthenticated, state.user?.role]);

  const fetchOrders = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const { orders } = await ordersApi.list();
      dispatch({ type: "SET_ORDERS", orders });
    } catch {
      return;
    }
  }, [state.isAuthenticated]);

  const finishFirebaseLogin = async (
    profile?: { firstName?: string; lastName?: string; phone?: string }
  ) => {
    const { user, token } = await exchangeFirebaseUser(profile);
    setToken(token);
    dispatch({ type: "LOGIN", user });
  };

  const value: AuthCtx = {
    state,
    login: async (identifier, password) => {
      if (!isFirebaseConfigured) return authNotConfigured();

      const trimmed = identifier.trim();
      if (!isValidEmail(trimmed)) {
        return {
          success: false,
          error: "Use the phone tab for phone number login, or enter a valid email address.",
        };
      }

      try {
        const auth = getConfiguredFirebaseAuth();
        await signInWithEmailAndPassword(auth, trimmed.toLowerCase(), password);
        await finishFirebaseLogin();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Login failed") };
      }
    },
    googleLogin: async () => {
      if (!isFirebaseConfigured) return authNotConfigured();

      try {
        const auth = getConfiguredFirebaseAuth();
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
        await finishFirebaseLogin();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Google login failed") };
      }
    },
    sendPhoneLoginCode: async (phone, recaptchaContainerId) => {
      if (!isFirebaseConfigured) return authNotConfigured();
      if (!isValidNepalPhone(phone)) {
        return {
          success: false,
          error: "Enter a valid Nepal mobile number.",
        };
      }

      try {
        const verifier = createRecaptchaVerifier(recaptchaContainerId);
        phoneLoginConfirmation = await signInWithPhoneNumber(
          getConfiguredFirebaseAuth(),
          formatNepalPhone(phone),
          verifier
        );
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Could not send verification code") };
      }
    },
    confirmPhoneLogin: async (code) => {
      if (!phoneLoginConfirmation) {
        return { success: false, error: "Request a verification code first." };
      }

      try {
        const result = await phoneLoginConfirmation.confirm(code);
        await finishFirebaseLogin({ phone: result.user.phoneNumber || undefined });
        phoneLoginConfirmation = null;
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Invalid verification code") };
      }
    },
    signup: async ({ email, password, firstName, lastName }) => {
      if (!isFirebaseConfigured) return authNotConfigured();

      try {
        const auth = getConfiguredFirebaseAuth();
        const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        await updateFirebaseProfile(result.user, {
          displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        });
        await finishFirebaseLogin({ firstName, lastName });
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Signup failed") };
      }
    },
    sendPasswordReset: async (email) => {
      if (!isFirebaseConfigured) return authNotConfigured();
      if (!isValidEmail(email)) {
        return { success: false, error: "Enter a valid email address." };
      }

      try {
        await sendPasswordResetEmail(getConfiguredFirebaseAuth(), email.trim().toLowerCase());
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Could not send reset email") };
      }
    },
    sendPhonePasswordResetCode: async (phone, recaptchaContainerId) => {
      if (!isFirebaseConfigured) return authNotConfigured();
      if (!isValidNepalPhone(phone)) {
        return {
          success: false,
          error: "Enter a valid Nepal mobile number.",
        };
      }

      try {
        const verifier = createRecaptchaVerifier(recaptchaContainerId);
        phoneResetConfirmation = await signInWithPhoneNumber(
          getConfiguredFirebaseAuth(),
          formatNepalPhone(phone),
          verifier
        );
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Could not send verification code") };
      }
    },
    confirmPhonePasswordReset: async (code, newPassword) => {
      if (!phoneResetConfirmation) {
        return { success: false, error: "Request a verification code first." };
      }
      if (!validatePassword(newPassword)) {
        return {
          success: false,
          error: "Password must be at least 8 characters and include one uppercase letter and one number.",
        };
      }

      try {
        const result = await phoneResetConfirmation.confirm(code);
        await updatePassword(result.user, newPassword);
        await finishFirebaseLogin({ phone: result.user.phoneNumber || undefined });
        phoneResetConfirmation = null;
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Could not reset password with this phone number") };
      }
    },
    changePassword: async (currentPassword, newPassword) => {
      const auth = getConfiguredFirebaseAuth();
      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        throw new Error("Password changes are available for email/password accounts.");
      }

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
    },
    logout: () => {
      if (firebaseAuth) {
        signOut(firebaseAuth).catch(() => {});
      }
      setToken(null);
      dispatch({ type: "LOGOUT" });
    },
    updateProfile: async (updates) => {
      try {
        const { user } = await authApi.updateProfile({
          firstName: updates.firstName,
          lastName: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          street: updates.address?.street,
          city: updates.address?.city,
          state: updates.address?.state,
          zip: updates.address?.zip,
          country: updates.address?.country,
        });
        dispatch({ type: "UPDATE_PROFILE", updates: user });
      } catch {
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
