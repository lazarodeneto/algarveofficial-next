import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Algarve Blog",
  description:
    "Read AlgarveOfficial stories, travel insights, and curated recommendations across villas, dining, golf, events, and lifestyle.",
  path: "/blog",
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}

