import Layout from "@/components/site/Layout";
import { Truck, RotateCcw, Clock, Globe } from "lucide-react";

const SHIPPING_INFO = [
  { icon: Truck, title: "Standard Shipping", items: ["5–7 business days", "Complimentary on orders over Rs 250", "Rs 18 flat rate under Rs 250", "Tracked and insured"] },
  { icon: Clock, title: "Express Shipping", items: ["2–3 business days", "Rs 25 flat rate", "Priority handling", "Signature required"] },
  { icon: Globe, title: "International", items: ["7–14 business days", "Duties and taxes calculated at checkout", "Tracked through customs", "Available to 40+ countries"] },
];

const RETURN_STEPS = [
  { step: "01", title: "Initiate", desc: "Contact our care team or start a return from your account within 30 days." },
  { step: "02", title: "Pack", desc: "Use the original packaging or a sturdy alternative. Include the return form." },
  { step: "03", title: "Ship", desc: "Use the prepaid label we send you. Drop off at any authorized carrier location." },
  { step: "04", title: "Refund", desc: "Once inspected, your refund is processed within 3–5 business days." },
];

export default function ShippingReturns() {
  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Customer Care</div>
        <h1 className="font-display text-5xl md:text-7xl max-w-4xl leading-[1.02]">Shipping & Returns</h1>
        <p className="mt-6 text-muted-foreground max-w-xl">Everything you need to know about receiving and returning your Maison pieces.</p>
      </section>
      <section className="container-luxe pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {SHIPPING_INFO.map((s) => (
            <div key={s.title} className="border border-border p-6 hover:border-foreground/30 transition-colors">
              <s.icon className="h-6 w-6 text-accent mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-xl mb-4">{s.title}</h3>
              <ul className="space-y-2">{s.items.map((i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><span className="text-accent">—</span>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-foreground text-background">
        <div className="container-luxe py-20 md:py-28">
          <div className="flex items-center gap-3 mb-8"><RotateCcw className="h-6 w-6 text-gold" strokeWidth={1.5} /><h2 className="font-display text-3xl md:text-5xl">Returns Process</h2></div>
          <div className="grid md:grid-cols-4 gap-8">
            {RETURN_STEPS.map((s) => (
              <div key={s.step}>
                <div className="font-display text-4xl text-gold/60 mb-3">{s.step}</div>
                <h3 className="font-display text-xl mb-2">{s.title}</h3>
                <p className="text-background/70 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-luxe py-20 max-w-2xl mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
        <h3 className="eyebrow text-foreground">Return Policy Details</h3>
        <p>Items must be returned in original condition, unworn and with all tags attached. Sale items are final sale. Personalized or monogrammed items cannot be returned.</p>
        <p>Original shipping costs are non-refundable. If your item arrives damaged or defective, we'll cover return shipping and offer a full refund or exchange.</p>
        <p>For exchanges, please return the original item and place a new order. This ensures the fastest turnaround time.</p>
      </section>
    </Layout>
  );
}
