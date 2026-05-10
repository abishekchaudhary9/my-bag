import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Heart, MapPin, Settings, LogOut, Camera, Shield, Bell, Eye, ChevronDown, Trash2 } from "lucide-react";
import Layout from "@/components/layouts/Layout";
import { useAuth, type User as AuthUser } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { productsApi } from "@/lib/api";
import { Product, products } from "@/data/products";
import { toast } from "sonner";
import { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { AddressesTabForm } from "@/components/profile/AddressesTabForm";
import { SecurityTabForm } from "@/components/profile/SecurityTabForm";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeletons";

type Tab = "overview" | "settings" | "addresses" | "security" | "notifications";

export default function Profile() {
  const { state, logout, updateProfile, changePassword, resendVerificationEmail, isAdmin, updateAvatar, deleteAvatar, markAllNotificationsRead, markNotificationRead } = useAuth();
  const { state: storeState } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsApi.list()
      .then((res) => {
        setApiProducts(Array.isArray(res?.products) ? res.products as Product[] : []);
      })
      .catch(() => setApiProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const wishlistItems = useMemo(() => {
    const catalog = [...storeState.wishlistItems, ...apiProducts, ...products];
    return storeState.wishlist
      .map((id) => catalog.find((product) => String(product.id) === String(id)))
      .filter((product): product is Product => Boolean(product));
  }, [apiProducts, storeState.wishlist, storeState.wishlistItems]);

  if (!state.isAuthenticated || !state.user) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Profile</div>
          <h1 className="font-display text-5xl md:text-6xl">Sign in to view profile</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">You need to be signed in to manage your account.</p>
          <Link
            to="/login"
            className="mt-10 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const user = state.user;
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const contactLabel = user.email || user.phone || "No contact saved";

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/");
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "settings", label: "Edit Profile", icon: Settings },
    { key: "addresses", label: "Addresses", icon: MapPin },
    { key: "security", label: "Security", icon: Shield },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const loadingToast = toast.loading("Uploading picture...");
    try {
      await updateAvatar(file);
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.dismiss(loadingToast);
    }
  };

  if (loading) return <Layout><ProfileSkeleton /></Layout>;

  return (
    <Layout>
      <section className="container-luxe pt-12 pb-8">
        <div className="eyebrow mb-3">Your Account</div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group">
            <div className="h-20 w-20 rounded-full bg-gradient-ink text-background grid place-items-center font-display text-2xl flex-shrink-0 overflow-hidden shadow-xl border border-border/50">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
              <label className="absolute inset-0 bg-black/40 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5" strokeWidth={1.5} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            {user.avatar && (
              <button 
                onClick={async (e) => {
                  e.preventDefault();
                  if (confirm("Remove profile picture?")) {
                    await deleteAvatar();
                  }
                }}
                className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-white rounded-full grid place-items-center shadow-lg hover:scale-110 transition-transform z-10"
                title="Remove picture"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
            
            <label className="absolute -bottom-1 -right-1 h-7 w-7 bg-accent text-accent-foreground rounded-full grid place-items-center shadow-lg cursor-pointer hover:scale-110 transition-transform md:hidden">
              <Camera className="h-3.5 w-3.5" strokeWidth={2} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl">{user.firstName} {user.lastName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">{contactLabel}</span>
              {isAdmin && (
                <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 bg-accent text-accent-foreground">Admin</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
          </div>
        </div>
      </section>
      
      {!user.emailVerified && user.email && (
        <section className="container-luxe mb-8">
          <div className="bg-accent/5 border border-accent/20 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/10 grid place-items-center flex-shrink-0">
                <Bell className="h-5 w-5 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-sm font-medium">Verify your email address</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Please verify your email to secure your account and receive order updates. 
                  Check your inbox for the link we sent.
                </p>
              </div>
            </div>
            <button 
              onClick={async () => {
                const res = await resendVerificationEmail();
                if (res.success) toast.success("Verification link sent!");
                else toast.error(res.error || "Failed to send link");
              }}
              className="text-[11px] uppercase tracking-[0.14em] px-5 py-2.5 bg-foreground text-background hover:bg-accent transition-colors"
            >
              Resend Link
            </button>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className="container-luxe pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStat icon={Package} label="Orders" value={state.orders.length.toString()} to="/orders" />
          <QuickStat icon={Heart} label="Wishlist" value={storeState.wishlist.length.toString()} to="/wishlist" />
          <QuickStat icon={MapPin} label="Addresses" value={user.address ? "1" : "0"} />
          {isAdmin && <QuickStat icon={Shield} label="Admin Panel" value="→" to="/admin" accent />}
        </div>
      </section>

      {/* Tabs */}
      <section className="container-luxe pb-24">
        <div className="relative mb-8 md:hidden">
          <select
            value={tab}
            onChange={(event) => setTab(event.target.value as Tab)}
            className="w-full appearance-none border border-border bg-background px-4 py-3 pr-10 text-[13px] uppercase tracking-[0.14em] text-foreground focus:border-foreground focus:outline-none"
          >
            {tabs.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="mb-8 hidden gap-1 border-b border-border md:flex">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-[13px] uppercase tracking-[0.14em] transition-colors border-b-2 whitespace-nowrap ${
                  tab === t.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-10 animate-fade-up">
            {/* Recent orders */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="eyebrow">Recent Orders</div>
                <Link to="/orders" className="text-xs link-underline text-accent">View all</Link>
              </div>
              {state.orders.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">No orders yet.</div>
              ) : (
                <div className="space-y-3">
                  {state.orders.slice(0, 3).map((o) => (
                    <Link key={o.id} to={`/order-confirmation/${o.id}`} className="flex items-center justify-between p-4 bg-secondary/40 hover:bg-secondary/60 transition-colors group">
                      <div>
                        <div className="text-sm font-medium group-hover:text-accent transition-colors">{o.id}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{o.items.length} items · {new Date(o.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Rs {o.total.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground capitalize">{o.status}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist preview */}
            {wishlistItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="eyebrow">Saved Pieces</div>
                  <Link to="/wishlist" className="text-xs link-underline text-accent">View all</Link>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {wishlistItems.slice(0, 4).map((p) =>
                    p ? (
                      <Link key={p.id} to={`/product/${p.slug}`} className="flex-shrink-0 w-28 group">
                        <div className="aspect-[4/5] bg-secondary overflow-hidden">
                          <img src={p.colors[0].image} alt={p.name} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                        </div>
                        <div className="text-xs mt-2 truncate">{p.name}</div>
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && <ProfileSettingsForm user={user} onUpdate={updateProfile} />}

        {/* ADDRESSES TAB */}
        {tab === "addresses" && <AddressesTabForm user={user} onUpdate={updateProfile} />}

        {/* SECURITY TAB */}
        {tab === "security" && <SecurityTabForm onChangePassword={changePassword} />}

        {/* NOTIFICATIONS TAB */}
        {tab === "notifications" && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="eyebrow">Recent Activity</div>
              {state.notifications.length > 0 && (
                <button 
                  onClick={() => markAllNotificationsRead()}
                  className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {state.notifications.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border/60 rounded-2xl">
                <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-4" strokeWidth={1} />
                <p className="text-sm text-muted-foreground italic">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markNotificationRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                    className={`p-6 border border-border/50 rounded-2xl transition-all group cursor-pointer hover:border-foreground/20 ${
                      !n.isRead ? "bg-accent/5" : "bg-secondary/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-medium text-sm group-hover:text-accent transition-colors flex items-center gap-2">
                          {n.title}
                          {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{n.message}</p>
                      </div>
                      <div className="text-[10px] text-muted-foreground/50 uppercase tracking-tight whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="mt-12 pt-8 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-destructive hover:underline"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </section>
    </Layout>
  );
}

function QuickStat({ icon: Icon, label, value, to, accent }: { icon: typeof User; label: string; value: string; to?: string; accent?: boolean }) {
  const inner = (
    <div className={`p-4 border border-border hover:border-foreground/30 transition-colors ${accent ? "bg-accent/10" : ""}`}>
      <Icon className={`h-5 w-5 mb-3 ${accent ? "text-accent" : "text-muted-foreground"}`} strokeWidth={1.5} />
      <div className="font-display text-2xl">{value}</div>
      <div className="eyebrow mt-1">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

