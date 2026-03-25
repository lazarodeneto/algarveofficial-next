import { Suspense } from "react";
import type { Metadata } from "next";

import Trips from "@/legacy-pages/public/Trips";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildHreflangs } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const metadata = buildLocalizedMetadata({
    locale,
    path: "/trips",
    title: "Trips Planner",
    description: "Plan and organize your Algarve itinerary with saved stays, experiences, restaurants, and events.",
    noIndex: true,
  });

  return {
    ...metadata,
    alternates: {
      canonical: (metadata.alternates as { canonical?: string } | undefined)?.canonical,
      languages: buildHreflangs("/trips"),
    } as Metadata["alternates"],
  };
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Trips />
    </Suspense>
  );
}
