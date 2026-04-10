import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
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
    path: `/listing/${slug}`,
    noIndex: true,
    noFollow: true,
    localeCode: DEFAULT_LOCALE,
  });
}

export default function LegacyRealEstateLayout({ children }: { children: ReactNode }) {
  return children;
}
