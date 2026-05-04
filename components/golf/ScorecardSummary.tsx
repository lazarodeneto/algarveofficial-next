import { formatVsParLabel, type GolfRoundHole } from "@/lib/golf/round-shared";

interface ScorecardSummaryProps {
  holes: GolfRoundHole[];
  scores: Record<number, number>;
  labels?: {
    frontNine?: string;
    backNine?: string;
    holesRange?: string;
    diff?: string;
    total?: string;
  };
}

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

export default function ScorecardSummary({ holes, scores, labels }: ScorecardSummaryProps) {
  const groups = Array.from({ length: Math.ceil(holes.length / 9) }, (_, index) =>
    holes.slice(index * 9, index * 9 + 9),
  ).filter((group) => group.length > 0);

  // Keep summary stable with scorecard "dash" rows by defaulting display totals to par.
  const groupSummaries = groups.map((group, index) => {
    const score = sum(group.map((hole) => scores[hole.holeNumber] ?? hole.par));
    const par = sum(group.map((hole) => hole.par));
    const firstHole = group[0]?.holeNumber ?? index * 9 + 1;
    const lastHole = group[group.length - 1]?.holeNumber ?? firstHole;
    const label =
      index === 0
        ? labels?.frontNine ?? "Front 9"
        : index === 1
          ? labels?.backNine ?? "Back 9"
          : (labels?.holesRange ?? "Holes {{start}}-{{end}}")
              .replace("{{start}}", String(firstHole))
              .replace("{{end}}", String(lastHole));

    return {
      label,
      score,
      vsPar: score - par,
    };
  });

  const totalScore = sum(groupSummaries.map((group) => group.score));

  const totalPar = sum(holes.map((hole) => hole.par));
  const totalVsPar = totalScore - totalPar;

  return (
    <section className="w-full max-w-full overflow-hidden rounded-sm border border-border/60 bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="grid grid-cols-2 gap-4 text-center sm:gap-6 md:grid-cols-4">
        {groupSummaries.map((group) => (
          <div key={group.label} className="min-w-0">
            <p className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
              {group.label}
            </p>
            <p className="mt-2 font-serif text-4xl leading-none text-foreground sm:text-5xl">{group.score}</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">
              {formatVsParLabel(group.vsPar)}
            </p>
          </div>
        ))}

        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
            {labels?.diff ?? "Diff"}
          </p>
          <p className="mt-2 font-serif text-4xl leading-none text-emerald-600 sm:text-5xl">
            {formatVsParLabel(totalVsPar)}
          </p>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
            {labels?.total ?? "Total"}
          </p>
          <div className="mt-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#C7A35A] to-[#D4AF37] text-3xl font-semibold leading-none text-black sm:h-20 sm:w-20 sm:text-4xl">
            {totalScore}
          </div>
        </div>
      </div>
    </section>
  );
}
