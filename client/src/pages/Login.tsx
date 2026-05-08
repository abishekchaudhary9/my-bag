import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Mail, MessageSquare, Phone } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { isFirebaseConfigured } from "@/lib/firebase";
import { formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

type LoginMode = "email" | "phone";

export default function Login() {
  const { login, googleLogin, sendPhoneLoginCode, confirmPhoneLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finishLogin = (description: string) => {
    toast.success("Welcome back", { description });
    navigate("/profile");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      finishLogin("You've been signed in.");
    } else {
      setError(result.error ?? "Invalid credentials");
    }
  };

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isValidNepalPhone(phone)) {
      setError("Enter a valid Nepal mobile number.");
      setLoading(false);
      return;
    }

    const result = await sendPhoneLoginCode(phone, "login-recaptcha");
    setLoading(false);

    if (result.success) {
      setPhoneCodeSent(true);
      toast.success("Verification code sent", { description: formatNepalPhone(phone) });
    } else {
      setError(result.error ?? "Could not send verification code");
    }
  };

  const handleConfirmPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await confirmPhoneLogin(otp);
    setLoading(false);

    if (result.success) {
      finishLogin("You've been signed in with your phone number.");
    } else {
      setError(result.error ?? "Invalid verification code");
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const result = await googleLogin();
    setLoading(false);

    if (result.success) {
      finishLogin("You've been signed in with Google.");
    } else {
      setError(result.error ?? "Google login failed");
    }
  };

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-md animate-fade-up">
          <div className="mb-10 text-center">
            <div className="eyebrow mb-4">Welcome Back</div>
            <h1 className="font-display text-4xl md:text-5xl">Sign In</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Access your orders, wishlist, and saved pieces.
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mb-6 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Firebase sign-in is waiting for the client environment keys.
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors ${
                mode === "email" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              Email
            </button>
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors ${
                mode === "phone" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              Phone
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-destructive/10 p-4 text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          {mode === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <label className="block">
                <span className="eyebrow">Email Address</span>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-2 w-full border-b border-border bg-transparent py-3 text-base transition-colors focus:border-foreground focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="eyebrow">Password</span>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="mt-2 w-full border-b border-border bg-transparent py-3 pr-10 text-base transition-colors focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-0 top-1/2 mt-1 -translate-y-1/2 p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-xs">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" className="accent-accent" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link to="/forgot-password" className="link-underline text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>

              <SubmitButton loading={loading} label="Sign In" />
            </form>
          ) : (
            <form onSubmit={phoneCodeSent ? handleConfirmPhoneCode : handleSendPhoneCode} className="space-y-6">
              <label className="block">
                <span className="eyebrow">Phone Number</span>
                <input
                  id="login-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="mt-2 w-full border-b border-border bg-transparent py-3 text-base transition-colors focus:border-foreground focus:outline-none"
                />
              </label>

              {phoneCodeSent && (
                <label className="block animate-fade-in">
                  <span className="eyebrow">Verification Code</span>
                  <div className="relative">
                    <MessageSquare className="absolute left-0 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                    <input
                      id="login-phone-code"
                      type="text"
                      inputMode="numeric"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="mt-2 w-full border-b border-border bg-transparent py-3 pl-7 text-base transition-colors focus:border-foreground focus:outline-none"
                    />
                  </div>
                </label>
              )}

              <SubmitButton loading={loading} label={phoneCodeSent ? "Verify & Sign In" : "Send Code"} />
              {phoneCodeSent && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoneCodeSent(false);
                    setOtp("");
                  }}
                  className="w-full text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
                >
                  Use another phone number
                </button>
              )}
            </form>
          )}

          <div id="login-recaptcha" />

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || !isFirebaseConfigured}
            className="mt-6 flex w-full items-center justify-center gap-3 border border-border py-3.5 text-[13px] uppercase tracking-[0.14em] transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-medium">G</span>
            Continue with Google
          </button>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            New to Maison?{" "}
            <Link to="/signup" className="link-underline font-medium text-foreground">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex w-full items-center justify-center gap-3 bg-foreground py-4 text-[13px] uppercase tracking-[0.18em] text-background transition-colors duration-500 hover:bg-accent disabled:opacity-50"
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
        </>
      )}
    </button>
  );
}
