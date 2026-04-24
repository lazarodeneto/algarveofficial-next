import { formatVsParLabel, type GolfRoundHole } from "@/lib/golf/round-shared";

interface ScorecardSummaryProps {
  holes: GolfRoundHole[];
  scores: Record<number, number>;
}

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

export default function ScorecardSummary({ holes, scores }: ScorecardSummaryProps) {
  const frontNine = holes.slice(0, 9);
  const backNine = holes.slice(9, 18);

  // Keep summary stable with scorecard "dash" rows by defaulting display totals to par.
  const frontTotal = sum(frontNine.map((hole) => scores[hole.holeNumber] ?? hole.par));
  const backTotal = sum(backNine.map((hole) => scores[hole.holeNumber] ?? hole.par));
  const totalScore = frontTotal + backTotal;

  const frontParTotal = sum(frontNine.map((hole) => hole.par));
  const backParTotal = sum(backNine.map((hole) => hole.par));
  const totalPar = sum(holes.map((hole) => hole.par));
  const frontVsPar = frontTotal - frontParTotal;
  const backVsPar = backTotal - backParTotal;
  const totalVsPar = totalScore - totalPar;

  return (
    <section className="rounded-3xl border border-border/60 bg-white/95 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Front 9</p>
          <p className="mt-2 font-serif text-5xl leading-none text-foreground">{frontTotal}</p>
          <p className="mt-1 text-sm font-semibold text-emerald-600">
            {formatVsParLabel(frontVsPar)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Back 9</p>
          <p className="mt-2 font-serif text-5xl leading-none text-foreground">{backTotal}</p>
          <p className="mt-1 text-sm font-semibold text-emerald-600">
            {formatVsParLabel(backVsPar)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Diff</p>
          <p className="mt-2 font-serif text-5xl leading-none text-emerald-600">
            {formatVsParLabel(totalVsPar)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total</p>
          <div className="mt-2 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#C7A35A] to-[#D4AF37] text-4xl font-semibold leading-none text-black">
            {totalScore}
          </div>
        </div>
      </div>
    </section>
  );
}
