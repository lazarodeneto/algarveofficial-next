import type { GolfScorecardHole } from "@/lib/golf";

interface ScorecardLabels {
  title: string;
  hole: string;
  par: string;
  hcp: string;
  white: string;
  yellow: string;
  red: string;
}

interface ScorecardProps {
  rows: GolfScorecardHole[];
  labels: ScorecardLabels;
}

export function Scorecard({ rows, labels }: ScorecardProps) {
  if (rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <h2 className="font-serif text-3xl font-medium text-foreground">{labels.title}</h2>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 shadow-sm">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="sticky top-0 bg-muted/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{labels.hole}</th>
              <th className="px-4 py-3 font-medium">{labels.par}</th>
              <th className="px-4 py-3 font-medium">{labels.hcp}</th>
              <th className="px-4 py-3 font-medium">{labels.white}</th>
              <th className="px-4 py-3 font-medium">{labels.yellow}</th>
              <th className="px-4 py-3 font-medium">{labels.red}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.holeNumber} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{row.holeNumber}</td>
                <td className="px-4 py-3">{row.par}</td>
                <td className="px-4 py-3">{row.hcp ?? ""}</td>
                <td className="px-4 py-3">{row.white ?? ""}</td>
                <td className="px-4 py-3">{row.yellow ?? ""}</td>
                <td className="px-4 py-3">{row.red ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
