import { createContext, useContext, useEffect, useMemo, useReducer, ReactNode, useCallback } from "react";
import { Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { resolveAssetUrl, wishlistApi, cartApi } from "@/lib/api";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  qty: number;
};

type State = {
  cart: CartItem[];
  saved: CartItem[];
  wishlist: string[];
  wishlistItems: Product[];
  recent: string[];
  coupon?: { code: string; pct: number };
};

type Action =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; key: string }
  | { type: "QTY"; key: string; qty: number }
  | { type: "SAVE_LATER"; key: string }
  | { type: "MOVE_TO_CART"; key: string }
  | { type: "WISH_TOGGLE"; product: Product }
  | { type: "WISH_REMOVE"; id: string }
  | { type: "WISH_SET"; ids: string[]; items: Product[] }
  | { type: "VIEWED"; id: string }
  | { type: "COUPON"; code: string }
  | { type: "COUPON_CLEAR" }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; state: State }
  | { type: "RESET" };

const KEY = "maison.store.v1";
const initial: State = { cart: [], saved: [], wishlist: [], wishlistItems: [], recent: [] };

const itemKey = (i: CartItem) => `${i.productId}-${i.color}-${i.size}`;
const productId = (id: string | number) => String(id);
const storeKeyForUser = (userId: string | number) => `${KEY}.${userId}`;
const normalizeCartItem = (item: CartItem): CartItem => ({ ...item, image: resolveAssetUrl(item.image) });
const normalizeProduct = (product: Product): Product => ({
  ...product,
  id: productId(product.id),
  colors: product.colors.map((color) => ({ ...color, image: resolveAssetUrl(color.image) })),
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initial;
    case "HYDRATE":
      return {
        ...initial,
        ...action.state,
        cart: (action.state.cart || []).map(normalizeCartItem),
        saved: (action.state.saved || []).map(normalizeCartItem),
        wishlist: (action.state.wishlist || []).map(productId),
        wishlistItems: (action.state.wishlistItems || []).map(normalizeProduct),
      };
    case "ADD": {
      const k = itemKey(action.item);
      const existing = state.cart.find((i) => itemKey(i) === k);
      const cart = existing
        ? state.cart.map((i) => (itemKey(i) === k ? { ...i, qty: i.qty + action.item.qty } : i))
        : [...state.cart, action.item];
      return { ...state, cart };
    }
    case "REMOVE":
      return { ...state, cart: state.cart.filter((i) => itemKey(i) !== action.key) };
    case "QTY":
      return {
        ...state,
        cart: state.cart.map((i) =>
          itemKey(i) === action.key ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      };
    case "SAVE_LATER": {
      const item = state.cart.find((i) => itemKey(i) === action.key);
      if (!item) return state;
      return {
        ...state,
        cart: state.cart.filter((i) => itemKey(i) !== action.key),
        saved: [item, ...state.saved],
      };
    }
    case "MOVE_TO_CART": {
      const item = state.saved.find((i) => itemKey(i) === action.key);
      if (!item) return state;
      return {
        ...state,
        saved: state.saved.filter((i) => itemKey(i) !== action.key),
        cart: [...state.cart, item],
      };
    }
    case "WISH_TOGGLE": {
      const product = normalizeProduct(action.product);
      const exists = state.wishlist.includes(product.id);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((id) => id !== product.id)
          : [product.id, ...state.wishlist],
        wishlistItems: exists
          ? state.wishlistItems.filter((item) => item.id !== product.id)
          : [product, ...state.wishlistItems.filter((item) => item.id !== product.id)],
      };
    }
    case "WISH_REMOVE": {
      return {
        ...state,
        wishlist: state.wishlist.filter((id) => id !== action.id),
        wishlistItems: state.wishlistItems.filter((item) => item.id !== action.id),
      };
    }
    case "WISH_SET": {
      return {
        ...state,
        wishlist: action.ids.map(productId),
        wishlistItems: action.items.map(normalizeProduct),
      };
    }
    case "VIEWED":
      return {
        ...state,
        recent: [action.id, ...state.recent.filter((id) => id !== action.id)].slice(0, 6),
      };
    case "COUPON": {
      const code = action.code.trim().toUpperCase();
      const map: Record<string, number> = { WELCOME10: 10, MAISON15: 15, ATELIER20: 20 };
      if (!map[code]) return state;
      return { ...state, coupon: { code, pct: map[code] } };
    }
    case "COUPON_CLEAR":
      return { ...state, coupon: undefined };
    case "CLEAR_CART":
      return { ...state, cart: [], coupon: undefined };
    default:
      return state;
  }
}

