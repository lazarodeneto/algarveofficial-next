import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getPrivacyPolicyContent } from "@/lib/legal/privacy-policy-content";
import { buildMetadata } from "@/lib/metadata";

const privacyPolicyContent = getPrivacyPolicyContent("en");

export const metadata: Metadata = buildMetadata({
  title: privacyPolicyContent.pageTitle,
  description: privacyPolicyContent.metaDescription,
  path: "/privacy-policy",
});

export default function PrivacyPolicyLayout({ children }: { children: ReactNode }) {
  return children;
}
