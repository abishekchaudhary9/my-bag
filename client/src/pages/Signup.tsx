import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Check, Phone, MapPin, Building, Hash } from "lucide-react";
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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    confirm: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    country: "Nepal"
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const passwordValid = PASSWORD_RULES.every((r) => r.test(form.password));

  const handleNext = () => {
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
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
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
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        zip: form.zip.trim(),
        country: form.country
      });

      if (result.success) {
        toast.success("Account created!", { 
          description: "We've sent a verification code to your email." 
        });
        navigate("/verify");
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
            <div className="eyebrow mb-4">Step {step} of 2</div>
            <h1 className="font-display text-4xl md:text-5xl">
              {step === 1 ? "Create Account" : "Tell us more"}
            </h1>
            <p className="mt-4 text-muted-foreground text-sm">
              {step === 1 
                ? "Become part of our community. Track orders, save pieces, and receive exclusive invitations."
                : "Help us ensure your pieces arrive safely by providing your contact and delivery details."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="eyebrow">First Name</span>
                  <input
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
                  type="password"
                  required
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="••••••••"
                  className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors"
                />
              </label>

              <button
                type="button"
                onClick={handleNext}
                className="group w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
              >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block">
                <span className="eyebrow">Phone Number</span>
                <div className="relative">
                  <Phone className="absolute left-0 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="98XXXXXXXX"
                    className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 pl-8 text-base focus:outline-none transition-colors"
                  />
                </div>
              </label>

              <label className="block">
                <span className="eyebrow">Street Address</span>
                <div className="relative">
                  <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <input
                    type="text"
                    required
                    value={form.street}
                    onChange={set("street")}
                    placeholder="123 Luxury Ave"
                    className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 pl-8 text-base focus:outline-none transition-colors"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="eyebrow">City</span>
                  <div className="relative">
                    <Building className="absolute left-0 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={set("city")}
                      placeholder="Kathmandu"
                      className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 pl-8 text-base focus:outline-none transition-colors"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="eyebrow">Postal Code</span>
                  <div className="relative">
                    <Hash className="absolute left-0 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    <input
                      type="text"
                      required
                      value={form.zip}
                      onChange={set("zip")}
                      placeholder="44600"
                      className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 pl-8 text-base focus:outline-none transition-colors"
                    />
                  </div>
                </label>
              </div>

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

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-border py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-muted/30 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    "Complete Setup"
                  )}
                </button>
              </div>
            </form>
          )}

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
