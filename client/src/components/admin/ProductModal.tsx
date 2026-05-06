import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { resolveAssetUrl, uploadsApi } from "@/lib/api";

type ColorEntry = { name: string; hex: string; image: string };

type ProductForm = {
  slug: string; name: string; tagline: string; category: string;
  price: number; compareAt: number; stock: number; material: string;
  description: string; isNew: boolean; isBestseller: boolean;
  colors: ColorEntry[];
};

const empty: ProductForm = {
  slug: "", name: "", tagline: "", category: "totes",
  price: 0, compareAt: 0, stock: 0, material: "",
  description: "", isNew: false, isBestseller: false,
  colors: [{ name: "", hex: "#000000", image: "" }],
};

export default function ProductModal({
  product, onClose, onSave,
}: {
  product?: any; onClose: () => void;
  onSave: (data: ProductForm) => Promise<void>;
}) {
  const [form, setForm] = useState<ProductForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingColor, setUploadingColor] = useState<number | null>(null);
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        slug: product.slug || "", name: product.name || "",
        tagline: product.tagline || "", category: product.category || "totes",
        price: product.price || 0, compareAt: product.compareAt || 0,
        stock: product.stock || 0, material: product.material || "",
        description: product.description || "",
        isNew: product.isNew || false, isBestseller: product.isBestseller || false,
        colors: product.colors && product.colors.length > 0
          ? product.colors.map((c: any) => ({ name: c.name, hex: c.hex, image: c.image || "" }))
          : [{ name: "", hex: "#000000", image: "" }],
      });
    }
  }, [product]);

  const set = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked
      : e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const updateColor = (idx: number, field: keyof ColorEntry, value: string) => {
    const updated = [...form.colors];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, colors: updated });
  };

  const addColor = () => {
    setForm({ ...form, colors: [...form.colors, { name: "", hex: "#000000", image: "" }] });
  };

  const removeColor = (idx: number) => {
    if (form.colors.length <= 1) return;
    setForm({ ...form, colors: form.colors.filter((_, i) => i !== idx) });
  };

  const uploadColorImage = async (idx: number, file?: File) => {
    if (!file) return;
    setUploadingColor(idx);
    try {
      const { image } = await uploadsApi.image(file);
      updateColor(idx, "image", image.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingColor(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); } catch {} finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border p-6 md:p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="eyebrow">Name *</span>
              <input required value={form.name} onChange={set("name")} className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
            </label>
            <label className="block">
              <span className="eyebrow">Slug *</span>
              <input required value={form.slug} onChange={set("slug")} placeholder="leather-tote" className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
            </label>
          </div>
          <label className="block">
            <span className="eyebrow">Tagline</span>
            <input value={form.tagline} onChange={set("tagline")} className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="eyebrow">Category *</span>
              <select value={form.category} onChange={set("category")} className="mt-1 w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none">
                <option value="totes">Totes</option>
                <option value="crossbody">Crossbody</option>
                <option value="backpacks">Backpacks</option>
                <option value="travel">Travel</option>
                <option value="office">Office</option>
                <option value="handbags">Handbags</option>
                <option value="fashion">Fashion</option>
                <option value="college">College</option>
              </select>
            </label>
            <label className="block">
              <span className="eyebrow">Price *</span>
              <input type="number" required min={0} value={form.price} onChange={set("price")} className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
            </label>
            <label className="block">
              <span className="eyebrow">Compare At</span>
              <input type="number" min={0} value={form.compareAt} onChange={set("compareAt")} className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="eyebrow">Stock *</span>
              <input type="number" required min={0} value={form.stock} onChange={set("stock")} className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
            </label>
            <label className="block">
              <span className="eyebrow">Material</span>
              <input value={form.material} onChange={set("material")} className="mt-1 w-full bg-transparent border-b border-border focus:border-foreground py-2 text-sm focus:outline-none" />
            </label>
          </div>
          <label className="block">
            <span className="eyebrow">Description</span>
            <textarea rows={3} value={form.description} onChange={set("description")} className="mt-1 w-full bg-transparent border border-border focus:border-foreground p-2 text-sm focus:outline-none resize-none" />
          </label>

          {/* ─── Colors / Images ─── */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">Product Colors & Images</span>
              <button type="button" onClick={addColor} className="flex items-center gap-1 text-xs text-accent hover:underline">
                <Plus className="h-3 w-3" /> Add Color
              </button>
            </div>
            <div className="space-y-3">
              {form.colors.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-secondary/30 border border-border/50">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={c.name} onChange={(e) => updateColor(idx, "name", e.target.value)} placeholder="Color name (e.g. Onyx)"
                        className="bg-transparent border-b border-border focus:border-foreground py-1.5 text-xs focus:outline-none" />
                      <div className="flex items-center gap-2">
                        <input type="color" value={c.hex} onChange={(e) => updateColor(idx, "hex", e.target.value)}
                          className="h-7 w-7 border-0 bg-transparent cursor-pointer" />
                        <input value={c.hex} onChange={(e) => updateColor(idx, "hex", e.target.value)}
                          className="flex-1 bg-transparent border-b border-border focus:border-foreground py-1.5 text-xs focus:outline-none font-mono" />
                      </div>
                    </div>
                    <input value={c.image} onChange={(e) => updateColor(idx, "image", e.target.value)}
                      placeholder="Image URL (e.g. /images/my-bag.jpg or https://...)"
                      className="w-full bg-transparent border-b border-border focus:border-foreground py-1.5 text-xs focus:outline-none" />
                    <label className="inline-flex cursor-pointer items-center border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] hover:border-foreground transition-colors">
                      {uploadingColor === idx ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingColor !== null}
                        onChange={(e) => uploadColorImage(idx, e.target.files?.[0])}
                        className="sr-only"
                      />
                    </label>
                    {c.image && (
                      <div className="h-16 w-16 bg-secondary overflow-hidden mt-1 border border-border/50">
                        <img key={c.image} src={resolveAssetUrl(c.image)} alt="preview" className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.src = ""; e.currentTarget.alt = "✗"; e.currentTarget.className = "h-full w-full grid place-items-center text-xs text-muted-foreground"; }} />
                      </div>
                    )}
                  </div>
                  {form.colors.length > 1 && (
                    <button type="button" onClick={() => removeColor(idx)} className="p-1 text-destructive hover:bg-destructive/10 mt-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isNew} onChange={set("isNew")} className="accent-accent" /> New
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isBestseller} onChange={set("isBestseller")} className="accent-accent" /> Bestseller
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="flex-1 bg-foreground text-background py-3 text-[12px] uppercase tracking-[0.16em] hover:bg-accent transition-colors disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-border text-[12px] uppercase tracking-[0.16em] hover:border-foreground transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
