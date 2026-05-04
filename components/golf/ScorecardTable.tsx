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
  const rowGridStyle = {
    gridTemplateColumns: `minmax(42px, 0.95fr) repeat(${holes.length}, minmax(0, 1fr))`,
  };

  return (
    <section className="w-full max-w-full overflow-hidden rounded-sm border border-border/60 bg-white/95 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-5">
      <header className="mb-3 flex min-w-0 items-center justify-between gap-3 sm:mb-4">
        <h2 className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-xs sm:tracking-[0.18em]">
          {title}
        </h2>
        <span className="shrink-0 font-serif text-2xl leading-none text-emerald-600 sm:text-3xl">{parTotal}</span>
      </header>

      <div className="w-full max-w-full space-y-2 overflow-hidden">
        <div className="grid w-full items-center gap-x-0.5 text-center sm:gap-x-1" style={rowGridStyle}>
          <span className="min-w-0 truncate text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-[0.12em]">
            {labels?.hole ?? "Hole"}
          </span>
          {holes.map((hole) => (
            <span key={`hole-${hole.holeNumber}`} className="min-w-0 text-[11px] font-semibold text-muted-foreground sm:text-xs">
              {hole.holeNumber}
            </span>
          ))}
        </div>

        <div className="grid w-full items-center gap-x-0.5 text-center sm:gap-x-1" style={rowGridStyle}>
          <span className="min-w-0 truncate text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-[0.12em]">
            {labels?.par ?? "Par"}
          </span>
          {holes.map((hole) => (
            <span key={`par-${hole.holeNumber}`} className="min-w-0 text-sm font-semibold text-foreground/90 sm:text-base">
              {hole.par}
            </span>
          ))}
        </div>

        <div className="grid w-full items-center gap-x-0.5 text-center sm:gap-x-1" style={rowGridStyle}>
          <span className="min-w-0 truncate text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-[0.12em]">
            {labels?.score ?? "Score"}
          </span>
          {holes.map((hole) => {
            const score = scores[hole.holeNumber];
            return (
              <span
                key={`score-${hole.holeNumber}`}
                className={`min-w-0 text-sm font-semibold sm:text-base ${scoreTone(score ?? null, hole.par)}`}
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
