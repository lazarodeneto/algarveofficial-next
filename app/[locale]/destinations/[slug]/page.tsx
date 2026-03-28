import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, addLocaleToPathname } from "@/lib/i18n/config";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getRegionImageSet } from "@/lib/regionImages";
import {
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const PUBLIC_LISTING_FIELDS = `
  id, slug, name, short_description, featured_image_url, tier,
  status, city_id, region_id, category_id, latitude, longitude
`;
const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon, short_description, image_url";

type RegionRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

interface LocaleDestinationPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

type DestinationCity = {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
};

type DestinationListing = {
  id: string;
  slug: string | null;
  name: string;
  short_description: string | null;
  description?: string | null;
  featured_image_url: string | null;
  city?: DestinationCity | null;
};

type DestinationListingRow = Omit<DestinationListing, "city"> & {
  city?: DestinationCity | DestinationCity[] | null;
};

function lp(locale: Locale, path: string): string {
  return addLocaleToPathname(path, locale);
}

function resolveRegionImage(region: RegionRow): string | null {
  const fallbackRegionImage = getRegionImageSet(region.slug, { includeAliases: true });
  const fallbackImageSrc = typeof fallbackRegionImage?.image === "string"
    ? fallbackRegionImage.image
    : null;
  const src = region.hero_image_url || region.image_url || fallbackImageSrc;
  return src ? normalizePublicImageUrl(src) : null;
}

function truncateMeta(value?: string | null, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function normalizeDestinationListing(row: DestinationListingRow): DestinationListing {
  const city = Array.isArray(row.city) ? (row.city[0] ?? null) : (row.city ?? null);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short_description: row.short_description,
    description: row.description,
    featured_image_url: row.featured_image_url,
    city,
  };
}

const getDestinationPageData = cache(async (slug: string, locale: Locale) => {
  const supabase = createPublicServerClient();
  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);

  const { data: regionData, error: regionError } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", slug)
    .or("is_active.eq.true,is_visible_destinations.eq.true")
    .maybeSingle();

  if (regionError) throw regionError;

  let region = (regionData as RegionRow | null) ?? null;
  if (!region) return null;

  if (contentLocale !== "en") {
    const [translation] = await fetchRegionTranslations(contentLocale, [region.id]);
    if (translation) {
      region = {
        ...region,
        name: translation.name?.trim() || region.name,
        short_description: translation.short_description?.trim() || region.short_description,
        description: translation.description?.trim() || region.description,
      };
    }
  }

  const [citiesResponse, listingsResponse] = await Promise.all([
    supabase
      .from("city_region_mapping")
      .select("city:cities(*)")
      .eq("region_id", region.id),
    supabase
      .from("listings")
      .select(`
        ${PUBLIC_LISTING_FIELDS},
        city:cities(${PUBLIC_CITY_FIELDS}),
        category:categories(${PUBLIC_CATEGORY_FIELDS})
      `)
      .eq("region_id", region.id)
      .eq("status", "published")
      .order("is_curated", { ascending: false })
      .order("tier", { ascending: false })
      .limit(24),
  ]);

  if (citiesResponse.error) throw citiesResponse.error;
  if (listingsResponse.error) throw listingsResponse.error;

  let cities = (citiesResponse.data ?? [])
    .map((row) => row.city as unknown as DestinationCity | null)
    .filter((city): city is DestinationCity => Boolean(city));

  let listings = ((listingsResponse.data ?? []) as DestinationListingRow[]).map(
    normalizeDestinationListing,
  );

  if (contentLocale !== "en") {
    const [cityTranslations, listingTranslations] = await Promise.all([
      fetchCityTranslations(contentLocale, cities.map((city) => city.id)),
      fetchListingTranslations(contentLocale, listings.map((listing) => listing.id)),
    ]);

    const cityTranslationMap = new Map(
      cityTranslations.map((translation) => [translation.city_id, translation]),
    );
    const listingTranslationMap = new Map(
      listingTranslations.map((translation) => [translation.listing_id, translation]),
    );

    cities = cities.map((city) => {
      const translation = cityTranslationMap.get(city.id);
      return {
        ...city,
        name: translation?.name?.trim() || city.name,
        short_description: translation?.short_description?.trim() || city.short_description,
        description: translation?.description?.trim() || city.description,
      };
    });

    listings = listings.map((listing) => {
      const listingTranslation = listingTranslationMap.get(listing.id);
      const cityTranslation = listing.city?.id ? cityTranslationMap.get(listing.city.id) : undefined;

      return {
        ...listing,
        name: listingTranslation?.title?.trim() || listing.name,
        short_description: listingTranslation?.short_description?.trim() || listing.short_description,
        description: listingTranslation?.description?.trim() || listing.description,
        city: listing.city
          ? {
              ...listing.city,
              name: cityTranslation?.name?.trim() || listing.city.name,
              short_description:
                cityTranslation?.short_description?.trim() || listing.city.short_description,
              description: cityTranslation?.description?.trim() || listing.city.description,
            }
          : listing.city,
      };
    });
  }

  return {
    region,
    cities,
    listings,
  };
});

