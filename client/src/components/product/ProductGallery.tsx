import { AnimatePresence, motion } from "framer-motion";
import { resolveAssetUrl } from "@/lib/api";

type ProductGalleryProps = {
  product: any;
  color: { name: string; hex: string; image: string } | null;
  onSelectColor: (color: { name: string; hex: string; image: string }) => void;
};

export default function ProductGallery({ product, color, onSelectColor }: ProductGalleryProps) {
  return (
    <div className="space-y-6">
      <div className="relative aspect-[4/5] bg-secondary overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={color?.name ?? "default"}
            src={resolveAssetUrl(color?.image)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
            alt={product.name}
          />
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {(product.colors || []).map((c: any) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelectColor(c)}
            className={`aspect-square overflow-hidden bg-secondary border-2 transition-all duration-500 ${color?.name === c.name ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"}`}
          >
            <img src={resolveAssetUrl(c.image)} className="w-full h-full object-cover" alt={c.name} />
          </button>
        ))}
      </div>
    </div>
  );
}
