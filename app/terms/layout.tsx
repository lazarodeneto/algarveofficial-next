import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getTermsContent } from "@/lib/legal/terms-content";
import { buildMetadata } from "@/lib/metadata";

const termsContent = getTermsContent("en");

export const metadata: Metadata = buildMetadata({
  title: termsContent.pageTitle,
  description: termsContent.metaDescription,
  path: "/terms",
});

export default function TermsLayout({ children }: { children: ReactNode }) {
  return children;
}
