import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Sign Up",
  description: "Create an AlgarveOfficial account to save favourites, plan trips, and connect with listing owners.",
  path: "/signup",
  noIndex: true,
  noFollow: true,
});

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}

