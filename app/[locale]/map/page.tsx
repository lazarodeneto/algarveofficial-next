import type { Metadata } from "next";

import MapClient from "@/components/map/MapClient";
import { getDirectoryPageData } from "@/lib/directory-data";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildHreflangs } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

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
  const metadata = buildLocalizedMetadata({
    locale,
    path: "/map",
    title: translations["map.title"] || "Map Explorer",
    description:
      translations["map.description"] ||
      "Explore Algarve listings on an interactive map with clustered markers and instant filtering.",
    keywords: ["Algarve map", "interactive map", "luxury listings", "restaurants", "golf"],
  });

  return {
    ...metadata,
    alternates: {
      canonical: (metadata.alternates as { canonical?: string } | undefined)?.canonical,
      languages: buildHreflangs("/map"),
    } as Metadata["alternates"],
  };
}

export default async function MapPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return <div>Invalid locale</div>;
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
