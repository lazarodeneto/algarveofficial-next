import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your AlgarveOfficial account password.",
  path: "/forgot-password",
  noIndex: true,
  noFollow: true,
});

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}

