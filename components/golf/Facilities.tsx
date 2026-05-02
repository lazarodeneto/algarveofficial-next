import { Car, Flag, GraduationCap, House, Utensils } from "lucide-react";

import type { GolfCourseDetails } from "@/lib/golf";

interface FacilitiesLabels {
  title: string;
  drivingRange: string;
  clubhouse: string;
  restaurant: string;
  buggy: string;
  academy: string;
}

interface FacilitiesProps {
  details: GolfCourseDetails | null;
  labels: FacilitiesLabels;
}

export function Facilities({ details, labels }: FacilitiesProps) {
  const facilities = [
    { label: labels.drivingRange, enabled: details?.drivingRange, Icon: Flag },
    { label: labels.clubhouse, enabled: details?.clubhouse, Icon: House },
    { label: labels.restaurant, enabled: details?.restaurant, Icon: Utensils },
    { label: labels.buggy, enabled: details?.buggyAvailable, Icon: Car },
    { label: labels.academy, enabled: details?.academy, Icon: GraduationCap },
  ].filter((facility) => facility.enabled === true);

  if (facilities.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl py-12">
      <h2 className="font-serif text-3xl font-medium text-foreground">{labels.title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        {facilities.map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 p-4 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
