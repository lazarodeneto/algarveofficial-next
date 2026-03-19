import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Owner Dashboard",
  description: "Manage listings, media, subscriptions, and enquiries in the AlgarveOfficial owner portal.",
  path: "/owner",
  noIndex: true,
  noFollow: true,
});

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return children;
}

