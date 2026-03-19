import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildMetadata } from "@/lib/metadata";

interface LegacyRealEstateLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LegacyRealEstateLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  return buildMetadata({
    title: "Real Estate Listing Redirect",
    description: "Redirecting to the canonical AlgarveOfficial listing page.",
    path: `/real-estate/${slug}`,
    noIndex: true,
    noFollow: true,
  });
}

export default function LegacyRealEstateLayout({ children }: { children: ReactNode }) {
  return children;
}

