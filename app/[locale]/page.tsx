import type { Metadata } from "next";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { HomePageClient } from "@/components/home/HomePageClient";
import { getHomePageData } from "@/lib/homepage-data";

interface LocaleHomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleHomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
    locale: (locale ?? DEFAULT_LOCALE) as Locale,
    localizedPath: "/",
  });
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getHomePageData();

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <HomePageClient
          homepageSettings={data.homepageSettings}
          regions={data.regions}
          categories={data.categories}
          allCategories={data.allCategories}
          cities={data.cities}
          listings={data.listings}
          curatedAssignments={data.curatedAssignments}
          globalSettings={data.globalSettings}
          locale={resolvedLocale}
          dehydratedState={{ queries: [], mutations: [] }}
        />
      </Suspense>
    </>
  );
}
