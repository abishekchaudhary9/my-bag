import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { categories, products } from "@/data/products";
import heroBag from "@/assets/hero-bag.jpg";

const Index = () => {
  const featured = products.slice(0, 4);
  const editorial = products.slice(2, 5);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative bg-gradient-warm">
        <div className="container-luxe grid lg:grid-cols-12 gap-10 lg:gap-16 pt-12 md:pt-20 pb-20 lg:pb-32 items-end">
          <div className="lg:col-span-6 animate-fade-up">
            <div className="eyebrow mb-6">Autumn Collection · MMXXVI</div>
            <h1 className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] text-balance">
              Bags made to be{" "}
              <em className="text-accent not-italic font-light italic">carried</em>,
              <br />
              kept, and passed on.
            </h1>
            <p className="mt-8 max-w-md text-base text-muted-foreground leading-relaxed">
              A house of leather goods, designed in Florence and finished by hand. Quiet shapes,
              honest materials, built to outlive trend.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500"
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
              <Link to="/journal" className="text-[13px] uppercase tracking-[0.18em] link-underline">
                Our Story
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative animate-scale-in">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary shadow-lift">
              <img
                src={heroBag}
                alt="The Atelier backpack in cognac leather"
                width={1600}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="bg-background/85 backdrop-blur-md px-5 py-3">
                  <div className="eyebrow">No. 014</div>
                  <div className="font-display text-lg mt-0.5">The Voyager</div>
                </div>
                <Link
                  to="/product/voyager-backpack"
                  className="bg-foreground text-background h-12 w-12 grid place-items-center hover:bg-accent transition-colors"
                  aria-label="Shop the Voyager"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
            <div className="hidden md:flex absolute -left-8 top-8 -rotate-90 origin-left eyebrow text-foreground/60">
              Maison · Florence
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-luxe py-20 md:py-28">
        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            <div className="eyebrow mb-3">The House</div>
            <h2 className="font-display text-3xl md:text-5xl">Shop by category</h2>
          </div>
          <Link to="/shop" className="text-[13px] uppercase tracking-[0.18em] link-underline hidden md:inline-block">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.slice(0, 4).map((cat, i) => {
            const product = products.find((p) => p.category === cat.id);
            if (!product) return null;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group relative aspect-[3/4] overflow-hidden bg-secondary animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img
                  src={product.colors[0].image}
                  alt={cat.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-background">
                  <div className="font-display text-2xl">{cat.label}</div>
                  <div className="text-xs uppercase tracking-[0.18em] opacity-80 mt-1">{cat.blurb}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-luxe py-12 md:py-20">
        <div className="flex items-end justify-between mb-12 gap-6">
          <div>
            <div className="eyebrow mb-3">Atelier Selects</div>
            <h2 className="font-display text-3xl md:text-5xl">New this season</h2>
          </div>
          <Link to="/shop" className="text-[13px] uppercase tracking-[0.18em] link-underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="bg-foreground text-background mt-20 md:mt-32">
        <div className="container-luxe py-20 md:py-32 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-5 text-background/60">Craftsmanship</div>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.02]">
              Eight artisans.
              <br />
              <em className="font-light italic text-gold">Forty-two hours.</em>
              <br />
              One bag.
            </h2>
            <p className="mt-8 text-background/75 leading-relaxed max-w-md">
              Each Maison piece is shaped by hand in our Florentine atelier — from the first
              skiving of the leather to the final burnish of the brass.
            </p>
            <Link to="/journal" className="mt-10 inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.18em] text-gold link-underline">
              Inside the atelier <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="lg:col-span-7 grid grid-cols-3 gap-3 md:gap-4">
            {editorial.map((p, i) => (
              <div
                key={p.id}
                className={`aspect-[3/4] overflow-hidden bg-background/10 ${i === 1 ? "translate-y-8 md:translate-y-12" : ""}`}
              >
                <img
                  src={p.colors[0].image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover hover:scale-[1.04] transition-transform duration-700 ease-luxe"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-luxe py-24 md:py-32 text-center">
        <div className="eyebrow mb-5">The Letter</div>
        <h2 className="font-display text-4xl md:text-6xl max-w-3xl mx-auto text-balance leading-[1.05]">
          New arrivals, atelier stories, and quiet invitations.
        </h2>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-12 max-w-md mx-auto flex border-b border-foreground/30 focus-within:border-foreground transition-colors"
        >
          <input
            type="email"
            required
            placeholder="your@email.com"
            className="flex-1 bg-transparent py-4 px-1 text-base placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <button className="text-[13px] uppercase tracking-[0.18em] hover:text-accent transition-colors">
            Subscribe
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default Index;
