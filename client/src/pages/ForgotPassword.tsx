import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";
import Layout from "@/components/site/Layout";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      toast.success("Reset link sent", { description: "Check your inbox for instructions." });
    }, 800);
  };

  return (
    <Layout>
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-md mx-auto animate-fade-up">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground link-underline mb-10">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Sign In
          </Link>

          {!sent ? (
            <>
              <div className="text-center mb-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-secondary grid place-items-center mb-6">
                  <Mail className="h-7 w-7 text-accent" strokeWidth={1.5} />
                </div>
                <h1 className="font-display text-4xl md:text-5xl">Reset Password</h1>
                <p className="mt-4 text-muted-foreground text-sm max-w-sm mx-auto">
                  Enter the email associated with your Maison account. We'll send a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <label className="block">
                  <span className="eyebrow">Email Address</span>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors"
                  />
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
                      Send Reset Link
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center animate-fade-up">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 grid place-items-center mb-8">
                <Mail className="h-9 w-9 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h1 className="font-display text-4xl md:text-5xl">Check Your Inbox</h1>
              <p className="mt-4 text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>. It may take a minute to arrive.
              </p>
              <div className="mt-8 p-4 bg-secondary/60 text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="link-underline text-foreground">try again</button>.
              </div>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] link-underline"
              >
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
