import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Heart, MapPin, Settings, LogOut, Camera, Shield, Bell, Eye } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { authApi, productsApi } from "@/lib/api";
import { Product, products } from "@/data/products";
import { toast } from "sonner";

type Tab = "overview" | "settings" | "addresses" | "security";

export default function Profile() {
  const { state, logout, updateProfile, isAdmin } = useAuth();
  const { state: storeState } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list()
      .then(({ products }) => setApiProducts(products as Product[]))
      .catch(() => {});
  }, []);

  const wishlistItems = useMemo(() => {
    const catalog = [...storeState.wishlistItems, ...apiProducts, ...products];
    return storeState.wishlist
      .map((id) => catalog.find((product) => String(product.id) === String(id)))
      .filter((product): product is Product => Boolean(product));
  }, [apiProducts, storeState.wishlist, storeState.wishlistItems]);

  if (isAdmin) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center animate-fade-up">
          <div className="eyebrow mb-4">Restricted</div>
          <h1 className="font-display text-5xl md:text-6xl">Admin Panel</h1>
          <p className="mt-5 text-muted-foreground max-w-md mx-auto">
            Admin accounts are managed from the Admin Panel.
          </p>
          <Link
            to="/admin"
            className="mt-10 inline-flex bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
          >
            Go to Admin Panel
          </Link>
        </div>
      </Layout>
    );
  }

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
  ];

  return (
    <Layout>
      <section className="container-luxe pt-12 pb-8">
        <div className="eyebrow mb-3">Your Account</div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-ink text-background grid place-items-center font-display text-2xl flex-shrink-0 relative group">
            {initials}
            <button className="absolute inset-0 rounded-full bg-foreground/60 text-background grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl">{user.firstName} {user.lastName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              {isAdmin && (
                <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 bg-accent text-accent-foreground">Admin</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
          </div>
        </div>
      </section>

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
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
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
                        <div className="text-xs text-muted-foreground mt-0.5">{o.items.length} items · {new Date(o.date).toLocaleDateString()}</div>
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
        {tab === "settings" && <ProfileSettings user={user} onUpdate={updateProfile} />}

        {/* ADDRESSES TAB */}
        {tab === "addresses" && <AddressesTab user={user} onUpdate={updateProfile} />}

        {/* SECURITY TAB */}
        {tab === "security" && <SecurityTab />}

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

function ProfileSettings({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(form);
    toast.success("Profile updated");
  };

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-5 animate-fade-up">
      <div className="eyebrow mb-6">Personal Information</div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="eyebrow">First Name</span>
          <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
        <label className="block">
          <span className="eyebrow">Last Name</span>
          <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow">Email</span>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
      </label>
      <label className="block">
        <span className="eyebrow">Phone</span>
        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
      </label>
      <button type="submit" className="bg-foreground text-background px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">
        Save Changes
      </button>
    </form>
  );
}

function AddressesTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [form, setForm] = useState({
    street: user.address?.street ?? "",
    city: user.address?.city ?? "",
    state: user.address?.state ?? "",
    zip: user.address?.zip ?? "",
    country: user.address?.country ?? "United States",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ address: form });
    toast.success("Address updated");
  };

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-5 animate-fade-up">
      <div className="eyebrow mb-6">Shipping Address</div>
      <label className="block">
        <span className="eyebrow">Street</span>
        <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="block">
          <span className="eyebrow">City</span>
          <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
        <label className="block">
          <span className="eyebrow">State</span>
          <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
        <label className="block">
          <span className="eyebrow">ZIP</span>
          <input type="text" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow">Country</span>
        <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
      </label>
      <button type="submit" className="bg-foreground text-background px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">
        Save Address
      </button>
    </form>
  );
}

function SecurityTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await authApi.changePassword(currentPw, newPw);
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-lg space-y-10 animate-fade-up">
      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div className="eyebrow mb-6">Change Password</div>
        <label className="block">
          <span className="eyebrow">Current Password</span>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
        <label className="block">
          <span className="eyebrow">New Password</span>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
        <label className="block">
          <span className="eyebrow">Confirm New Password</span>
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors" />
        </label>
        <button type="submit" className="bg-foreground text-background px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">
          Update Password
        </button>
      </form>

      {/* Security options */}
      <div className="space-y-5">
        <div className="eyebrow mb-4">Security Settings</div>
        <div className="flex items-center justify-between p-4 border border-border">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium">Two-Factor Authentication</div>
              <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
            </div>
          </div>
          <button
            onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? "2FA disabled" : "2FA enabled"); }}
            className={`relative w-11 h-6 rounded-full transition-colors ${twoFA ? "bg-accent" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${twoFA ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium">Email Notifications</div>
              <div className="text-xs text-muted-foreground">Order updates and new arrivals</div>
            </div>
          </div>
          <button
            onClick={() => { setEmailNotif(!emailNotif); toast.success(emailNotif ? "Notifications disabled" : "Notifications enabled"); }}
            className={`relative w-11 h-6 rounded-full transition-colors ${emailNotif ? "bg-accent" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${emailNotif ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium">Login Activity</div>
              <div className="text-xs text-muted-foreground">Last login: Today from Chrome on Windows</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
