import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Log In",
  description: "Access your AlgarveOfficial account to manage favourites, trips, listings, and messages.",
  path: "/login",
  noIndex: true,
  noFollow: true,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}

