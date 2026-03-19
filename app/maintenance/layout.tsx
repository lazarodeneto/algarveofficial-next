import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Maintenance",
  description: "AlgarveOfficial is temporarily unavailable while we perform maintenance.",
  path: "/maintenance",
  noIndex: true,
  noFollow: true,
});

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return children;
}

