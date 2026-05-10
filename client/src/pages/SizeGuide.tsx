import Layout from "@/components/layouts/Layout";

const SIZES = [
  { name: "Small", dims: "30 × 22 × 12 cm", fits: "Phone, wallet, keys, lipstick", best: "Evening outings, minimal carry" },
  { name: "Medium", dims: "38 × 28 × 14 cm", fits: "Tablet, book, water bottle, daily essentials", best: "Everyday carry, work-to-dinner" },
  { name: "Large", dims: "44 × 34 × 16 cm", fits: "15\" laptop, documents, gym gear", best: "Work, travel, weekend trips" },
  { name: "One Size", dims: "Varies by product", fits: "See individual product pages", best: "Backpacks, crossbodies" },
  { name: "Carry-On", dims: "55 × 35 × 23 cm", fits: "IATA compliant, 3–5 day wardrobe", best: "Air travel" },
  { name: "Check-In", dims: "75 × 50 × 30 cm", fits: "7–10 day wardrobe, gifts", best: "Extended travel" },
];

export default function SizeGuide() {
  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Reference</div>
        <h1 className="font-display text-5xl md:text-7xl">Size Guide</h1>
        <p className="mt-6 text-muted-foreground max-w-xl">Find the perfect size for your needs. All dimensions are measured externally.</p>
      </section>
      <section className="container-luxe pb-24">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground text-left">
                <th className="pb-4 text-xs uppercase tracking-wider font-medium">Size</th>
                <th className="pb-4 text-xs uppercase tracking-wider font-medium">Dimensions (W × H × D)</th>
                <th className="pb-4 text-xs uppercase tracking-wider font-medium">What It Fits</th>
                <th className="pb-4 text-xs uppercase tracking-wider font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s.name} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-4 font-display text-lg">{s.name}</td>
                  <td className="py-4 text-muted-foreground">{s.dims}</td>
                  <td className="py-4 text-muted-foreground">{s.fits}</td>
                  <td className="py-4 text-muted-foreground">{s.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-16 max-w-2xl space-y-6">
          <h2 className="font-display text-2xl">How to Measure</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[{ label: "Width", desc: "Measure across the widest point of the bag, left to right." }, { label: "Height", desc: "Measure from the base to the top of the bag (excluding handles)." }, { label: "Depth", desc: "Measure the base from front to back at its widest point." }].map((m) => (
              <div key={m.label} className="p-4 bg-secondary/40">
                <div className="eyebrow mb-2">{m.label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

