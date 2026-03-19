import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Review how AlgarveOfficial collects, uses, and protects personal data in line with GDPR and applicable law.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyLayout({ children }: { children: ReactNode }) {
  return children;
}

