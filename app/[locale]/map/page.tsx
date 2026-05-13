import type { Metadata } from "next";
import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import MapClient from "@/components/map/MapClient";
import { getDirectoryPageData, type DirectoryPageData } from "@/lib/directory-data";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildStaticRouteData } from "@/lib/i18n/localized-routing";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { getPublicMapListings, type PublicMapListingDTO } from "@/lib/public-data";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 3600;

const MAP_SERVER_KEYS = [
  "serverPages.map.badge",
  "serverPages.map.title",
  "serverPages.map.description",
  "serverPages.map.mappedCount",
  "serverPages.map.publishedCount",
  "serverPages.map.cityCount",
  "serverPages.map.emptyTitle",
  "serverPages.map.emptyDescription",
  "serverPages.map.openDirectory",
  "serverPages.map.listingsAria",
  "serverPages.common.algarve",
] as const;

const MAP_SERVER_FALLBACK: Record<(typeof MAP_SERVER_KEYS)[number], string> = {
  "serverPages.map.badge": "Algarve map",
  "serverPages.map.title": "Explore Algarve listings on the map",
  "serverPages.map.description":
    "Browse published AlgarveOfficial listings with verified map coordinates. The interactive map loads after JavaScript; this list remains available to search engines and visitors without scripting.",
  "serverPages.map.mappedCount": "{{count}} mapped",
  "serverPages.map.publishedCount": "{{count}} published results",
  "serverPages.map.cityCount": "{{count}} cities",
  "serverPages.map.emptyTitle": "No mapped listings available",
  "serverPages.map.emptyDescription":
    "Published listings without coordinates are still available through the directory.",
  "serverPages.map.openDirectory": "Open the directory",
  "serverPages.map.listingsAria": "Mapped listings",
  "serverPages.common.algarve": "Algarve",
};

function mapCopy(copy: Record<string, string>, key: (typeof MAP_SERVER_KEYS)[number], values?: Record<string, string | number>) {
  let value = copy[key] ?? MAP_SERVER_FALLBACK[key];
  for (const [token, replacement] of Object.entries(values ?? {})) {
    value = value.replaceAll(`{{${token}}}`, String(replacement));
  }
  return value;
}

function MapServerShell({
  locale,
  listings,
  totalPublished,
  cities,
  copy,
}: {
  locale: Locale;
  listings: PublicMapListingDTO[];
  totalPublished: number;
  cities: DirectoryPageData["cities"];
  copy: Record<string, string>;
}) {
  return (
    <div id="map-server-shell" className="min-h-screen bg-background text-foreground">
      <main className="app-container pt-[calc(4rem+2.5rem)] pb-16 sm:pt-[calc(5rem+3rem)]">
        <section className="mb-8 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {mapCopy(copy, "serverPages.map.badge")}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            {mapCopy(copy, "serverPages.map.title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            {mapCopy(copy, "serverPages.map.description")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {mapCopy(copy, "serverPages.map.mappedCount", { count: listings.length })}
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {mapCopy(copy, "serverPages.map.publishedCount", { count: totalPublished })}
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {mapCopy(copy, "serverPages.map.cityCount", { count: cities.length })}
            </span>
          </div>
        </section>

        {listings.length === 0 ? (
          <section className="rounded-lg border border-border bg-card/80 p-8 text-center shadow-sm">
            <Compass className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="font-serif text-2xl">{mapCopy(copy, "serverPages.map.emptyTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mapCopy(copy, "serverPages.map.emptyDescription")}
            </p>
            <Link href={buildLocalizedPath(locale, "/stay")} className="mt-4 inline-flex text-primary underline-offset-4 hover:underline">
              {mapCopy(copy, "serverPages.map.openDirectory")}
            </Link>
          </section>
        ) : (
          <section aria-label={mapCopy(copy, "serverPages.map.listingsAria")} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.slice(0, 24).map((listing) => (
              <Link
                key={listing.id}
                href={buildLocalizedPath(locale, `/listing/${listing.slug || listing.id}`)}
                className="rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
              >
                <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {listing.location.city ?? mapCopy(copy, "serverPages.common.algarve")}
                </p>
                <h2 className="mt-2 font-serif text-xl leading-snug">{listing.name}</h2>
                {listing.shortDescription ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {listing.shortDescription}
                  </p>
                ) : null}
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

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
    keywords: ["Algarve map", "interactive map", "premium listings", "restaurants", "golf"],
  });

  return metadata;
}

export default async function MapPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  const data = await getDirectoryPageData(rawLocale, {
    q: "",
    city: "all",
    region: "all",
    category: "all",
    tier: "all",
  });
  const [mapListings, copy] = await Promise.all([
    getPublicMapListings(rawLocale, 200),
    getServerTranslations(locale, [...MAP_SERVER_KEYS]),
  ]);

  return (
    <>
      <MapServerShell
        locale={locale}
        listings={mapListings}
        totalPublished={data.listings.length}
        cities={data.cities}
        copy={copy}
      />
      <MapClient
        locale={data.locale}
        initialListings={data.listings}
        initialCities={data.cities}
        initialRegions={data.regions}
        initialCategories={data.categories}
      />
    </>
  );
}
