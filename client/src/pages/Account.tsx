import Layout from "@/components/layouts/Layout";

export default function Account() {
  return (
    <Layout>
      <section className="container-luxe py-20 max-w-md mx-auto text-center">
        <div className="eyebrow mb-3">The House</div>
        <h1 className="font-display text-4xl md:text-5xl">Sign in</h1>
        <p className="mt-4 text-muted-foreground">Access orders, addresses, and saved pieces.</p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-10 space-y-5 text-left">
          <Field label="Email" type="email" />
          <Field label="Password" type="password" />
          <button className="w-full bg-foreground text-background py-3.5 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">
            Continue
          </button>
        </form>
        <div className="mt-6 text-xs text-muted-foreground">
          New to Maison? <span className="link-underline text-foreground cursor-pointer">Create an account</span>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, type }: { label: string; type: string }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-2.5 text-base focus:outline-none transition-colors"
      />
    </label>
  );
}
