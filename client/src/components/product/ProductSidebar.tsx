import { Link } from "react-router-dom";
import { Heart, Minus, Plus, Star, Truck, RotateCcw, Shield } from "lucide-react";

type ProductSidebarProps = {
  product: any;
  color: { name: string; hex: string; image: string } | null;
  size: string;
  qty: number;
  setSize: (size: string) => void;
  setQty: (value: number) => void;
  onSelectColor: (color: { name: string; hex: string; image: string }) => void;
  canUseWishlist: boolean;
  isWished: (id: string) => boolean;
  toggleWish: (product: any) => void;
  addToCart: () => void;
  isAdmin: boolean;
  authState: any;
};

export default function ProductSidebar({
  product,
  color,
  size,
  qty,
  setSize,
  setQty,
  onSelectColor,
  canUseWishlist,
  isWished,
  toggleWish,
  addToCart,
  isAdmin,
  authState,
}: ProductSidebarProps) {
  return (
    <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start space-y-10">
      <div className="space-y-4">
        <div className="eyebrow">{product.category} · Handcrafted</div>
        <h1 className="font-display text-3xl md:text-6xl tracking-tighter leading-[0.95]">{product.name}</h1>
        <p className="text-xl text-muted-foreground font-light italic opacity-80">{product.tagline}</p>
      </div>

      <div className="flex items-center gap-6 pb-6 border-b border-border/50">
        <div className="text-3xl font-medium tracking-tight">Rs {product.price}</div>
        {product.compareAt && <div className="text-lg text-muted-foreground line-through opacity-50">Rs {product.compareAt}</div>}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex text-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-current" : ""}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{product.reviews} Reviews</span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Color: <span className="text-accent">{color?.name}</span></div>
          <div className="flex gap-4">
            {(product.colors || []).map((c: any) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelectColor(c)}
                className={`h-10 w-10 rounded-full border-2 transition-all ${color?.name === c.name ? "border-accent scale-110" : "border-transparent hover:scale-105"}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Quantity</div>
            <div className="text-[10px] text-muted-foreground">{qty}</div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="h-12 w-12 rounded-full border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center justify-center"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="h-12 w-12 rounded-full border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center justify-center"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Size</div>
              <button className="text-[9px] font-bold uppercase tracking-widest link-underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: string) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${size === s ? "bg-foreground text-background" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          {!isAdmin ? (
            <>
              <button
                onClick={addToCart}
                className="flex-1 bg-foreground text-background h-16 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500 flex items-center justify-center gap-4 group"
              >
                Add to Bag
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              </button>
              {canUseWishlist && (
                <button
                  onClick={() => toggleWish(product)}
                  className={`h-16 w-16 glass flex items-center justify-center transition-all ${isWished(product.id) ? "text-accent" : "hover:text-accent"}`}
                >
                  <Heart className={`h-5 w-5 ${isWished(product.id) ? "fill-current" : ""}`} />
                </button>
              )}
            </>
          ) : (
            <Link
              to="/admin?tab=products"
              className="flex-1 bg-secondary text-foreground h-16 text-[11px] font-bold uppercase tracking-[0.3em] border border-border flex items-center justify-center gap-4 hover:bg-secondary/80 transition-all"
            >
              Management: Edit in Admin Panel
              <Shield className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
        <div className="flex items-center gap-4 p-4 glass">
          <Truck className="h-5 w-5 text-accent" strokeWidth={1} />
          <div className="text-[9px] font-bold uppercase tracking-widest">Free Shipping</div>
        </div>
        <div className="flex items-center gap-4 p-4 glass">
          <RotateCcw className="h-5 w-5 text-accent" strokeWidth={1} />
          <div className="text-[9px] font-bold uppercase tracking-widest">Heritage Guarantee</div>
        </div>
      </div>
    </div>
  );
}
