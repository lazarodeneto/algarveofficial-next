import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Review AlgarveOfficial's terms governing platform access, listings, content, and user responsibilities.",
  path: "/terms",
});

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}

