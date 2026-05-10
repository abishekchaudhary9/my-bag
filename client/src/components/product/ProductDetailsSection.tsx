import { CheckCircle2 } from "lucide-react";

export default function ProductDetailsSection({ product }: { product: any }) {
  return (
    <section className="bg-secondary/10 py-24 md:py-32">
      <div className="container-luxe grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div className="eyebrow">The Details</div>
          <h2 className="font-display text-4xl md:text-6xl leading-tight">Masterfully shaped in our Florentine atelier.</h2>
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed font-light text-lg">
              Every Maison piece is a testament to the quiet power of honest materials and meticulous craftsmanship.
            </p>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-6">
              {product.details?.slice(0, 4).map((detail: string, index: number) => (
                <li key={index} className="flex items-center gap-4">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <img
            src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80"
            className="w-full h-full object-cover"
            alt="Craftsmanship"
          />
        </div>
      </div>
    </section>
  );
}
