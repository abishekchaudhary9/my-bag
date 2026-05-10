import Layout from "@/components/layouts/Layout";
import heroBag from "@/assets/hero-bag.jpg";

export default function Journal() {
  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">The Journal</div>
        <h1 className="font-display text-5xl md:text-7xl max-w-4xl leading-[1.02]">
          Notes from the atelier — on leather, time, and the long carry.
        </h1>
      </section>
      <section className="container-luxe pb-24">
        <div className="aspect-[16/9] bg-secondary overflow-hidden">
          <img src={heroBag} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-2xl mx-auto mt-12 prose-luxe text-foreground/85 leading-relaxed space-y-6">
          <p className="font-display text-2xl text-foreground">
            We started Maison with a single idea: a bag should outlive the season it was made for.
          </p>
          <p>
            Every piece begins in the same way — a single hide, chosen at our tannery in Tuscany,
            cut by hand by an artisan who has been doing this work for thirty years. From there it
            passes through eight pairs of hands before it reaches yours.
          </p>
          <p>
            We don't believe in seasons. We believe in objects you keep — that soften, deepen, and
            grow more beautiful with use. We believe in repair over replacement, and in lifetimes
            instead of trends.
          </p>
        </div>
      </section>
    </Layout>
  );
}