export const revalidate = 3600;

export async function generateMetadata({ params }: LocaleDestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getDestinationPageData(slug, resolvedLocale);
  const tx = await getServerTranslations(resolvedLocale, ["destinationDetail.metaTitleSuffix"]);

  if (!data) {
    return buildPageMetadata({
      title: "Destination Not Found",
      description: "The requested destination could not be found.",
      localizedPath: `/destinations/${slug}`,
      noIndex: true,
      noFollow: true,
    });
  }

  const { region } = data;
  const description = truncateMeta(region.short_description) || truncateMeta(region.description);
  const resolvedImage = resolveRegionImage(region);

  return buildPageMetadata({
    title: `${region.name} | ${tx["destinationDetail.metaTitleSuffix"] ?? "Algarve Destination Guide"}`,
    description: description || undefined,
    localizedPath: `/destinations/${region.slug}`,
    image: resolvedImage ?? undefined,
    type: "place",
    locale: resolvedLocale,
  });
}

export default async function LocaleDestinationPage({ params }: LocaleDestinationPageProps) {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const [data, tx] = await Promise.all([
    getDestinationPageData(slug, resolvedLocale),
    getServerTranslations(resolvedLocale, [
      "navigation.destinations",
      "navigation.directory",
      "destinationDetail.backToDestinations",
      "destinationDetail.badge",
      "destinationDetail.exploreRegion",
      "destinationDetail.listingsCount",
      "destinationDetail.metaTitleSuffix",
      "common.noListingsYet",
      "common.noListingsYetDesc",
    ]),
  ]);

  if (!data) notFound();

  const { region, cities, listings } = data;
  const resolvedImage = resolveRegionImage(region);

  return (
    <div id="destination-detail-server-shell" className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-[var(--colour-ink)] text-white">
        <div className="app-container flex items-center justify-between py-5">
          <Link href={lp(resolvedLocale, "/")} className="font-serif text-2xl tracking-tight">
            <span className="text-gradient-gold">Algarve</span>
            <span className="text-white">Official</span>
          </Link>
          <nav className="hidden gap-6 text-sm text-white/80 md:flex">
            <Link href={lp(resolvedLocale, "/destinations")} className="hover:text-white">{tx["navigation.destinations"] ?? "Destinations"}</Link>
            <Link href={lp(resolvedLocale, "/directory")} className="hover:text-white">{tx["navigation.directory"] ?? "Directory"}</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden pt-[calc(6rem+10px)] pb-16 lg:pt-[calc(8rem+10px)] lg:pb-24">
          <div className="absolute inset-0">
            {resolvedImage ? (
               
              <Image
                src={resolvedImage as string}
                alt={region.name}
                fill
                unoptimized
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-charcoal-light to-charcoal" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25" />
          </div>

          <div className="relative app-container content-max">
            <Link
              href={lp(resolvedLocale, "/destinations")}
              className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors"
            >
              ← {tx["destinationDetail.backToDestinations"] ?? "Back to Destinations"}
            </Link>

            <span className="mt-8 inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase">
              {tx["destinationDetail.badge"] ?? "Premium Region"}
            </span>

            <h1 className="mt-6 text-hero font-serif font-medium text-white">{region.name}</h1>

            <p className="mt-6 text-body text-white/85 readable">
              {region.description || region.short_description}
            </p>

            {cities.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {cities.map((city) => (
                  <Link
                    key={city.id}
                    href={lp(resolvedLocale, `/destinations/${city.slug}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm text-white backdrop-blur-sm"
                  >
                    <span className="text-primary">•</span>
                    {city.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="app-container content-max density">
            <div className="mb-12">
              <h2 className="text-title font-serif font-medium text-foreground">
                {(tx["destinationDetail.exploreRegion"] ?? "Explore {{region}}").replace("{{region}}", region.name)}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                {(tx["destinationDetail.listingsCount"] ?? "{{count}} premium listings in this region").replace(
                  "{{count}}",
                  String(listings.length),
                )}
              </p>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => {
                  const listingImage = normalizePublicImageUrl(listing.featured_image_url);
                  return (
                    <Link
                      key={listing.id}
                      href={lp(resolvedLocale, `/listing/${listing.slug || listing.id}`)}
                      className="group block"
                    >
                      <article className="overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {listingImage ? (
                            <Image
                              src={listingImage}
                              alt={listing.name}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-card to-muted" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif text-lg font-medium text-foreground line-clamp-1">
                            {listing.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {listing.short_description}
                          </p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card px-8 py-14 text-center">
                <h3 className="text-title font-serif text-foreground">{tx["common.noListingsYet"] ?? "No Listings Yet"}</h3>
                <p className="mt-3 text-body text-muted-foreground">
                  {tx["common.noListingsYetDesc"] ?? "We're selecting the finest experiences for this region."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
