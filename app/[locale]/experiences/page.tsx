import { Suspense } from "react";
import type { Metadata } from "next";

import ExperiencesClient from "@/components/experiences/ExperiencesClient";
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
    path: "/experiences",
    title: "Experiences in the Algarve",
    description: "Discover curated experiences across the Algarve — from wine tastings and boat tours to golf, wellness, and cultural adventures.",
    keywords: ["Algarve experiences", "things to do Algarve", "Algarve tours", "Algarve activities"],
  });
}

export default function ExperiencesPage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ExperiencesClient initialGlobalSettings={[]} />
    </Suspense>
  );
}
