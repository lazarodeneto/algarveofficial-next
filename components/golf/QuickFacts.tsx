import { Badge } from "@/components/ui/badge";

interface QuickFactsLabels {
  access: string;
  difficulty: string;
  bestFor: string;
  priceRange: string;
  public: string;
  private: string;
  golfers: string;
  casual: string;
  confident: string;
  championship: string;
}

interface QuickFactsProps {
  accessType?: string | null;
  difficulty?: string | null;
  courseType?: string | null;
  priceRange?: string | null;
  labels: QuickFactsLabels;
}

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAccess(value: string | null | undefined, labels: QuickFactsLabels) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "public") return labels.public;
  if (normalized === "private") return labels.private;
  return value ? humanize(value) : null;
}

function deriveBestFor(difficulty: string | null | undefined, labels: QuickFactsLabels) {
  const normalized = difficulty?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "low" || normalized === "easy") return labels.casual;
  if (normalized === "high" || normalized === "advanced") return labels.championship;
  return labels.confident;
}

function formatPriceRange(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "low") return "€";
  if (normalized === "medium") return "€€";
  if (normalized === "high") return "€€€";
  if (normalized === "luxury") return "€€€€";
  return value ? humanize(value) : null;
}

export function QuickFacts({
  accessType,
  difficulty,
  courseType,
  priceRange,
  labels,
}: QuickFactsProps) {
  const facts = [
    { key: "access", value: formatAccess(accessType, labels), tone: "dark" },
    { key: "difficulty", value: difficulty ? humanize(difficulty) : null, tone: "warm" },
    { key: "bestFor", value: deriveBestFor(difficulty, labels), tone: "neutral" },
    { key: "courseType", value: courseType ? humanize(courseType) : null, tone: "neutral" },
    { key: "price", value: formatPriceRange(priceRange), tone: "warm" },
  ].filter((fact): fact is { key: string; value: string; tone: string } => Boolean(fact.value));

  if (facts.length === 0) return null;

  return (
    <section className="mx-auto flex max-w-6xl flex-wrap gap-2 py-12">
      {facts.map((fact) => (
        <Badge
          key={fact.key}
          className={
            fact.tone === "dark"
              ? "rounded-full bg-slate-950 px-3 py-1 text-sm text-white hover:bg-slate-950"
              : fact.tone === "warm"
                ? "rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 hover:bg-amber-100"
                : "rounded-full bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted"
          }
        >
          {fact.value}
        </Badge>
      ))}
    </section>
  );
}
