import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { toggleWish, isWished } = useStore();
  const { state: authState, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [color, setColor] = useState(product.colors[0]);
  const wished = isWished(product.id);

  const handleWishToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!authState.isAuthenticated) {
      toast.info("Sign in required", { description: "Please sign in to save items." });
      navigate("/login");
      return;
    }
    if (isAdmin) {
      toast.error("Admin accounts cannot use wishlist");
      return;
    }
    toggleWish(product);
  };

  return (
    <article
      className="group relative animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
          {product.colors.map((c) => (
            <img
              key={c.name}
              src={c.image}
              alt={`${product.name} in ${c.name}`}
              loading="lazy"
              width={900}
              height={1100}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-luxe ${
                c.name === color.name ? "opacity-100" : "opacity-0"
              } group-hover:scale-[1.03] transition-transform`}
              style={{ transitionProperty: "opacity, transform" }}
            />
          ))}
          {(product.isNew || product.isBestseller || product.compareAt) && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNew && <Tag>New</Tag>}
              {product.isBestseller && <Tag>Bestseller</Tag>}
              {product.compareAt && <Tag tone="accent">Sale</Tag>}
            </div>
          )}
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleWishToggle}
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/80 backdrop-blur-sm hover:bg-background transition"
          >
            <Heart
              className={`h-4 w-4 transition ${wished ? "fill-accent text-accent" : "text-foreground"}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={`/product/${product.slug}`} className="link-underline text-[15px] block truncate">
            {product.name}
          </Link>
          <div className="eyebrow mt-1 capitalize">{product.category}</div>
        </div>
        <div className="text-right whitespace-nowrap">
          <div className="text-[15px]">Rs {product.price}</div>
          {product.compareAt && (
            <div className="text-xs text-muted-foreground line-through">Rs {product.compareAt}</div>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        {product.colors.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            onClick={() => setColor(c)}
            className={`h-3.5 w-3.5 rounded-full border transition ${
              c.name === color.name ? "ring-1 ring-offset-2 ring-offset-background ring-foreground" : "border-border"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </article>
  );
}

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" }) {
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.18em] px-2 py-1 ${
        tone === "accent" ? "bg-accent text-accent-foreground" : "bg-background/85 text-foreground"
      }`}
    >
      {children}
    </span>
  );
}
