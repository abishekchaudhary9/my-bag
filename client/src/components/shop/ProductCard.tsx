import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { resolveAssetUrl } from "@/lib/api";

/* VERSION 777 - CLEAN REWRITE */

interface ProductCardProps {
  product: any;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, toggleWish, isWished } = useStore();
  const { state: authState, isAdmin } = useAuth();
  const [color, setColor] = useState(product.colors?.[0] || { name: "Default", hex: "#000000", image: "" });
  const [isHovered, setIsHovered] = useState(false);

  const wished = isWished(product.id);
  const canUseWishlist = authState.isAuthenticated && !isAdmin;

  const handleWishToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWish(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, { color: color.name, size: product.sizes?.[0] || "Universal", qty: 1 });
    toast.success("Added to bag", {
      description: `${product.name} — ${color.name}`,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary">
        {(product.colors || []).map((c) => (
          <img
            key={c.name}
            src={resolveAssetUrl(c.image)}
            alt={`${product.name} in ${c.name}`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-luxe ${
              c.name === color.name ? "opacity-100 scale-100" : "opacity-0 scale-110"
            } ${isHovered ? "scale-105" : "scale-100"}`}
          />
        ))}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && <span className="bg-background/90 backdrop-blur px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold">New</span>}
          {product.isBestseller && <span className="bg-accent text-background px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold">Bestseller</span>}
        </div>

        {canUseWishlist && (
          <button
            onClick={handleWishToggle}
            className={`absolute top-4 right-4 h-10 w-10 glass rounded-full flex items-center justify-center transition-all duration-500 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ${
              wished ? "text-accent" : "text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} strokeWidth={1.5} />
          </button>
        )}

        {!isAdmin && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-4 left-4 right-4 h-12 glass text-foreground flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-foreground hover:text-background"
          >
            <Plus className="h-4 w-4" /> Quick Add
          </button>
        )}
      </Link>

      <div className="mt-5 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <Link to={`/product/${product.slug}`} className="text-sm font-medium tracking-tight block hover:text-accent transition-colors">
              {product.name}
            </Link>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.category}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">Rs {product.price}</div>
            {product.compareAt && (
              <div className="text-[10px] text-muted-foreground line-through decoration-accent/50">Rs {product.compareAt}</div>
            )}
          </div>
        </div>
        
        <div className="flex gap-1.5 pt-1">
          {product.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c)}
              className={`h-3.5 w-3.5 rounded-full border transition ${
                c.name === color.name ? "ring-1 ring-offset-2 ring-offset-background ring-foreground" : "border-border"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    </motion.article>
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
