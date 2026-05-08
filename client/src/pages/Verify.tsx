import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Verify() {
  const { state, sendOtp, verifyOtp, logout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated && state.user?.emailVerified) {
      navigate("/profile");
    }
  }, [state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user?.email) return;
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const result = await verifyOtp(state.user.email, code);
    setLoading(false);

    if (result.success) {
      toast.success("Email verified!");
      navigate("/profile");
    } else {
      toast.error(result.error || "Invalid code");
    }
  };

  const handleResend = async () => {
    if (!state.user?.email) return;
    setResending(true);
    const result = await sendOtp(state.user.email);
    setResending(false);
    if (result.success) {
      toast.success("New code sent!");
    } else {
      toast.error(result.error || "Failed to resend");
    }
  };

  if (!state.user) {
    return (
      <Layout>
        <div className="container-luxe py-32 text-center">
          <h1 className="font-display text-4xl">Session Expired</h1>
          <p className="mt-4 text-muted-foreground">Please sign in again to verify your email.</p>
          <button onClick={() => navigate("/login")} className="mt-8 bg-foreground text-background px-8 py-3 uppercase tracking-widest text-xs">Sign In</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-md mx-auto animate-fade-up">
          <div className="text-center mb-12">
            <div className="h-16 w-16 bg-accent/10 text-accent rounded-full grid place-items-center mx-auto mb-6">
              <ShieldCheck className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="eyebrow mb-4">Complete Your Account</div>
            <h1 className="font-display text-4xl md:text-5xl">Verify Your Email</h1>
            <p className="mt-4 text-muted-foreground text-sm">
              We've sent a 6-digit verification code to <span className="text-foreground font-medium">{state.user.email}</span>.
              Enter it below to unlock your account features.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full max-w-[200px] text-center bg-transparent border-b-2 border-border focus:border-foreground py-4 text-4xl tracking-[0.5em] font-display focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify Account"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>

          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="mt-12 w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </button>
        </div>
      </section>
    </Layout>
  );
}
