/* eslint-disable local/no-hardcoded-strings */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
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
      "Find the perfect places to stay across the Algarve — from boutique hotels to premium resorts.",
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

  const getCityValues = (): string[] => {
    const value = sp["city"];
    if (Array.isArray(value)) return value.filter(v => v && v !== "all");
    if (typeof value === "string" && value && value !== "all") return [value];
    return [];
  };

  const initialFilters = {
    q: getFilterValue("q", ""),
    city: getCityValues().length > 0 ? getCityValues()[0] : "all",
    region: getFilterValue("region", "all"),
    category: getFilterValue("category", "all"),
    tier: getFilterValue("tier", "all"),
  };

  const data = await getDirectoryPageData(rawLocale, initialFilters);
  const tx = await getServerTranslations(data.locale as Locale, [
    "directory.heroLabel",
    "directory.title",
    "directory.subtitle",
  ]);

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
      <div id="directory-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-16">
          <section className="rounded-lg border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {tx["directory.heroLabel"] ?? "Discover Our World"}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              {tx["directory.title"] ?? STAY_META[data.locale as Locale].title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {tx["directory.subtitle"] ?? STAY_META[data.locale as Locale].description}
            </p>

            {data.visitCityIndex.length > 0 ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {data.visitCityIndex.slice(0, 4).map((city) => (
                  <Link
                    key={city.id}
                    href={buildLocalizedPath(data.locale, `/visit/${city.slug}`)}
                    className="rounded-sm border border-border/60 bg-background/70 p-4 transition-colors hover:border-primary/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{city.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {city.totalCount} curated listings
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}

            {data.listings.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {data.listings.slice(0, 4).map((listing) => (
                  <Link
                    key={listing.id}
                    href={buildLocalizedPath(data.locale, `/listing/${listing.slug}`)}
                    className="rounded-sm border border-border/60 bg-background/70 p-4 transition-colors hover:border-primary/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{listing.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {listing.city?.name ?? "Algarve"}{listing.category?.name ? ` · ${listing.category.name}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        </main>
      </div>

      {visitCityItemListSchema ? (
        <script
          id="schema-stay-index-city-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(visitCityItemListSchema) }}
        />
      ) : null}
      <script
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
        imageTimestamp={0}
      />
    </>
  );
}
