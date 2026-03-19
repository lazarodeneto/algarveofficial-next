import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Authentication Callback",
  description: "Completing authentication on AlgarveOfficial.",
  path: "/auth/callback",
  noIndex: true,
  noFollow: true,
});

export default function AuthCallbackLayout({ children }: { children: ReactNode }) {
  return children;
}

