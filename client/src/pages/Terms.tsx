import Layout from "@/components/layouts/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Legal</div>
        <h1 className="font-display text-5xl md:text-7xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: May 1, 2026</p>
      </section>
      <section className="container-luxe pb-24 max-w-2xl mx-auto prose-luxe space-y-8 text-sm text-foreground/85 leading-relaxed">
        <div><h2 className="font-display text-xl mb-3">1. Acceptance of Terms</h2><p>By accessing and using Maison's website and services in Nepal, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p></div>
        <div><h2 className="font-display text-xl mb-3">2. Products & Pricing</h2><p>All prices are in NPR (Nepalese Rupees) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time. Prices include applicable taxes unless stated otherwise.</p></div>
        <div><h2 className="font-display text-xl mb-3">3. Orders & Payment</h2><p>By placing an order, you warrant that you are legally capable of entering into binding contracts. We accept local digital wallets including Khalti and eSewa, as well as Cash on Delivery. Your account will be charged upon order confirmation.</p></div>
        <div><h2 className="font-display text-xl mb-3">4. Shipping & Delivery</h2><p>Shipping times are estimates and not guaranteed. Local delivery across Nepal is handled by our premium logistics partners. Risk of loss transfers to you upon delivery to the carrier.</p></div>
        <div><h2 className="font-display text-xl mb-3">5. Returns & Refunds</h2><p>Returns are accepted within 30 days of delivery. Items must be in original, unworn condition with all tags attached. Sale items are final sale. See our Returns page for complete details.</p></div>
        <div><h2 className="font-display text-xl mb-3">6. Intellectual Property</h2><p>All content on this website — including images, text, logos, and designs — is the property of Maison Atelier Nepal and is protected by intellectual property laws. Unauthorized use is prohibited.</p></div>
        <div><h2 className="font-display text-xl mb-3">7. Limitation of Liability</h2><p>Maison shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the purchase price of the product.</p></div>
        <div><h2 className="font-display text-xl mb-3">8. Governing Law</h2><p>These terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes shall be resolved in the competent courts of Kathmandu, Nepal.</p></div>
      </section>
    </Layout>
  );
}

