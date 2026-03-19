import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy",
  description:
    "Read how AlgarveOfficial uses cookies and similar technologies, and how you can manage your preferences.",
  path: "/cookie-policy",
});

export default function CookiePolicyLayout({ children }: { children: ReactNode }) {
  return children;
}

