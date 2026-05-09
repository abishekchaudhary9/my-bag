import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Layout from "@/components/site/Layout";
import ProductCard from "@/components/shop/ProductCard"; // v1.0.1
import { categories, products } from "@/data/products";
import heroBag from "@/assets/hero-bag.jpg";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const container = useRef(null);
  const featured = products.slice(0, 4);
  const editorial = products.slice(2, 5);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [1000, 3000], [-100, 100]);

  useGSAP(() => {
    // Parallax effect for hero image
    gsap.to(".hero-image", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Staggered reveal for section titles
    gsap.utils.toArray(".reveal-text").forEach((text: any) => {
      gsap.from(text, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: text,
          start: "top 85%",
        },
      });
    });
  }, { scope: container });

  return (
    <div ref={container}>
      <Layout>
        {/* HERO */}
        <section className="relative bg-gradient-warm hero-section">
          <div className="container-luxe grid lg:grid-cols-12 gap-10 lg:gap-16 pt-12 md:pt-20 pb-20 lg:pb-32 items-end overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-6"
          >
            <div className="eyebrow mb-6 text-accent tracking-[0.25em]">Autumn Collection · MMXXVI</div>
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.9] text-balance tracking-tight">
              Bags made to be{" "}
              <em className="text-gold font-light italic">carried</em>,
              <br />
              kept, and passed on.
            </h1>
            <p className="mt-8 max-w-md text-base text-muted-foreground leading-relaxed font-light">
              A house of leather goods, designed in Florence and finished by hand. Quiet shapes,
              honest materials, built to outlive trend.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Link
                to="/shop"
                className="group relative inline-flex items-center gap-4 overflow-hidden border border-foreground bg-foreground px-8 py-4 text-[13px] uppercase tracking-[0.2em] text-background transition-all duration-700 hover:bg-transparent hover:text-foreground"
              >
                <span className="relative z-10">Shop the Collection</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-2" strokeWidth={1} />
                <div className="absolute inset-0 z-0 h-full w-full translate-y-full bg-accent transition-transform duration-700 ease-in-out group-hover:translate-y-0" />
              </Link>
              <Link to="/journal" className="text-[13px] uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-accent link-underline">
                Our Story
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 1.3, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.6, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary shadow-lift">
              <img
                src={heroBag}
                alt="The Atelier backpack in cognac leather"
                width={1600}
                height={1280}
                className="h-full w-full object-cover hero-image"
              />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-10">
                <div className="bg-background/90 backdrop-blur-xl border border-white/20 px-6 py-4 shadow-2xl transition-transform duration-500 hover:-translate-y-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold mb-1">No. 014</div>
                  <div className="font-display text-xl mt-0.5 tracking-tight">The Voyager</div>
                </div>
                <Link
                  to="/product/voyager-backpack"
                  className="bg-background text-foreground h-14 w-14 rounded-full grid place-items-center shadow-2xl hover:bg-accent hover:text-white transition-all duration-500 group"
                  aria-label="Shop the Voyager"
                >
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.2} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* CATEGORIES - BENTO GRID */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container-luxe py-24 md:py-32"
      >
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4 reveal-text">Collections</div>
            <h2 className="font-display text-4xl md:text-6xl reveal-text leading-tight">Curated for the modern nomad.</h2>
          </div>
          <Link to="/shop" className="text-[12px] font-bold uppercase tracking-[0.2em] link-underline">
            Explore All Pieces
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[1000px] md:h-[700px]">
          {/* Big Item */}
          <motion.div 
            whileHover={{ scale: 0.99 }}
            className="md:col-span-8 relative overflow-hidden group bento-item"
          >
            <img 
              src={products.find(p => p.category === 'handbags')?.colors[0].image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Handbags"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
              <div className="eyebrow text-white/80 mb-2">Signature Series</div>
              <h3 className="font-display text-4xl mb-4">Handbags</h3>
              <Link to="/shop?category=handbags" className="inline-block py-3 px-8 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
                View Collection
              </Link>
            </div>
          </motion.div>

          {/* Small Top */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-4 relative overflow-hidden group bento-item"
          >
            <img 
              src={products.find(p => p.category === 'backpacks')?.colors[0].image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Backpacks"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
              <div className="eyebrow text-white/90 mb-2">The Atelier</div>
              <h3 className="font-display text-3xl mb-4">Backpacks</h3>
              <Link to="/shop?category=backpacks" className="text-[10px] font-bold uppercase tracking-widest link-underline after:bg-white">
                Discover
              </Link>
            </div>
          </motion.div>

          {/* Small Bottom Left */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-4 relative overflow-hidden group bento-item"
          >
            <img 
              src={products.find(p => p.category === 'travel')?.colors[0].image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Travel"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="font-display text-2xl mb-1">Travel</h3>
              <Link to="/shop?category=travel" className="text-[9px] font-bold uppercase tracking-tighter opacity-80 hover:opacity-100 transition-opacity">
                Shop Travel →
              </Link>
            </div>
          </motion.div>

          {/* Small Bottom Right */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-4 relative overflow-hidden group bento-item"
          >
            <img 
              src={products.find(p => p.category === 'office')?.colors[0].image} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Office"
            />
            <div className="absolute inset-0 flex items-end p-8">
               <div className="glass p-6 w-full text-center">
                  <h3 className="font-display text-xl mb-1">The Office</h3>
                  <Link to="/shop?category=office" className="text-[9px] font-bold uppercase tracking-widest text-accent">View All</Link>
               </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FEATURED SELECTION */}
      <section className="bg-secondary/20 py-24 md:py-32">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="eyebrow mb-4">New Arrivals</div>
              <h2 className="font-display text-4xl md:text-5xl">The Autumn Edit</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY - CINEMATIC SECTION */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 -z-10"
        >
          <img 
            src="https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80" 
            className="w-full h-[120%] object-cover brightness-50"
            alt="Philosophy"
          />
        </motion.div>
        <div className="container-luxe text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="eyebrow text-white/60 mb-6">Our Philosophy</div>
            <h2 className="font-display text-5xl md:text-8xl mb-8 leading-tight tracking-tighter">
              Crafted for life, not for a <span className="text-accent">season</span>.
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
              We believe in the quiet power of honest materials and timeless design. Every stitch is a commitment to longevity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container-luxe py-32 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow mb-6">Maison Journal</div>
          <h2 className="font-display text-4xl md:text-6xl mb-12">Quiet invitations, delivered to your inbox.</h2>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-secondary/30 border-none px-6 py-4 text-sm focus:ring-1 focus:ring-accent outline-none"
            />
            <button className="bg-foreground text-background px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-accent transition-colors">
              Subscribe
            </button>
          </form>
          <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest">
            By subscribing, you agree to our Privacy Policy.
          </p>
        </div>
      </motion.section>
    </Layout>
    </div>
  );
};

export default Index;
