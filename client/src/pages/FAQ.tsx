import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Layout from "@/components/layouts/Layout";

const FAQ_DATA = [
  { cat: "Orders & Shipping", items: [
    { q: "How long does shipping take?", a: "Standard shipping takes 5–7 business days. Express delivery arrives within 2–3 business days. International orders typically take 7–14 business days." },
    { q: "Do you offer free shipping?", a: "Yes — all orders over Rs 250 ship free within Nepal. Express and international shipping rates vary." },
    { q: "Can I track my order?", a: "Absolutely. You'll receive a tracking number via email as soon as your order ships. You can also check your order status in your account dashboard." },
    { q: "Do you ship internationally?", a: "Yes, we ship to over 40 countries. Duties and taxes are calculated and collected at checkout for a seamless delivery experience." },
  ]},
  { cat: "Returns & Exchanges", items: [
    { q: "What is your return policy?", a: "We accept returns within 30 days of delivery. Items must be in original condition with tags attached. Sale items are final sale." },
    { q: "How do I start a return?", a: "You can initiate a return from your account dashboard or by contacting our care team at hello@maison.com. We'll send you a prepaid return label." },
    { q: "How long do refunds take?", a: "Once we receive and inspect your return, refunds are processed within 3–5 business days to your original payment method." },
  ]},
  { cat: "Product & Care", items: [
    { q: "What materials do you use?", a: "We use full-grain Italian leather, vegetable-tanned hides, British waxed canvas, and aerospace-grade polycarbonate — each chosen for beauty and longevity." },
    { q: "How should I care for my bag?", a: "Store in the included dust bag. Wipe with a soft damp cloth. Apply leather conditioner every 6 months. Avoid direct sunlight and extreme heat." },
    { q: "Do you offer repairs?", a: "Yes — every Maison piece comes with our lifetime repair program. We'll repair stitching, hardware, and leather damage at no charge." },
  ]},
  { cat: "Account & Security", items: [
    { q: "Is my payment information secure?", a: "All transactions are encrypted with 256-bit SSL. We never store your full card details — all payment processing is handled by Stripe." },
    { q: "How do I reset my password?", a: "Click 'Forgot password' on the sign-in page. Enter your email and we'll send you a secure reset link." },
    { q: "Can I delete my account?", a: "Yes. Contact our care team and we'll permanently delete your account and all associated data within 48 hours." },
  ]},
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<string | null>(null);
  const toggle = (id: string) => setOpenIdx(openIdx === id ? null : id);

  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Support</div>
        <h1 className="font-display text-5xl md:text-7xl">Frequently Asked Questions</h1>
        <p className="mt-6 text-muted-foreground max-w-xl">Find answers to common questions about orders, shipping, returns, and product care.</p>
      </section>
      <section className="container-luxe pb-24 max-w-3xl">
        {FAQ_DATA.map((cat) => (
          <div key={cat.cat} className="mb-10">
            <div className="eyebrow mb-5">{cat.cat}</div>
            <div className="space-y-0">
              {cat.items.map((item) => {
                const id = `${cat.cat}-${item.q}`;
                const isOpen = openIdx === id;
                return (
                  <div key={id} className="border-b border-border">
                    <button onClick={() => toggle(id)} className="w-full flex items-center justify-between py-5 text-left group">
                      <span className="text-sm font-medium group-hover:text-accent transition-colors pr-4">{item.q}</span>
                      <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-40 pb-5" : "max-h-0"}`}>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}

