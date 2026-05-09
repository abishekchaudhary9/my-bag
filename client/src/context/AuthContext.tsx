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
  sendEmailVerification,
} from "firebase/auth";
import { authApi, ordersApi, setToken } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import {
  createRecaptchaVerifier,
  firebaseAuth,
  getConfiguredFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

const ADMIN_EMAILS = ["abishekc441@gmail.com"]; // Frontend hint for faster UI response

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
  emailVerified: boolean;
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
  notifications: any[];
  unreadCount: number;
  loading: boolean;
};

type AuthAction =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; updates: Partial<User> }
  | { type: "SET_ORDERS"; orders: Order[] }
  | { type: "ADD_ORDER"; order: Order }
  | { type: "SET_NOTIFICATIONS"; notifications: any[] }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "SET_LOADING"; loading: boolean };

const initial: AuthState = { user: null, isAuthenticated: false, orders: [], notifications: [], unreadCount: 0, loading: true };

let phoneLoginConfirmation: ConfirmationResult | null = null;
let phoneResetConfirmation: ConfirmationResult | null = null;
let signupDataBuffer: any = null;

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
    case "SET_NOTIFICATIONS":
      return { 
        ...state, 
        notifications: action.notifications, 
        unreadCount: action.notifications.filter((n: any) => !n.is_read).length 
      };
    case "MARK_NOTIFICATIONS_READ":
      return { 
        ...state, 
        notifications: state.notifications.map(n => ({ ...n, is_read: 1 })),
        unreadCount: 0
      };
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
  sendPhoneSignupCode: (phone: string, profile: any, recaptchaContainerId: string) => AuthResult;
  confirmPhoneSignup: (code: string) => AuthResult;
  signup: (data: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string;
    phone?: string;
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  }) => AuthResult;
  sendPasswordReset: (email: string) => AuthResult;
  sendPhonePasswordResetCode: (phone: string, recaptchaContainerId: string) => AuthResult;
  confirmPhonePasswordReset: (code: string, newPassword: string) => AuthResult;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addOrder: (order: Order) => void;
  fetchOrders: () => Promise<void>;
  resendVerificationEmail: () => AuthResult;
  sendOtp: (email: string) => AuthResult;
  verifyOtp: (email: string, code: string) => AuthResult;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  socket: Socket | null;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

let socket: Socket | null = null;

function authNotConfigured() {
  return {
    success: false,
    error: "Firebase authentication is not configured yet.",
  };
}

