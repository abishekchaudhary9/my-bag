import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-secondary/40">
      <div className="container-luxe py-20 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-2xl">MAISON<span className="text-accent">.</span></div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            A house of bags, designed in Florence. Made to be carried, kept, and passed on.
          </p>
        </div>
        <FooterCol title="Shop" links={[
          ["Handbags", "/shop?category=handbags"],
          ["Backpacks", "/shop?category=backpacks"],
          ["Travel", "/shop?category=travel"],
          ["Office", "/shop?category=office"],
        ]} />
        <FooterCol title="House" links={[
          ["Our Story", "/about"],
          ["Journal", "/journal"],
          ["Size Guide", "/size-guide"],
          ["FAQ", "/faq"],
        ]} />
        <FooterCol title="Care" links={[
          ["Contact", "/contact"],
          ["Shipping & Returns", "/shipping-returns"],
          ["My Account", "/profile"],
          ["Order Tracking", "/orders"],
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Maison Atelier. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow mb-5">{title}</div>
      <ul className="space-y-2.5">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-foreground/80 hover:text-accent link-underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}