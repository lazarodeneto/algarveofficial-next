import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About AlgarveOfficial",
  description:
    "Learn about AlgarveOfficial and our mission to curate Portugal's premier luxury stays, dining, golf, and concierge experiences.",
  path: "/about-us",
});

export default function AboutUsLayout({ children }: { children: ReactNode }) {
  return children;
}

