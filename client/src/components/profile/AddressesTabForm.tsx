import { useState } from "react";
import { User as AuthUser } from "@/context/AuthContext";
import { toast } from "sonner";
import { DEFAULT_COUNTRY } from "@/lib/validation";

interface AddressesTabProps {
  user: AuthUser;
  onUpdate: (u: Partial<AuthUser>) => Promise<void>;
}

export function AddressesTabForm({ user, onUpdate }: AddressesTabProps) {
  const [form, setForm] = useState({
    street: user.address?.street ?? "",
    city: user.address?.city ?? "",
    state: user.address?.state ?? "",
    zip: user.address?.zip ?? "",
    country: user.address?.country ?? DEFAULT_COUNTRY,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdate({ address: { ...form, country: form.country || DEFAULT_COUNTRY } });
      toast.success("Address updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update address");
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-5 animate-fade-up">
      <div className="eyebrow mb-6 text-muted-foreground">Shipping Address</div>
      <label className="block">
        <span className="eyebrow text-[10px]">Street</span>
        <input 
          type="text" 
          value={form.street} 
          onChange={(e) => setForm({ ...form, street: e.target.value })} 
          className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
        />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="block">
          <span className="eyebrow text-[10px]">City</span>
          <input 
            type="text" 
            value={form.city} 
            onChange={(e) => setForm({ ...form, city: e.target.value })} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
        <label className="block">
          <span className="eyebrow text-[10px]">State</span>
          <input 
            type="text" 
            value={form.state} 
            onChange={(e) => setForm({ ...form, state: e.target.value })} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
        <label className="block">
          <span className="eyebrow text-[10px]">ZIP</span>
          <input 
            type="text" 
            value={form.zip} 
            onChange={(e) => setForm({ ...form, zip: e.target.value })} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow text-[10px]">Country</span>
        <input 
          type="text" 
          value={form.country} 
          onChange={(e) => setForm({ ...form, country: e.target.value })} 
          className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
        />
      </label>
      <button 
        type="submit" 
        className="bg-foreground text-background px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
      >
        Save Address
      </button>
    </form>
  );
}

