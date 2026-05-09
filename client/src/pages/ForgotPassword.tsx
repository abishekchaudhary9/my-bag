import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Mail, MessageSquare, Phone } from "lucide-react";
import Layout from "@/components/site/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

type ResetMode = "email" | "phone";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function ForgotPassword() {
  const { sendPasswordReset, sendPhonePasswordResetCode, confirmPhonePasswordReset } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ResetMode>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordValid = PASSWORD_RULES.every((rule) => rule.test(newPassword));

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await sendPasswordReset(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
      toast.success("Reset link sent", { description: "Check your inbox for instructions." });
    } else {
      setError(result.error ?? "Could not send reset link.");
    }
  };

  const handlePhoneSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidNepalPhone(phone)) {
      setError("Enter a valid Nepal mobile number.");
      return;
    }

    setLoading(true);
    const result = await sendPhonePasswordResetCode(phone, "reset-recaptcha");
    setLoading(false);

    if (result.success) {
      setPhoneCodeSent(true);
      toast.success("Verification code sent", { description: formatNepalPhone(phone) });
    } else {
      setError(result.error ?? "Could not send verification code.");
    }
  };

  const handlePhoneReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError("Password does not meet the requirements.");
      return;
    }

    setLoading(true);
    const result = await confirmPhonePasswordReset(otp, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success("Password updated", { description: "Your phone number has been verified." });
      navigate("/profile");
    } else {
      setError(result.error ?? "Could not reset password with this phone number.");
    }
  };

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="mx-auto max-w-md animate-fade-up">
          <Link to="/login" className="link-underline mb-10 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Sign In
          </Link>

          {!sent ? (
            <>
              <div className="mb-10 text-center">
                <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-secondary">
                  {mode === "email" ? (
                    <Mail className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  ) : (
                    <Phone className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  )}
                </div>
                <h1 className="font-display text-4xl md:text-5xl">Reset Password</h1>
                <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
                  Reset by email link or verify your phone number with a Firebase code.
                </p>
              </div>

              <div className="mb-8 grid grid-cols-2 border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("email");
                    setError("");
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors ${
                    mode === "email" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("phone");
                    setError("");
                  }}
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
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2 w-full border-b border-border bg-transparent py-3 text-base transition-colors focus:border-foreground focus:outline-none"
                    />
                  </label>

                  <SubmitButton loading={loading} label="Send Reset Link" />
                </form>
              ) : (
                <form onSubmit={phoneCodeSent ? handlePhoneReset : handlePhoneSend} className="space-y-6">
                  <label className="block">
                    <span className="eyebrow">Phone Number</span>
                    <input
                      id="forgot-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="+977 98XXXXXXXX"
                      className="mt-2 w-full border-b border-border bg-transparent py-3 text-base transition-colors focus:border-foreground focus:outline-none"
                    />
                  </label>

                  {phoneCodeSent && (
                    <div className="space-y-6 animate-fade-in">
                      <label className="block">
                        <span className="eyebrow">Verification Code</span>
                        <div className="relative">
                          <MessageSquare className="absolute left-0 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                          <input
                            id="forgot-phone-code"
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

                      <label className="block">
                        <span className="eyebrow">New Password</span>
                        <input
                          id="forgot-new-password"
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          autoComplete="new-password"
                          placeholder="Password"
                          className="mt-2 w-full border-b border-border bg-transparent py-3 text-base transition-colors focus:border-foreground focus:outline-none"
                        />
                      </label>

                      {newPassword.length > 0 && (
                        <div className="space-y-1.5">
                          {PASSWORD_RULES.map((rule) => {
                            const passed = rule.test(newPassword);
                            return (
                              <div key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? "text-emerald-600" : "text-muted-foreground"}`}>
                                <Check className={`h-3 w-3 ${passed ? "opacity-100" : "opacity-30"}`} strokeWidth={2} />
                                {rule.label}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <SubmitButton loading={loading} label={phoneCodeSent ? "Verify & Reset" : "Send Code"} />
                </form>
              )}

              <div className="pt-6 flex justify-center">
                <a 
                  href="https://wa.me/9779800000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 fill-emerald-600/10" strokeWidth={2} />
                  Reset help? Chat on WhatsApp
                </a>
              </div>

              <div id="reset-recaptcha" />
            </>
          ) : (
            <div className="text-center animate-fade-up">
              <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10">
                <Mail className="h-9 w-9 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h1 className="font-display text-4xl md:text-5xl">Check Your Inbox</h1>
              <p className="mx-auto mt-4 max-w-sm leading-relaxed text-muted-foreground">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>.
              </p>
              <div className="mt-8 bg-secondary/60 p-4 text-xs text-muted-foreground">
                Did not receive the email? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="link-underline text-foreground">try again</button>.
              </div>
              <Link to="/login" className="link-underline mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em]">
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Back to Sign In
              </Link>
            </div>
          )}
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