async function exchangeFirebaseUser(profile?: any) {
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

  const fetchOrders = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const { orders } = await ordersApi.list();
      dispatch({ type: "SET_ORDERS", orders });
    } catch {
      return;
    }
  }, [state.isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const { notifications } = await authApi.notifications();
      dispatch({ type: "SET_NOTIFICATIONS", notifications });
    } catch {
      return;
    }
  }, [state.isAuthenticated]);

  const markAllNotificationsRead = async () => {
    if (!state.isAuthenticated) return;
    try {
      await authApi.markNotificationsRead();
      dispatch({ type: "MARK_NOTIFICATIONS_READ" });
    } catch {
      return;
    }
  };

  const exchangeFirebaseUserWithSocket = useCallback(async (profile?: any) => {
    const { user, token } = await exchangeFirebaseUser(profile);
    
    // Initialize Socket
    if (!socket) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const socketUrl = apiBase.replace(/\/api$/, "");
      
      socket = io(socketUrl, { 
        withCredentials: true,
        transports: ["websocket", "polling"]
      });
    }

    return { user, token };
  }, []); // No dependencies needed for basic initialization

  const finishFirebaseLogin = useCallback(async (
    profile?: { firstName?: string; lastName?: string; phone?: string }
  ) => {
    const { user, token } = await exchangeFirebaseUserWithSocket(profile);
    const isPhoneUser = !user.email && !!user.phone;
    if (user.emailVerified || isPhoneUser) {
      setToken(token);
    } else {
      setToken(null);
    }
    dispatch({ type: "LOGIN", user });
  }, [exchangeFirebaseUserWithSocket]);

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
          const { user, token } = await exchangeFirebaseUserWithSocket(signupDataBuffer);
          signupDataBuffer = null; // Clear buffer after use
          if (!user.emailVerified) {
             setToken(null);
             if (active) dispatch({ type: "LOGIN", user });
             return;
          }
          setToken(token);
          if (active) dispatch({ type: "LOGIN", user });
        } catch (err) {
          console.error("Auth Restore Error:", err);
          signupDataBuffer = null;
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
  }, [exchangeFirebaseUserWithSocket]);

  useEffect(() => {
    if (state.isAuthenticated && state.user?.role !== "admin") {
      ordersApi.list()
        .then(({ orders }) => dispatch({ type: "SET_ORDERS", orders }))
        .catch(() => undefined);
      
      authApi.notifications()
        .then(({ notifications }) => dispatch({ type: "SET_NOTIFICATIONS", notifications }))
        .catch(() => undefined);
    }
  }, [state.isAuthenticated, state.user?.role]);
  
  // Real-time synchronization logic
  useEffect(() => {
    if (!state.isAuthenticated || !state.user || !socket) return;

    const onConnect = () => {
      console.log("[Socket] Connected to real-time server");
      socket?.emit("join_user", state.user!.id);
      if (state.user!.role === "admin") {
        socket?.emit("join_admin");
      }
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    socket.on("notification", (data) => {
      toast.info(data.title, {
        description: data.message,
      });
      fetchNotifications();
    });

    socket.on("order_update", (data) => {
      toast.info(`Order Status Updated`, { 
        description: `Order #${data.orderNumber} is now ${data.status}.` 
      });
      fetchOrders();
      fetchNotifications();
    });

    socket.on("new_order", (data) => {
      toast.success(`New Order Received!`, { 
        description: `A new order has been placed (#${data.orderId}).` 
      });
      if (state.user?.role === "admin") {
        fetchOrders(); 
      }
    });

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("notification");
      socket?.off("order_update");
      socket?.off("new_order");
    };
  }, [state.isAuthenticated, state.user, fetchOrders, fetchNotifications]);


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
        console.error("Firebase Phone Auth Error:", err);
        return { success: false, error: getErrorMessage(err, "Could not send verification code") };
      }
    },
    confirmPhoneLogin: async (code) => {
      if (!phoneLoginConfirmation) {
        return { success: false, error: "Request a verification code first." };
      }

      try {
        const result = await phoneLoginConfirmation.confirm(code);
        // If we have signup data in buffer, use it
        const profile = signupDataBuffer || { phone: result.user.phoneNumber || undefined };
        await finishFirebaseLogin(profile);
        phoneLoginConfirmation = null;
        signupDataBuffer = null;
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Invalid verification code") };
      }
    },
    sendPhoneSignupCode: async (phone, profile, recaptchaContainerId) => {
      if (!isFirebaseConfigured) return authNotConfigured();
      if (!isValidNepalPhone(phone)) {
        return { success: false, error: "Enter a valid Nepal mobile number." };
      }

      try {
        signupDataBuffer = profile;
        const verifier = createRecaptchaVerifier(recaptchaContainerId);
        phoneLoginConfirmation = await signInWithPhoneNumber(
          getConfiguredFirebaseAuth(),
          formatNepalPhone(phone),
          verifier
        );
        return { success: true };
      } catch (err: unknown) {
        console.error("Firebase Phone Signup Error:", err);
        return { success: false, error: getErrorMessage(err, "Could not send verification code") };
      }
    },
    confirmPhoneSignup: async (code) => {
      if (!phoneLoginConfirmation) {
        return { success: false, error: "Request a verification code first." };
      }

      try {
        const result = await phoneLoginConfirmation.confirm(code);
        await finishFirebaseLogin({ 
          ...signupDataBuffer,
          phone: result.user.phoneNumber || undefined 
        });
        phoneLoginConfirmation = null;
        signupDataBuffer = null;
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Invalid verification code") };
      }
    },
    signup: async (data) => {
      if (!isFirebaseConfigured) return authNotConfigured();

      try {
        // Store data in buffer so onAuthStateChanged can pick it up
        signupDataBuffer = {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone,
          street: data.street,
          city: data.city,
          zip: data.zip,
          country: data.country || "Nepal"
        };

        const auth = getConfiguredFirebaseAuth();
        await createUserWithEmailAndPassword(auth, data.email.trim().toLowerCase(), data.password);
        
        if (auth.currentUser) {
          await updateFirebaseProfile(auth.currentUser, {
            displayName: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
          });
        }

        // Send OTP immediately
        await authApi.sendOtp(data.email.trim().toLowerCase());
        
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
      try {
        const auth = getConfiguredFirebaseAuth();
        signOut(auth).catch(() => {});
      } catch (err) {
        console.warn("Logout: Firebase auth not available", err);
      }
      
      if (socket) {
        socket.disconnect();
        socket = null;
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
    fetchNotifications,
    markAllNotificationsRead,
    socket,
    resendVerificationEmail: async () => {
      const auth = getConfiguredFirebaseAuth();
      if (!auth.currentUser) return { success: false, error: "No user logged in" };
      try {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Could not send verification email") };
      }
    },
    sendOtp: async (email) => {
      try {
        await authApi.sendOtp(email);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Could not send OTP") };
      }
    },
    verifyOtp: async (email, code) => {
      try {
        const res = await authApi.verifyOtp(email, code);
        if (res.success) {
           const auth = getConfiguredFirebaseAuth();
           // Force refresh Firebase token to pick up the new "verified" status
           if (auth.currentUser) {
             await auth.currentUser.getIdToken(true);
           }
           // Reload user to get verified status
           const { user, token } = await exchangeFirebaseUser();
           setToken(token);
           dispatch({ type: "LOGIN", user });
           return { success: true };
        }
        return { success: false, error: res.message };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err, "Verification failed") };
      }
    },
    isAdmin: state.user?.role === "admin" || (!!state.user?.email && ADMIN_EMAILS.includes(state.user.email)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
