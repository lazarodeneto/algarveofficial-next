import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Algarve Events",
  description:
    "Discover upcoming Algarve events, festivals, and premium happenings curated by AlgarveOfficial.",
  path: "/events",
});

export default function EventsLayout({ children }: { children: ReactNode }) {
  return children;
}

