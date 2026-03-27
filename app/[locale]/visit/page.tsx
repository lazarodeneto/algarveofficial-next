import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDirectoryPageData } from "@/lib/directory-data";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

const VISIT_META: Record<string, { title: string; description: string }> = {
  en: {
    title: "Discover the Best of the Algarve",
    description:
      "Explore top restaurants, hotels, beaches and experiences across the Algarve.",
  },
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const meta = VISIT_META[locale];

  return buildLocalizedMetadata({
    locale,
    path: "/visit",
    title: meta.title,
    description: meta.description,
    keywords: [
      "Algarve",
      "directory",
      "restaurants",
      "hotels",
      "beaches",
      "golf",
    ],
  });
}

export default async function VisitPage({ params }: PageProps) {
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
