import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Check, Phone, MapPin, Building, Hash, MessageSquare } from "lucide-react";
import Layout from "@/components/layouts/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { isValidEmail } from "@/lib/validation";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function Signup() {
  const { signup, sendPhoneSignupCode, confirmPhoneSignup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [step, setStep] = useState(1);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last names are required.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await sendPhoneSignupCode(form.phone, {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone
    }, "signup-recaptcha");
    setLoading(false);

    if (result.success) {
      setPhoneCodeSent(true);
      toast.success("Verification code sent");
    } else {
      setError(result.error ?? "Failed to send code");
    }
  };

  const handleConfirmPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await confirmPhoneSignup(otp);
    setLoading(false);

    if (result.success) {
      toast.success("Welcome to Maison", { description: "Your account is ready." });
      navigate("/profile");
    } else {
      setError(result.error ?? "Invalid code");
    }
  };

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-md mx-auto animate-fade-up">
          <div className="text-center mb-8">
            <div className="eyebrow mb-4">Step {mode === "email" ? step : (phoneCodeSent ? 2 : 1)} of 2</div>
            <h1 className="font-display text-4xl md:text-5xl">
              Create Account
            </h1>
          </div>

          <div className="mb-10 flex border-b border-border">
            <button
              type="button"
              onClick={() => { setMode("email"); setStep(1); setPhoneCodeSent(false); }}
              className={`flex-1 pb-4 text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                mode === "email" ? "border-b-2 border-foreground text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Email Setup
            </button>
            <button
              type="button"
              onClick={() => { setMode("phone"); setPhoneCodeSent(false); }}
              className={`flex-1 pb-4 text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                mode === "phone" ? "border-b-2 border-accent text-accent font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Phone className="h-3 w-3" strokeWidth={2} />
                Instant Phone
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}

          {mode === "email" ? (
            <>
              {step === 1 ? (
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleNext(); }}
                  className="space-y-6 animate-fade-in"
                >
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
                        autoComplete="new-password"
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
                    <div className="space-y-1.5">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(form.password);
                        return (
                          <div key={rule.label} className={`flex items-center gap-2 text-[10px] uppercase tracking-wider ${passed ? "text-emerald-600" : "text-muted-foreground"}`}>
                            <Check className={`h-2.5 w-2.5 ${passed ? "opacity-100" : "opacity-30"}`} strokeWidth={3} />
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
                    type="submit"
                    className="group w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-6 animate-fade-in">
                  <label className="block">
                    <span className="eyebrow">Phone Number</span>
                    <div className="relative">
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 mt-1 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
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
            </>
          ) : (
            <form onSubmit={phoneCodeSent ? handleConfirmPhoneCode : handleSendPhoneCode} className="space-y-6 animate-fade-in">
              {!phoneCodeSent ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="eyebrow">First Name</span>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={set("firstName")}
                        placeholder="John"
                        className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-3 text-base focus:outline-none transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Last Name</span>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={set("lastName")}
                        placeholder="Doe"
                        className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-3 text-base focus:outline-none transition-colors"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="eyebrow">Mobile Number</span>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 mt-1 -translate-y-1/2 text-sm font-medium text-muted-foreground">+977</span>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={set("phone")}
                        placeholder="98XXXXXXXX"
                        className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-3 pl-10 text-base focus:outline-none transition-colors"
                      />
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-accent"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree to the Terms & Privacy Policy.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify with SMS OTP
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                      </>
                    )}
                  </button>
                  <div id="signup-recaptcha" />
                </>
              ) : (
                <div className="space-y-6">
                  <div className="bg-secondary/30 p-5 border border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">Verification code sent to</p>
                    <p className="text-sm font-medium mt-1">+977 {form.phone}</p>
                  </div>

                  <label className="block">
                    <span className="eyebrow">Verification Code</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="0 0 0 0 0 0"
                      className="mt-2 w-full border-b border-border bg-transparent py-3 text-2xl text-center tracking-[0.5em] font-display focus:border-accent focus:outline-none transition-colors"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-foreground text-background py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                      "Confirm & Create Account"
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPhoneCodeSent(false)}
                    className="w-full text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Use different number
                  </button>
                </div>
              )}

              <div className="pt-4 flex justify-center">
                <a 
                  href="https://wa.me/9779800000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 fill-emerald-600/10" strokeWidth={2} />
                  Signup help? Chat on WhatsApp
                </a>
              </div>
            </form>
          )}

          <div className="mt-8 text-center px-4">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By continuing, you agree to Maison's{" "}
              <Link to="/terms" className="text-foreground hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>.
            </p>
          </div>

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

