import type { GolfCourseDetails } from "@/lib/golf";

interface MetricsGridLabels {
  holes: string;
  par: string;
  slope: string;
  rating: string;
  length: string;
  designer: string;
  meters: string;
}

interface MetricsGridProps {
  details: GolfCourseDetails | null;
  labels: MetricsGridLabels;
}

export function MetricsGrid({ details, labels }: MetricsGridProps) {
  const metrics = [
    { label: labels.holes, value: details?.holes },
    { label: labels.par, value: details?.par },
    { label: labels.slope, value: details?.slopeRating },
    { label: labels.rating, value: details?.courseRating },
    { label: labels.length, value: details?.lengthMeters ? `${details.lengthMeters} ${labels.meters}` : null },
    { label: labels.designer, value: details?.architect },
  ].filter((metric) => metric.value !== null && metric.value !== undefined && metric.value !== "");

  if (metrics.length === 0) return null;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 py-12 md:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-xl border border-border/70 p-4 shadow-sm">
          <p className="text-xl font-semibold text-foreground">{metric.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
        </div>
      ))}
    </section>
  );
}
