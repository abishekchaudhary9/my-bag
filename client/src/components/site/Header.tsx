import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Search, ShoppingBag, User, LogOut, Shield, Bell, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { products } from "@/data/products";
import { notificationsApi } from "@/lib/api";

const nav = [
  { to: "/shop", label: "Shop All" },
  { to: "/shop?category=handbags", label: "Handbags" },
  { to: "/shop?category=backpacks", label: "Backpacks" },
  { to: "/shop?category=travel", label: "Travel" },
  { to: "/shop?category=office", label: "Office" },
  { to: "/journal", label: "Journal" },
];

export default function Header() {
  const { state, totals } = useStore();
  const { state: authState, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.isAuthenticated) {
      notificationsApi.get().then(d => setNotifications(d.notifications)).catch(() => {});
    }
  }, [authState.isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const handleClearAllNotifications = async () => {
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
    } catch {}
  };

  const suggestions = q
    ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md hairline">
      <div className="container-luxe flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="font-display text-xl md:text-2xl tracking-tight">
          MAISON<span className="text-accent">.</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `text-[13px] uppercase tracking-[0.18em] link-underline ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 md:gap-3">
          <button
            aria-label="Search"
            onClick={() => setOpen((v) => !v)}
            className="p-2 hover:text-accent transition-colors"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>

          {/* Notifications button */}
          {authState.isAuthenticated && (
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowUserMenu(false);
                }}
                className="p-2 hover:text-accent transition-colors relative"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-accent text-[8px] text-background flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border shadow-lift z-50 animate-fade-in max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10">
                      <div className="text-sm font-medium">Notifications</div>
                      <div className="flex gap-3">
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                            Mark read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={handleClearAllNotifications} className="text-[10px] uppercase tracking-wider text-destructive hover:opacity-80">
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="py-2">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-muted-foreground">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 border-b border-border/40 last:border-0 hover:bg-secondary/30 transition-colors ${!n.is_read ? 'bg-secondary/10' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-xs font-semibold">{n.title}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</div>
                                <button onClick={() => handleDeleteNotification(n.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-foreground/80 mb-2">{n.message}</div>
                            <div className="flex justify-between items-center">
                              {n.link ? (
                                <Link 
                                  to={n.link} 
                                  onClick={() => { setShowNotifications(false); if (!n.is_read) handleMarkRead(n.id); }}
                                  className="text-[10px] uppercase tracking-wider text-accent link-underline"
                                >
                                  View
                                </Link>
                              ) : <span />}
                              {!n.is_read && (
                                <button onClick={() => handleMarkRead(n.id)} className="text-[10px] text-muted-foreground hover:text-foreground">
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User / Auth button */}
          <div className="relative hidden sm:block">
            <button
              aria-label="Account"
              onClick={() => {
                setShowUserMenu((v) => !v);
                setShowNotifications(false);
              }}
              className="p-2 hover:text-accent transition-colors"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {authState.isAuthenticated && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border shadow-lift z-50 animate-fade-in">
                  {authState.isAuthenticated ? (
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <div className="text-sm font-medium">{authState.user?.firstName} {authState.user?.lastName}</div>
                        <div className="text-xs text-muted-foreground">{authState.user?.email}</div>
                      </div>
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                        <User className="h-4 w-4" strokeWidth={1.5} /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                        <ShoppingBag className="h-4 w-4" strokeWidth={1.5} /> Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-accent">
                          <Shield className="h-4 w-4" strokeWidth={1.5} /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-border mt-1">
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-destructive w-full text-left"
                        >
                          <LogOut className="h-4 w-4" strokeWidth={1.5} /> Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <Link to="/login" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                        Sign In
                      </Link>
                      <Link to="/signup" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <Link to="/wishlist" aria-label="Wishlist" className="p-2 hover:text-accent transition-colors relative">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {state.wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                {state.wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="p-2 hover:text-accent transition-colors relative">
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {totals.count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                {totals.count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="hairline animate-fade-in">
          <div className="container-luxe py-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
                navigate(`/shop?q=${encodeURIComponent(q)}`);
              }}
              className="flex items-center gap-3 border-b border-border pb-3"
            >
              <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search bags, materials, collections..."
                className="w-full bg-transparent font-display text-2xl md:text-3xl placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </form>
            {suggestions.length > 0 && (
              <ul className="mt-4 space-y-1">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 py-2 group"
                    >
                      <img src={p.colors[0].image} alt="" className="w-12 h-12 object-cover bg-muted" />
                      <div className="flex-1">
                        <div className="text-sm group-hover:text-accent transition-colors">{p.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{p.category}</div>
                      </div>
                      <div className="text-sm">Rs {p.price}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}