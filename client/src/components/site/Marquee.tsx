const items = [
  "Complimentary shipping on orders over Rs 250",
  "Lifetime repair program",
  "Hand-finished in Florence",
  "30-day returns, no questions",
];

export default function Marquee() {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className="bg-foreground text-background overflow-hidden py-2.5 text-[11px] uppercase tracking-[0.22em]">
      <div className="flex marquee whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="mx-8 opacity-90">
            {t} <span className="mx-8 opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}