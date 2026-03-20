export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

interface LocaleDirectoryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleDirectoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Premium Directory | AlgarveOfficial",
    description:
      "Discover the finest restaurants, villas, golf courses, and experiences in the Algarve. Curated by local experts.",
    localizedPath: "/directory",
    locale: (locale ?? DEFAULT_LOCALE) as Locale,
  });
}

export default async function LocaleDirectoryPage({ params }: LocaleDirectoryPageProps) {
  const { locale } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;

  return (
    <DirectoryClient
      locale={resolvedLocale}
      initialListings={[]}
      initialCities={[]}
      initialRegions={[]}
      initialCategories={[]}
      initialCategoryCounts={{}}
      initialFilters={{ q: "", city: "", region: "", category: "", tier: "" }}
      globalSettings={[]}
    />
  );
}
