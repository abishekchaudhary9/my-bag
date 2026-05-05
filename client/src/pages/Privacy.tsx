import Layout from "@/components/site/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Legal</div>
        <h1 className="font-display text-5xl md:text-7xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: May 1, 2026</p>
      </section>
      <section className="container-luxe pb-24 max-w-2xl mx-auto prose-luxe space-y-8 text-sm text-foreground/85 leading-relaxed">
        <div><h2 className="font-display text-xl mb-3">1. Information We Collect</h2><p>We collect information you provide directly — name, email, shipping address, payment details — as well as automatically collected data such as IP address, browser type, and browsing behavior on our site.</p></div>
        <div><h2 className="font-display text-xl mb-3">2. How We Use Your Information</h2><p>We use your data to process orders, personalize your experience, send order updates, and improve our services. We never sell your personal information to third parties.</p></div>
        <div><h2 className="font-display text-xl mb-3">3. Data Security</h2><p>All transactions are encrypted with 256-bit SSL. Payment processing is handled by Stripe, which is PCI-DSS Level 1 certified. We do not store complete credit card numbers on our servers.</p></div>
        <div><h2 className="font-display text-xl mb-3">4. Cookies</h2><p>We use essential cookies to maintain your session and remember your preferences. Analytics cookies help us understand how visitors interact with our site. You can manage cookie preferences in your browser settings.</p></div>
        <div><h2 className="font-display text-xl mb-3">5. Your Rights</h2><p>You have the right to access, correct, or delete your personal data. Contact us at privacy@maison.com to exercise these rights. We respond to all requests within 30 days.</p></div>
        <div><h2 className="font-display text-xl mb-3">6. Data Retention</h2><p>We retain personal data for as long as your account is active or as needed to provide services. Order data is retained for 7 years for tax and legal compliance.</p></div>
        <div><h2 className="font-display text-xl mb-3">7. Contact</h2><p>For privacy-related inquiries, contact our Data Protection Officer at privacy@maison.com or write to: Maison Atelier, Via dei Servi 24, 50122 Florence, Italy.</p></div>
      </section>
    </Layout>
  );
}
