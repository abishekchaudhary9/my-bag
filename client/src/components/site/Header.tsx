import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Search, ShoppingBag, User, LogOut, Shield, Bell, X, Menu, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { products } from "@/data/products";
import { notificationsApi, resolveAssetUrl } from "@/lib/api";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const nav = [
  { to: "/shop", label: "Shop All" },
  { to: "/shop?category=handbags", label: "Handbags" },
  { to: "/shop?category=backpacks", label: "Backpacks" },
  { to: "/shop?category=travel", label: "Travel" },
  { to: "/shop?category=office", label: "Office" },
  { to: "/offers", label: "Offers" },
  { to: "/journal", label: "Journal" },
];

export default function Header() {
  const { state, totals } = useStore();
  const { state: authState, isAdmin, logout, markAllNotificationsRead } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], ["5rem", "4rem"]);
  const headerBg = useTransform(scrollY, [0, 100], ["rgba(var(--background-rgb), 0)", "rgba(var(--background-rgb), 0.8)"]);
  const headerBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(20px)"]);

  const suggestions = q
    ? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  const iconButtonClass = "flex h-10 w-10 shrink-0 items-center justify-center hover:text-accent transition-all duration-300 rounded-full hover:bg-secondary/20";
  const canUseWishlist = authState.isAuthenticated && !isAdmin;

  return (
    <>
      <motion.header
        ref={headerRef}
        style={{ height: headerHeight, backgroundColor: headerBg, backdropFilter: headerBlur }}
        className="sticky top-0 z-50 transition-all duration-500 flex items-center border-b border-border/10"
      >
        <div className="container-luxe flex items-center justify-between w-full h-full relative">
          {/* LEFT: Menu & Search */}
          <div className="flex items-center gap-0.5 sm:gap-2 z-10">
            <button
              className="p-2 sm:p-2.5 bg-background/10 dark:bg-white/10 backdrop-blur-md hover:bg-background/20 dark:hover:bg-white/20 rounded-full transition-all border border-white/5 dark:border-white/10 shadow-sm lg:hidden flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:p-2.5 bg-background/10 dark:bg-white/10 backdrop-blur-md hover:bg-background/20 dark:hover:bg-white/20 rounded-full transition-all border border-white/5 dark:border-white/10 shadow-sm flex items-center justify-center"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* CENTER: Logo - Absolutely centered for symmetry */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <motion.div
              className="font-display text-xl sm:text-3xl tracking-tight cursor-pointer py-1"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // We keep the click logic but the animation is the focus
                navigate("/");
              }}
            >
              <motion.span
                animate={{ color: "hsl(var(--foreground))" }}
                whileTap={{
                  color: [
                    "hsl(var(--foreground))",
                    "hsl(var(--accent))",
                    "hsl(var(--foreground))"
                  ],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                }}
                className="hover:text-accent/40 transition-colors duration-500"
              >
                MAISON
              </motion.span>
            </motion.div>
          </div>

          {/* RIGHT: Essential Utilities */}
          <div className="flex items-center gap-0.5 sm:gap-2 z-10">
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              {canUseWishlist && (
                <Link to="/wishlist" aria-label="Wishlist" className={`${iconButtonClass} relative`}>
                  <Heart className="h-5 w-5" strokeWidth={1.5} />
                  {state.wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                      {state.wishlist.length}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Notifications */}
            {authState.isAuthenticated && (
              <button
                onClick={() => {
                  const next = !showNotifications;
                  setShowNotifications(next);
                  setShowUserMenu(false);
                  if (next && authState.unreadCount > 0) {
                    markAllNotificationsRead();
                  }
                }}
                className="p-2 sm:p-2.5 bg-background/10 dark:bg-white/10 backdrop-blur-md hover:bg-background/20 dark:hover:bg-white/20 rounded-full transition-all border border-white/5 dark:border-white/10 shadow-sm flex items-center justify-center relative group"
              >
                <Bell className="h-5 w-5" strokeWidth={1.5} />
                {authState.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground animate-pulse">
                    {authState.unreadCount > 9 ? '9+' : authState.unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Account - Visible on mobile with new style */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (!authState.isAuthenticated) navigate("/login");
                  else {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }
                }}
                className="p-2 sm:p-2.5 bg-background/10 dark:bg-white/10 backdrop-blur-md hover:bg-background/20 dark:hover:bg-white/20 rounded-full transition-all border border-white/5 dark:border-white/10 shadow-sm flex items-center justify-center"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <AnimatePresence>
                {showUserMenu && authState.isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute -right-4 sm:right-0 mt-3 w-64 bg-background/90 dark:bg-secondary/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 origin-top-right z-50 overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="py-3 px-4 border-b border-border/50 mb-1"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</div>
                      <div className="text-sm font-medium truncate">{authState.user?.email}</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isAdmin ? (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors rounded-lg">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      ) : (
                        <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors rounded-lg">
                          <User className="h-4 w-4" /> My Profile
                        </Link>
                      )}
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isAdmin && (
              <Link to="/cart" aria-label="Cart" className="p-2 sm:p-2.5 bg-background/10 dark:bg-white/10 backdrop-blur-md hover:bg-background/20 dark:hover:bg-white/20 rounded-full transition-all border border-white/5 dark:border-white/10 shadow-sm relative flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {totals.count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                    {totals.count}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* DYNAMIC DROPDOWNS: Anchored to the main header content area for stability */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-6 sm:right-10 top-[calc(100%+0.5rem)] w-[calc(100vw-3rem)] sm:w-80 max-w-[360px] bg-background/90 dark:bg-secondary/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl origin-top-right z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest">Notifications</div>
                  {authState.unreadCount > 0 && (
                    <button 
                      onClick={() => markAllNotificationsRead()} 
                      className="text-[9px] uppercase tracking-widest text-accent hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {authState.notifications.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground italic">No new notifications</div>
                  ) : (
                    authState.notifications.slice(0, 5).map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b border-border/30 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${!n.is_read ? 'bg-accent/5' : ''}`}
                        onClick={() => {
                          if (n.link) navigate(n.link);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="font-medium text-xs mb-1">{n.title}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</div>
                        <div className="text-[9px] text-muted-foreground/50 mt-2 uppercase tracking-tight">
                          {new Date(n.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link 
                  to="/profile?tab=notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="block py-3 text-center text-[10px] uppercase tracking-widest font-bold border-t border-border/50 hover:bg-white/5 transition-colors"
                >
                  View All Activity
                </Link>
              </motion.div>
            )}

            {showUserMenu && authState.isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-6 sm:right-10 top-[calc(100%+0.5rem)] w-[min(256px,calc(100vw-3rem))] sm:w-64 bg-background/90 dark:bg-secondary/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 origin-top-right z-50 overflow-hidden"
              >
                <div className="py-3 px-4 border-b border-border/50 mb-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</div>
                  <div className="text-sm font-medium truncate">{authState.user?.email}</div>
                </div>
                
                <Link to={isAdmin ? "/admin" : "/profile"} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors rounded-lg">
                  {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {isAdmin ? "Admin Panel" : "My Profile"}
                </Link>

                <button
                  onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 w-full bg-background border-b border-border shadow-2xl z-[150]"
          >
            <div className="container-luxe py-8">
              <div className="flex items-center gap-6">
                <Search className="h-6 w-6 text-muted-foreground" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search the collection..."
                  className="flex-1 bg-transparent font-display text-3xl md:text-5xl outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsSearchOpen(false);
                      navigate(`/shop?q=${encodeURIComponent(q)}`);
                    }
                  }}
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-12 grid md:grid-cols-2 gap-8">
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-6 group p-2 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="h-20 w-16 bg-secondary overflow-hidden">
                        <img src={resolveAssetUrl(p.colors?.[0]?.image)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">{p.category}</div>
                        <div className="font-display text-xl group-hover:text-accent transition-colors">{p.name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] sm:w-[60%] md:w-[45%] bg-background z-[160] lg:hidden flex flex-col shadow-2xl border-r border-border"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="p-6 flex items-center justify-between border-b border-border"
              >
                <div className="font-display text-2xl tracking-tighter">MAISON</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 bg-secondary/30 hover:bg-secondary/50 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </motion.div>

              <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="p-8 pb-4 space-y-6"
                >
                  {authState.isAuthenticated ? (
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border/50">
                      <Link to={isAdmin ? "/admin" : "/profile"} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <User className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</div>
                          <div className="text-sm font-medium">{authState.user?.firstName || 'User'}</div>
                        </div>
                      </Link>
                      {canUseWishlist && (
                        <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="relative p-2 hover:bg-secondary/20 rounded-full transition-colors">
                          <Heart className="h-5 w-5" strokeWidth={1.5} />
                          {state.wishlist.length > 0 && (
                            <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-accent text-[8px] font-bold text-accent-foreground flex items-center justify-center">
                              {state.wishlist.length}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-6 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-colors border border-border/50"
                    >
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Welcome</div>
                        <div className="text-sm font-bold uppercase tracking-[0.1em]">Sign In / Join</div>
                      </div>
                      <ChevronRight className="h-5 w-5 opacity-30" />
                    </Link>
                  )}
                </motion.div>

                <nav className="p-8 space-y-8">
                  {nav.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      viewport={{ once: true, margin: "-10%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block font-display text-4xl hover:text-accent transition-colors tracking-tight"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="h-20" /> {/* Scroll spacer */}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="p-8 border-t border-border bg-secondary/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                <div className="flex gap-8">
                  <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">Story</Link>
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">Contact</Link>
                  <Link to="/journal" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">Journal</Link>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
