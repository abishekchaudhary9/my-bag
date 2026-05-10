import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary/20 border-t border-border/50">
      <div className="container-luxe pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          <div className="lg:col-span-4 space-y-8">
            <div className="font-display text-3xl tracking-tighter">MAISON</div>
            <p className="text-muted-foreground font-light leading-relaxed max-w-sm">
              An independent design house founded on the principles of honest materials, meticulous craftsmanship, and timeless silhouette.
            </p>
            <div className="flex gap-6">
              <SocialLink icon={<Instagram className="h-5 w-5" />} href="#" />
              <SocialLink icon={<Twitter className="h-5 w-5" />} href="#" />
              <SocialLink icon={<Facebook className="h-5 w-5" />} href="#" />
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
            <FooterCol
              title="Collections"
              links={[
                ["Handbags", "/shop?category=handbags"],
                ["Backpacks", "/shop?category=backpacks"],
                ["Travel", "/shop?category=travel"],
                ["Accessories", "/shop"],
              ]}
            />
            <FooterCol
              title="The House"
              links={[
                ["Our Story", "/about"],
                ["The Journal", "/journal"],
                ["Atelier Service", "/contact"],
                ["Sustainability", "/about"],
              ]}
            />
            <FooterCol
              title="Support"
              links={[
                ["Track Your Order", "/track"],
                ["Shipping & Returns", "/shipping-returns"],
                ["Size Guide", "/size-guide"],
                ["Contact Us", "/contact"],
                ["Privacy Policy", "/privacy"],
              ]}
            />
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            © {new Date().getFullYear()} Maison Atelier · Handcrafted in Florence
          </div>
          <div className="flex items-center gap-10">
            <div className="flex gap-6">
              <Link to="/terms" className="text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">
                Privacy
              </Link>
            </div>
            <div className="scale-90 origin-right">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="space-y-6">
      <div className="eyebrow text-accent">{title}</div>
      <ul className="space-y-4">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-foreground/70 hover:text-foreground transition-all">
              {label}
              <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a href={href} className="h-10 w-10 glass flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all">
      {icon}
    </a>
  );
}

