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

const distanceFormatter = new Intl.NumberFormat("en");

type ScorecardDisplayRow =
  | ({ type: "hole" } & GolfScorecardHole)
  | {
      type: "summary";
      label: "Out" | "In" | "Total";
      par: number;
      white: number | null;
      yellow: number | null;
      red: number | null;
    };

function sumNullable(rows: GolfScorecardHole[], key: "white" | "yellow" | "red"): number | null {
  const values = rows.map((row) => row[key]).filter((value): value is number => value !== null);
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0);
}

function buildDisplayRows(rows: GolfScorecardHole[]): ScorecardDisplayRow[] {
  const frontNine = rows.filter((row) => row.holeNumber >= 1 && row.holeNumber <= 9);
  const backNine = rows.filter((row) => row.holeNumber >= 10 && row.holeNumber <= 18);
  const otherRows = rows.filter((row) => row.holeNumber < 1 || row.holeNumber > 18);
  const summary = (label: "Out" | "In" | "Total", summaryRows: GolfScorecardHole[]) => ({
    type: "summary" as const,
    label,
    par: summaryRows.reduce((total, row) => total + row.par, 0),
    white: sumNullable(summaryRows, "white"),
    yellow: sumNullable(summaryRows, "yellow"),
    red: sumNullable(summaryRows, "red"),
  });

  if (frontNine.length === 0 && backNine.length === 0) {
    return rows.map((row) => ({ ...row, type: "hole" as const }));
  }

  return [
    ...frontNine.map((row) => ({ ...row, type: "hole" as const })),
    ...(frontNine.length > 0 ? [summary("Out", frontNine)] : []),
    ...backNine.map((row) => ({ ...row, type: "hole" as const })),
    ...(backNine.length > 0 ? [summary("In", backNine)] : []),
    ...otherRows.map((row) => ({ ...row, type: "hole" as const })),
    summary("Total", rows),
  ];
}

function formatDistance(value: number | null): string {
  return value === null ? "" : distanceFormatter.format(value);
}

export function Scorecard({ rows, labels }: ScorecardProps) {
  if (rows.length === 0) return null;

  const displayRows = buildDisplayRows(rows);

  return (
    <section id="scorecard" className="mx-auto max-w-6xl scroll-mt-28 py-12">
      <h2 className="font-serif text-3xl font-medium text-foreground">{labels.title}</h2>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">{labels.title}</caption>
          <thead className="sticky top-0 text-left text-muted-foreground">
            <tr>
              <th scope="col" className="bg-muted/80 px-4 py-3 text-center font-medium">
                {labels.hole}
              </th>
              <th scope="col" className="bg-zinc-200 px-4 py-3 text-center font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50">
                {labels.white}
              </th>
              <th scope="col" className="bg-amber-500 px-4 py-3 text-center font-medium text-white">
                {labels.yellow}
              </th>
              <th scope="col" className="bg-red-500 px-4 py-3 text-center font-medium text-white">
                {labels.red}
              </th>
              <th scope="col" className="bg-muted/80 px-4 py-3 text-center font-medium">
                {labels.par}
              </th>
              <th scope="col" className="bg-muted/80 px-4 py-3 text-center font-medium">
                {labels.hcp}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              const rowKey = row.type === "hole" ? `hole-${row.holeNumber}` : row.label;
              const isSummary = row.type === "summary";

              return (
                <tr
                  key={rowKey}
                  className={
                    isSummary
                      ? "border-t border-border/80 font-semibold"
                      : "border-t border-border/60"
                  }
                >
                  <th
                    scope="row"
                    className="bg-muted/30 px-4 py-2.5 text-center font-medium text-foreground"
                  >
                    {row.type === "hole" ? row.holeNumber : row.label}
                  </th>
                  <td className="bg-zinc-100 px-4 py-2.5 text-center text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                    {formatDistance(row.white)}
                  </td>
                  <td className="bg-amber-500/90 px-4 py-2.5 text-center font-medium text-white">
                    {formatDistance(row.yellow)}
                  </td>
                  <td className="bg-red-500/90 px-4 py-2.5 text-center font-medium text-white">
                    {formatDistance(row.red)}
                  </td>
                  <td className="bg-muted/30 px-4 py-2.5 text-center text-foreground">
                    {row.par}
                  </td>
                  <td className="bg-muted/30 px-4 py-2.5 text-center text-foreground">
                    {row.type === "hole" ? (row.hcp ?? "") : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
