import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/validation";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const passwordValid = PASSWORD_RULES.every((r) => r.test(form.password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordValid) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms & Conditions.");
      return;
    }
    setLoading(true);
    try {
      const result = await signup({
        email: form.email,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      });
      if (result.success) {
        toast.success("Welcome to Maison", { description: "Your account has been created. Please check your email to verify your account." });
        navigate("/profile");
      } else {
        setError(result.error ?? "Something went wrong");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-md mx-auto animate-fade-up">
          <div className="text-center mb-12">
            <div className="eyebrow mb-4">Join the House</div>
            <h1 className="font-display text-4xl md:text-5xl">Create Account</h1>
            <p className="mt-4 text-muted-foreground text-sm">
              Become part of our community. Track orders, save pieces, and receive exclusive invitations.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow">First Name</span>
                <input
                  id="signup-first-name"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="Chiara"
                  className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors"
                />
              </label>
              <label className="block">
                <span className="eyebrow">Last Name</span>
                <input
                  id="signup-last-name"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Rosetti"
                  className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors"
                />
              </label>
            </div>

            <label className="block">
              <span className="eyebrow">Email Address</span>
              <input
                id="signup-email"
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="your@email.com"
                className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Password</span>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 mt-1 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </div>
            </label>

            {/* Password strength indicators */}
            {form.password.length > 0 && (
              <div className="space-y-1.5 animate-fade-in">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passed ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      <Check className={`h-3 w-3 transition-opacity ${passed ? "opacity-100" : "opacity-30"}`} strokeWidth={2} />
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            )}

            <label className="block">
              <span className="eyebrow">Confirm Password</span>
              <input
                id="signup-confirm-password"
                type="password"
                required
                value={form.confirm}
                onChange={set("confirm")}
                placeholder="••••••••"
                className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors"
              />
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-accent"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="link-underline text-foreground">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="link-underline text-foreground">Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="link-underline text-foreground font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}
