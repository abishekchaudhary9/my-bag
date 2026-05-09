import { useState } from "react";
import { User as AuthUser } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatNepalPhone, isValidEmail, isValidNepalPhone } from "@/lib/validation";

interface ProfileSettingsProps {
  user: AuthUser;
  onUpdate: (u: Partial<AuthUser>) => Promise<void>;
}

export function ProfileSettingsForm({ user, onUpdate }: ProfileSettingsProps) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email || "",
    phone: user.phone || "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (form.phone && !isValidNepalPhone(form.phone)) {
      toast.error("Enter a valid Nepal mobile number", {
        description: "Use 98XXXXXXXX, 97XXXXXXXX, or +97798XXXXXXXX.",
      });
      return;
    }

    try {
      await onUpdate({ ...form, phone: form.phone ? formatNepalPhone(form.phone) : "" });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-5 animate-fade-up">
      <div className="eyebrow mb-6 text-muted-foreground">Personal Information</div>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="eyebrow text-[10px]">First Name</span>
          <input 
            type="text" 
            value={form.firstName} 
            onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
        <label className="block">
          <span className="eyebrow text-[10px]">Last Name</span>
          <input 
            type="text" 
            value={form.lastName} 
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow text-[10px]">Email</span>
        <input 
          type="email" 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
        />
      </label>
      <label className="block">
        <span className="eyebrow text-[10px]">Phone</span>
        <input 
          type="tel" 
          value={form.phone} 
          onChange={(e) => setForm({ ...form, phone: e.target.value })} 
          placeholder="+977 98XXXXXXXX" 
          className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
        />
      </label>
      <button 
        type="submit" 
        className="bg-foreground text-background px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
      >
        Save Changes
      </button>
    </form>
  );
}
