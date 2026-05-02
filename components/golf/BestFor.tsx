import { Check } from "lucide-react";

interface BestForProps {
  title: string;
  items: string[];
}

export function BestFor({ title, items }: BestForProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <div className="rounded-2xl border border-border/70 p-5 shadow-sm">
        <h2 className="font-serif text-2xl font-medium text-foreground">{title}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Check className="h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
