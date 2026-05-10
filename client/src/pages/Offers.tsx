import { useState, useEffect } from "react";
import { Tag, Copy, Check, ChevronDown, ChevronUp, Info } from "lucide-react";
import Layout from "@/components/layouts/Layout";
import { couponsApi } from "@/lib/api";
import { toast } from "sonner";

export default function Offers() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { coupons } = await couponsApi.list();
        setCoupons(coupons);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied to clipboard!`);
  };

  return (
    <Layout>
      <section className="container-luxe py-24 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <div className="eyebrow mb-4">Exclusive Benefits</div>
            <h1 className="font-display text-5xl md:text-6xl mb-6">Maison Offers</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Discover our latest promotions and exclusive discounts. Apply these codes at checkout to elevate your collection.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-secondary/20 animate-pulse border border-border" />
              ))}
            </div>
          ) : coupons.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {coupons.map((c, i) => (
                <div 
                  key={c.code} 
                  className="group relative border border-border bg-background hover:border-foreground transition-all duration-500 p-8 flex flex-col animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 bg-accent/10 text-accent rounded-full grid place-items-center">
                      <Tag className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <div className="text-3xl font-display">{c.pct}% OFF</div>
                  </div>

                  <h3 className="font-display text-xl mb-2">{c.description}</h3>
                  
                  <div className="mt-auto pt-8">
                    <div className="flex items-center justify-between bg-secondary/50 border border-dashed border-border p-3 mb-4">
                      <code className="font-mono text-sm font-bold tracking-widest">{c.code}</code>
                      <button 
                        onClick={() => copyToClipboard(c.code)}
                        className="text-accent hover:text-foreground transition-colors p-1"
                        title="Copy Code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Info className="h-3 w-3" />
                      {expanded === i ? "Hide Terms" : "View Terms & Conditions"}
                      {expanded === i ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {expanded === i && (
                      <div className="mt-4 pt-4 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed animate-fade-down">
                        {c.terms}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-border">
              <p className="text-muted-foreground italic">No active offers at the moment. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

