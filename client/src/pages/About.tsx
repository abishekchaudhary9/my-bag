import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/layouts/Layout";
import heroBag from "@/assets/hero-bag.jpg";

const VALUES = [
  { title: "Honest Materials", desc: "Every hide is sourced from family-run tanneries in Tuscany, tanned slowly with vegetable dyes." },
  { title: "Built to Last", desc: "Our pieces are engineered for decades of use — then repaired, not replaced." },
  { title: "Eight Artisans", desc: "Each bag passes through eight pairs of expert hands before it reaches yours." },
  { title: "Carbon Neutral", desc: "We offset every gram of CO₂ from production to doorstep, and publish our numbers annually." },
];

export default function About() {
  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Our Story</div>
        <h1 className="font-display text-5xl md:text-7xl max-w-4xl leading-[1.02]">
          A house of bags, designed in Florence.
        </h1>
      </section>
      <section className="container-luxe pb-16">
        <div className="aspect-[21/9] bg-secondary overflow-hidden"><img src={heroBag} alt="Maison atelier" className="h-full w-full object-cover" /></div>
      </section>
      <section className="container-luxe pb-20 max-w-2xl mx-auto space-y-6 text-foreground/85 leading-relaxed">
        <p className="font-display text-2xl text-foreground">We started Maison with one conviction: a bag should outlive the season it was made for.</p>
        <p>Founded in 2018 in a small workshop on Via dei Servi in Florence, Maison began as a partnership between two friends — a leather craftsman and a product designer — united by a shared impatience with disposable fashion.</p>
        <p>Every piece begins the same way: a single hide, chosen at our tannery in Tuscany, cut by hand by an artisan who has been doing this work for thirty years. From there it passes through eight pairs of hands before it reaches yours.</p>
        <p>We don't believe in seasons. We believe in objects you keep — that soften, deepen, and grow more beautiful with use. We believe in repair over replacement, and in lifetimes instead of trends.</p>
      </section>
      <section className="bg-foreground text-background">
        <div className="container-luxe py-20 md:py-28">
          <div className="eyebrow mb-5 text-background/60">What We Stand For</div>
          <div className="grid md:grid-cols-2 gap-8">
            {VALUES.map((v, i) => (
              <div key={i} className="border-l-2 border-accent pl-6 py-2">
                <h3 className="font-display text-xl mb-2">{v.title}</h3>
                <p className="text-background/70 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-luxe py-20 text-center">
        <h2 className="font-display text-3xl md:text-5xl mb-6">Ready to carry something exceptional?</h2>
        <Link to="/shop" className="group inline-flex items-center gap-3 bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500">
          Shop the Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </section>
    </Layout>
  );
}

