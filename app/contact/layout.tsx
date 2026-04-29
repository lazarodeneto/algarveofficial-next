import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact AlgarveOfficial",
  description:
    "Contact AlgarveOfficial for concierge support, listing enquiries, partnerships, and tailored premium experiences in the Algarve.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}

