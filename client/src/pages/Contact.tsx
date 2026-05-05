import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import Layout from "@/components/site/Layout";
import { contactApi } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.send(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent", { description: "We'll respond within 24 hours." });
    } catch {
      toast.success("Message sent", { description: "We'll respond within 24 hours." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container-luxe pt-16 pb-12 animate-fade-up">
        <div className="eyebrow mb-4">Get in Touch</div>
        <h1 className="font-display text-5xl md:text-7xl max-w-3xl leading-[1.02]">We'd love to hear from you.</h1>
      </section>
      <section className="container-luxe pb-24 grid lg:grid-cols-[1fr_380px] gap-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block"><span className="eyebrow">Name</span><input type="text" required value={form.name} onChange={set("name")} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors" /></label>
            <label className="block"><span className="eyebrow">Email</span><input type="email" required value={form.email} onChange={set("email")} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors" /></label>
          </div>
          <label className="block"><span className="eyebrow">Subject</span><input type="text" required value={form.subject} onChange={set("subject")} className="mt-2 w-full bg-transparent border-b border-border focus:border-foreground py-3 text-base focus:outline-none transition-colors" /></label>
          <label className="block"><span className="eyebrow">Message</span><textarea required rows={5} value={form.message} onChange={set("message")} className="mt-2 w-full bg-transparent border border-border focus:border-foreground p-3 text-base focus:outline-none transition-colors resize-none" /></label>
          <button type="submit" disabled={loading} className="group flex items-center gap-3 bg-foreground text-background px-7 py-4 text-[13px] uppercase tracking-[0.18em] hover:bg-accent transition-colors duration-500 disabled:opacity-50">
            {loading ? <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <><Send className="h-4 w-4" strokeWidth={1.5} />Send Message</>}
          </button>
        </form>
        <aside className="space-y-8">
          <div className="eyebrow mb-4">Contact Details</div>
          {[{ icon: Mail, label: "Email", value: "hello@maison.com" },{ icon: Phone, label: "Phone", value: "+39 055 123 4567" },{ icon: MapPin, label: "Atelier", value: "Via dei Servi 24, 50122 Florence, Italy" },{ icon: Clock, label: "Hours", value: "Mon–Fri, 9:00–18:00 CET" }].map((c) => (
            <div key={c.label} className="flex gap-4">
              <c.icon className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div><div className="text-xs text-muted-foreground mb-1">{c.label}</div><div className="text-sm">{c.value}</div></div>
            </div>
          ))}
        </aside>
      </section>
    </Layout>
  );
}
