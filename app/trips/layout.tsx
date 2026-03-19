import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Trips Planner",
  description:
    "Plan and organize your Algarve itinerary with saved stays, experiences, restaurants, and events.",
  path: "/trips",
  noIndex: true,
  noFollow: true,
});

export default function TripsLayout({ children }: { children: ReactNode }) {
  return children;
}