type Ctx = {
  state: State;
  addToCart: (p: Product, opts: { color: string; size: string; qty?: number }) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  toggleWish: (product: Product) => void;
  removeFromWish: (id: string | number) => void;
  isWished: (id: string | number) => boolean;
  markViewed: (id: string) => void;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
  clearCart: () => void;
  itemKey: (i: CartItem) => string;
  totals: { subtotal: number; discount: number; shipping: number; total: number; count: number };
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { state: authState, isAdmin, socket } = useAuth();
  const activeCustomerId = authState.isAuthenticated && !isAdmin ? authState.user?.id : null;

  const fetchCart = useCallback(async () => {
    if (!activeCustomerId) return;
    try {
      const { cart } = await cartApi.get();
      dispatch({ type: "HYDRATE", state: { ...initial, cart } });
    } catch {
      return;
    }
  }, [activeCustomerId]);

  useEffect(() => {
    if (authState.loading) return;

    if (!activeCustomerId) {
      dispatch({ type: "RESET" });
      return;
    }

    fetchCart();
  }, [activeCustomerId, authState.loading, fetchCart]);

  useEffect(() => {
    if (!socket || !activeCustomerId) return;

    socket.on("cart_update", () => {
      fetchCart();
    });

    return () => {
      socket.off("cart_update");
    };
  }, [socket, activeCustomerId, fetchCart]);

  useEffect(() => {
    if (!activeCustomerId) return;

    wishlistApi.get()
      .then(({ productIds, wishlist }) => {
        dispatch({ type: "WISH_SET", ids: productIds, items: wishlist as Product[] });
      })
      .catch(() => {});
  }, [activeCustomerId]);

  const totals = useMemo(() => {
    const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = state.coupon ? (subtotal * state.coupon.pct) / 100 : 0;
    const shipping = subtotal > 250 || subtotal === 0 ? 0 : 18;
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    const total = Math.max(0, subtotal - discount) + shipping;
    return { subtotal, discount, shipping, total, count };
  }, [state]);

  const value: Ctx = {
    state,
    addToCart: (p, { color, size, qty = 1 }) => {
      dispatch({
        type: "ADD",
        item: {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          image: resolveAssetUrl(p.colors.find((c) => c.name === color)?.image ?? p.colors[0].image),
          color,
          size,
          qty,
        },
      });

      if (activeCustomerId) {
        cartApi.add(p.id, color, size, qty).catch(() => {});
      }
    },
    removeItem: (key) => {
      const item = state.cart.find((i) => itemKey(i) === key);
      dispatch({ type: "REMOVE", key });
      if (activeCustomerId && item?.id) {
        cartApi.remove(Number(item.id)).catch(() => {});
      }
    },
    setQty: (key, qty) => {
      const item = state.cart.find((i) => itemKey(i) === key);
      dispatch({ type: "QTY", key, qty });
      if (activeCustomerId && item?.id) {
        cartApi.updateQty(Number(item.id), qty).catch(() => {});
      }
    },
    saveForLater: (key) => dispatch({ type: "SAVE_LATER", key }),
    moveToCart: (key) => dispatch({ type: "MOVE_TO_CART", key }),
    toggleWish: (product) => {
      if (!activeCustomerId) return;

      const id = productId(product.id);
      const shouldAdd = !state.wishlist.includes(id);
      dispatch({ type: "WISH_TOGGLE", product });

      if (/^\d+$/.test(id)) {
        const request = shouldAdd ? wishlistApi.toggle(id) : wishlistApi.remove(id);
        request.catch(() => dispatch({ type: "WISH_TOGGLE", product }));
      }
    },
    removeFromWish: (id) => {
      if (!activeCustomerId) return;
      const pid = productId(id);
      if (!state.wishlist.includes(pid)) return;

      dispatch({ type: "WISH_REMOVE", id: pid });
      if (/^\d+$/.test(pid)) {
        wishlistApi.remove(pid).catch(() => {
          // If removal fails, we might want to revert, but usually it's fine for checkout
        });
      }
    },
    isWished: (id) => Boolean(activeCustomerId) && state.wishlist.includes(productId(id)),
    markViewed: (id) => dispatch({ type: "VIEWED", id }),
    applyCoupon: (code) => {
      const map: Record<string, number> = { WELCOME10: 10, MAISON15: 15, ATELIER20: 20 };
      const ok = !!map[code.trim().toUpperCase()];
      if (ok) dispatch({ type: "COUPON", code });
      return ok;
    },
    clearCoupon: () => dispatch({ type: "COUPON_CLEAR" }),
    clearCart: () => {
      dispatch({ type: "CLEAR_CART" });
      if (activeCustomerId) {
        cartApi.clear().catch(() => {});
      }
    },
    itemKey,
    totals,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
