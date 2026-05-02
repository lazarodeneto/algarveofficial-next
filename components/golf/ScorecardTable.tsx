import type { GolfRoundHole } from "@/lib/golf/round-shared";

interface ScorecardTableProps {
  title: string;
  holes: GolfRoundHole[];
  scores: Record<number, number>;
  labels?: {
    hole?: string;
    par?: string;
    score?: string;
  };
}

function scoreTone(score: number | null, par: number) {
  if (typeof score !== "number") return "text-muted-foreground";
  const delta = score - par;
  if (delta < 0) return "text-emerald-600";
  if (delta > 0) return "text-rose-600";
  return "text-foreground";
}

export default function ScorecardTable({ title, holes, scores, labels }: ScorecardTableProps) {
  const parTotal = holes.reduce((sum, hole) => sum + hole.par, 0);

  return (
    <section className="rounded-sm border border-border/60 bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
        <span className="font-serif text-3xl leading-none text-emerald-600">{parTotal}</span>
      </header>

      <div className="space-y-2 overflow-x-auto">
        <div className="grid min-w-[620px] grid-cols-[68px_repeat(9,minmax(0,1fr))] items-center gap-x-1 text-center">
          <span className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {labels?.hole ?? "Hole"}
          </span>
          {holes.map((hole) => (
            <span key={`hole-${hole.holeNumber}`} className="text-xs font-semibold text-muted-foreground">
              {hole.holeNumber}
            </span>
          ))}
        </div>

        <div className="grid min-w-[620px] grid-cols-[68px_repeat(9,minmax(0,1fr))] items-center gap-x-1 text-center">
          <span className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {labels?.par ?? "Par"}
          </span>
          {holes.map((hole) => (
            <span key={`par-${hole.holeNumber}`} className="font-semibold text-foreground/90">
              {hole.par}
            </span>
          ))}
        </div>

        <div className="grid min-w-[620px] grid-cols-[68px_repeat(9,minmax(0,1fr))] items-center gap-x-1 text-center">
          <span className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {labels?.score ?? "Score"}
          </span>
          {holes.map((hole) => {
            const score = scores[hole.holeNumber];
            return (
              <span
                key={`score-${hole.holeNumber}`}
                className={`font-semibold ${scoreTone(score ?? null, hole.par)}`}
              >
                {score ?? "—"}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
