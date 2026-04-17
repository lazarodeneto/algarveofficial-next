import type { Metadata } from "next";
import { notFound } from "next/navigation";

import MapClient from "@/components/map/MapClient";
import { getDirectoryPageData } from "@/lib/directory-data";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildStaticRouteData } from "@/lib/i18n/localized-routing";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const translations = await getServerTranslations(locale, [
    "map.title",
    "map.description",
  ]);
  const metadata = buildPageMetadata({
    locale,
    localizedRoute: buildStaticRouteData("map"),
    title: translations["map.title"] ?? "AlgarveOfficial",
    description:
      translations["map.description"] ??
      translations["map.title"] ??
      "AlgarveOfficial",
    keywords: ["Algarve map", "interactive map", "luxury listings", "restaurants", "golf"],
  });

  return metadata;
}

export default async function MapPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const data = await getDirectoryPageData(rawLocale, {
    q: "",
    city: "all",
    region: "all",
    category: "all",
    tier: "all",
  });

  return (
    <MapClient
      locale={data.locale}
      initialListings={data.listings}
      initialCities={data.cities}
      initialRegions={data.regions}
      initialCategories={data.categories}
    />
  );
}
