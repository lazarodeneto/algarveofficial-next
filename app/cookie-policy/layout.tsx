import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getCookiePolicyContent } from "@/lib/legal/cookie-policy-content";
import { buildMetadata } from "@/lib/metadata";

const cookiePolicyContent = getCookiePolicyContent("en");

export const metadata: Metadata = buildMetadata({
  title: cookiePolicyContent.pageTitle,
  description: cookiePolicyContent.metaDescription,
  path: "/cookie-policy",
});

export default function CookiePolicyLayout({ children }: { children: ReactNode }) {
  return children;
}
