import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "User Dashboard",
  description: "Manage your AlgarveOfficial profile, favourites, messages, and trip plans.",
  path: "/dashboard",
  noIndex: true,
  noFollow: true,
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}

