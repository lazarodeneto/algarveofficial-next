import type { Metadata } from "next";

import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDirectoryPageData } from "@/lib/directory-data";
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
  const metadata = buildLocalizedMetadata({
    locale,
    path: "/directory",
    title: "Directory",
    description: "Browse our curated directory of premium listings in the Algarve.",
    keywords: ["Algarve directory", "luxury listings", "restaurants", "golf"],
  });

  return {
    ...metadata,
    alternates: {
      canonical: (metadata.alternates as { canonical?: string } | undefined)?.canonical,
      languages: buildHreflangs("/directory"),
    } as Metadata["alternates"],
  };
}

export default async function DirectoryPage({ params }: PageProps) {
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
    <DirectoryClient
      locale={data.locale}
      initialListings={data.listings}
      initialCities={data.cities}
      initialRegions={data.regions}
      initialCategories={data.categories}
      initialCategoryCounts={data.categoryCounts}
      initialFilters={data.filters}
      globalSettings={data.globalSettings}
    />
  );
}
