import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Search, ShoppingBag, User, LogOut, Shield, Bell, X, Menu } from "lucide-react";
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
  const { state: authState, isAdmin, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
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
    <motion.header 
      ref={headerRef}
      style={{ height: headerHeight, backgroundColor: headerBg, backdropFilter: headerBlur }}
      className="sticky top-0 z-50 transition-all duration-500 flex items-center border-b border-border/10"
    >
      <div className="container-luxe flex items-center justify-between w-full">
        {/* LEFT: Mobile Menu & Search */}
        <div className="flex-1 flex justify-start items-center gap-2">
          <button 
            className="lg:hidden p-2 hover:bg-secondary/20 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex h-10 w-10 items-center justify-center hover:bg-secondary/20 rounded-full transition-colors"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* CENTER: Logo */}
        <div className="flex-[2] flex justify-center">
          <Link to="/" className="font-display text-2xl sm:text-3xl tracking-tighter relative group overflow-hidden py-1">
            <span className="inline-block transition-transform duration-700 group-hover:-translate-y-full">MAISON</span>
            <span className="absolute left-0 top-full inline-block transition-transform duration-700 group-hover:-translate-y-full text-accent">MAISON</span>
          </Link>
        </div>

        {/* RIGHT: Utilities */}
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                if (!authState.isAuthenticated) navigate("/login");
                else setShowUserMenu(!showUserMenu);
              }}
              className={iconButtonClass}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {showUserMenu && authState.isAuthenticated && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 glass shadow-lift p-2 origin-top-right z-50 overflow-hidden"
                >
                  <div className="py-2 px-4 border-b border-border/50 mb-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</div>
                    <div className="text-sm font-medium truncate">{authState.user?.email}</div>
                  </div>
                  {isAdmin ? (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  ) : (
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                  )}
                  <button 
                    onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {canUseWishlist ? (
            <Link to="/wishlist" aria-label="Wishlist" className={`${iconButtonClass} relative`}>
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {state.wishlist.length > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                  {state.wishlist.length}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Link to="/cart" aria-label="Cart" className={`${iconButtonClass} relative`}>
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {totals.count > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                {totals.count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full bg-background border-b border-border shadow-2xl z-50"
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

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-[100] lg:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div className="font-display text-2xl tracking-tighter">MAISON</div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-8 space-y-8">
              {nav.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.8 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-display text-4xl hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="p-8 border-t border-border flex items-center justify-between"
            >
              <ThemeToggle />
              <div className="flex gap-6">
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Story</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Contact</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
