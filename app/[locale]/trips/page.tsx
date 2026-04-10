import { Suspense } from "react";
import type { Metadata } from "next";

import Trips from "@/legacy-pages/public/Trips";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  return buildLocalizedMetadata({
    locale,
    path: "/trips",
    title: "Trips Planner",
    description: "Plan and organize your Algarve itinerary with saved stays, experiences, restaurants, and events.",
    noIndex: true,
  });
}

export default function TripsPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Trips />
    </Suspense>
  );
}
