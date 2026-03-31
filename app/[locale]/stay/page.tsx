import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getDirectoryPageData } from "@/lib/directory-data";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import {
  buildVisitIndexBreadcrumbSchema,
  buildVisitIndexCityItemListSchema,
} from "@/lib/seo/programmatic/schema-builders";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 60;

const STAY_META: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Stay in the Algarve",
    description:
      "Find the perfect places to stay across the Algarve — from boutique hotels to luxury resorts.",
  },
  "pt-pt": {
    title: "Estadia no Algarve",
    description:
      "Encontre os melhores lugares para ficar no Algarve — de hotéis boutique a resorts de luxo.",
  },
  fr: {
    title: "Séjour en Algarve",
    description:
      "Trouvez les meilleurs hébergements en Algarve — des hôtels boutiques aux resorts de luxe.",
  },
  de: {
    title: "Unterkunft in der Algarve",
    description:
      "Finden Sie die perfekte Unterkunft in der Algarve — von Boutique-Hotels bis zu Luxus-Resorts.",
  },
  es: {
    title: "Alojamiento en el Algarve",
    description:
      "Encuentra los mejores lugares para alojarte en el Algarve — desde hoteles boutique hasta resorts de lujo.",
  },
  it: {
    title: "Soggiorno in Algarve",
    description:
      "Trova i posti migliori per soggiornare in Algarve — da hotel boutique a resort di lusso.",
  },
  nl: {
    title: "Verblijf in de Algarve",
    description:
      "Vind de perfecte accommodatie in de Algarve — van boetiekhotels tot luxe resorts.",
  },
  sv: {
    title: "Boende i Algarve",
    description:
      "Hitta det perfekta boendet i Algarve — från boutiquehotell till lyxresorter.",
  },
  no: {
    title: "Opphold i Algarve",
    description:
      "Finn det perfekte stedet å bo i Algarve — fra boutiquehoteller til luksusresorter.",
  },
  da: {
    title: "Ophold i Algarve",
    description:
      "Find det perfekte sted at bo i Algarve — fra boutiquehoteller til luksusresorts.",
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
  const meta = STAY_META[locale];

  return buildLocalizedMetadata({
    locale,
    path: "/stay",
    title: meta.title,
    description: meta.description,
    keywords: [
      "Algarve",
      "stay",
      "hotels",
      "resorts",
      "accommodation",
      "places to stay",
    ],
  });
}

export default async function StayPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const sp = await searchParams;
  const getFilterValue = (key: string, defaultValue: string) => {
    const value = sp[key];
    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;
    return defaultValue;
  };

  const initialFilters = {
    q: getFilterValue("q", ""),
    city: getFilterValue("city", "all"),
    region: getFilterValue("region", "all"),
    category: getFilterValue("category", "all"),
    tier: getFilterValue("tier", "all"),
  };

  const data = await getDirectoryPageData(rawLocale, initialFilters);

  const visitCityItemListSchema = buildVisitIndexCityItemListSchema(
    data.locale as Locale,
    data.visitCityIndex.map((city) => ({
      slug: city.slug,
      name: city.name,
      count: city.totalCount,
    })),
  );
  const breadcrumbSchema = buildVisitIndexBreadcrumbSchema(data.locale as Locale);

  return (
    <>
      {visitCityItemListSchema ? (
        <Script
          id="schema-stay-index-city-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(visitCityItemListSchema) }}
        />
      ) : null}
      <Script
        id="schema-stay-index-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DirectoryClient
        locale={data.locale}
        initialListings={data.listings}
        initialCities={data.cities}
        initialRegions={data.regions}
        initialCategories={data.categories}
        initialCategoryCounts={data.categoryCounts}
        visitCityIndex={data.visitCityIndex}
        featuredVisitCity={data.featuredVisitCity}
        initialFilters={data.filters}
        globalSettings={data.globalSettings}
        cmsPageId="stay"
      />
    </>
  );
}
