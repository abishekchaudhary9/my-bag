import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, 
  LogOut, 
  Shield, 
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { statusColor, statusTone } from "@/constants/adminConstants";

/* ─── Admin Layout ─────────────────────────────────────── */
export function AdminLayout({ children, notificationCount, onBellClick, onProfileClick, isBellBlinking }: { children: React.ReactNode, notificationCount?: number, onBellClick?: () => void, onProfileClick?: () => void, isBellBlinking?: boolean }) {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); toast.success("Signed out"); navigate("/"); };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/admin" className="font-display text-lg md:text-2xl tracking-tight">MAISON</Link>
            <span className="hidden sm:flex text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 bg-accent text-accent-foreground items-center gap-1">
              <Shield className="h-3 w-3" strokeWidth={2} /> Admin
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden xs:block">
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-4 border-r border-border pr-2 sm:pr-6">
              <button 
                onClick={onBellClick}
                className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors group"
                title="Notifications"
              >
                <Bell className="h-5 w-5" strokeWidth={1.5} />
                {notificationCount ? (
                  <span className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground ${isBellBlinking ? "animate-pulse" : ""}`}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                ) : null}
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <button onClick={onProfileClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="relative group h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent overflow-hidden border border-border">
                    {state.user?.avatar ? (
                      <img src={state.user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="hidden xs:block text-left">
                    <div className="text-[11px] font-medium leading-none mb-1">{state.user?.firstName} {state.user?.lastName}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">My Profile</div>
                  </div>
                </button>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-destructive hover:underline font-medium">
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

/* ─── Shared UI Components ────────────────────────────── */
export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "text-muted-foreground",
  index = 0,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  detail: string;
  tone?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="border border-border bg-background p-4 md:p-5 transition-all duration-500 hover:border-foreground/30 hover:bg-secondary/5 group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`p-1.5 rounded-lg bg-secondary/50 group-hover:bg-background transition-colors`}>
          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${tone}`} strokeWidth={1.5} />
        </div>
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.12em] md:tracking-[0.18em] text-muted-foreground font-bold text-right">{label}</span>
      </div>
      <div className="mt-4 md:mt-6 break-words font-display text-xl tracking-tight md:text-3xl">{value}</div>
      <div className="mt-1 md:mt-2 text-[9px] uppercase tracking-widest text-muted-foreground/70">{detail}</div>
    </motion.div>
  );
}

export function Panel({ title, eyebrow, children, action, index = 0 }: { title: string, eyebrow: string, children: React.ReactNode, action?: React.ReactNode, index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="border border-border bg-background p-6 md:p-8"
    >
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-1.5">{eyebrow}</div>
          <h3 className="font-display text-2xl md:text-3xl tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 shadow-xl backdrop-blur-md bg-background/90">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 border-b border-border pb-1">{label}</div>
        <div className="space-y-1.5">
          {payload.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className="text-[11px] font-medium" style={{ color: item.color || item.fill }}>{item.name}</span>
              <span className="text-sm font-display">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border ${statusTone[status] || "bg-secondary"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusColor[status] || "bg-muted-foreground"}`} />
      {status}
    </span>
  );
}

