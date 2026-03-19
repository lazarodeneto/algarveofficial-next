import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reset Password",
  description: "Set a new password for your AlgarveOfficial account.",
  path: "/auth/reset-password",
  noIndex: true,
  noFollow: true,
});

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}

