import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  buildBreadcrumbSchema,
  buildTouristDestinationSchema,
} from "@/lib/seo/schemaBuilders.js";
import { getRegionImageSet } from "@/lib/regionImages";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import {
  type DestinationCity,
  type DestinationCuratedListing,
  type DestinationGlobalSetting,
  type DestinationListing,
  type DestinationRegion,
} from "@/components/destinations/DestinationDetailClient";
import { DestinationDetailHydrator } from "@/components/destinations/DestinationDetailHydrator";
import { buildMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";

const DESTINATION_DETAIL_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
] as const;

const PUBLIC_LISTING_FIELDS = `
  id,
  slug,
  name,
  short_description,
  description,
  featured_image_url,
  price_from,
  price_to,
  price_currency,
  tier,
  is_curated,
  status,
  city_id,
  region_id,
  category_id,
  owner_id,
  latitude,
  longitude,
  address,
  website_url,
  facebook_url,
  instagram_url,
  twitter_url,
  linkedin_url,
  youtube_url,
  tiktok_url,
  telegram_url,
  google_business_url,
  google_rating,
  google_review_count,
  tags,
  category_data,
  view_count,
  published_at,
  created_at,
  updated_at
`;

const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, name, slug, short_description, image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon, short_description, image_url";

type RegionRow = DestinationRegion;
type GlobalSettingRow = DestinationGlobalSetting;
type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

interface DestinationPageData {
  region: DestinationRegion;
  cities: DestinationCity[];
  listings: DestinationListing[];
  curatedListings: DestinationCuratedListing[];
  globalSettings: DestinationGlobalSetting[];
}

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

function normalizeSettingKeys(keys: readonly string[]) {
  return Array.from(new Set(keys)).sort();
}

function sanitizeMeta(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateMeta(value?: string | null, max = 155) {
  const normalized = sanitizeMeta(String(value || ""));
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function resolveStaticImageSrc(
  value?: string | { src: string } | null,
): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.src;
}

function resolveRegionImage(region: RegionRow) {
  const fallbackRegionImage = getRegionImageSet(region.slug, { includeAliases: true });
  return resolveStaticImageSrc(
    region.hero_image_url || region.image_url || fallbackRegionImage?.image || null,
  );
}

function absoluteUrl(value?: string | null) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function buildDestinationDescription(region: RegionRow) {
  return (
    truncateMeta(region.short_description) ||
    truncateMeta(region.description) ||
    truncateMeta(
      `Discover premium places to stay, dining, and experiences in ${region.name}, Algarve, Portugal.`,
    ) ||
    "Discover the Algarve's most prestigious destinations."
  );
}

function normalizeCuratedListing(value: unknown): DestinationCuratedListing | null {
  const rawListing = Array.isArray(value) ? value[0] : value;
  if (!rawListing || typeof rawListing !== "object") {
    return null;
  }

  const listing = rawListing as DestinationCuratedListing & {
    city?: DestinationCuratedListing["city"] | DestinationCuratedListing["city"][];
    region?: DestinationCuratedListing["region"] | DestinationCuratedListing["region"][];
    category?: DestinationCuratedListing["category"] | DestinationCuratedListing["category"][];
  };

  return {
    ...listing,
    city: Array.isArray(listing.city) ? (listing.city[0] ?? null) : (listing.city ?? null),
    region: Array.isArray(listing.region) ? (listing.region[0] ?? null) : (listing.region ?? null),
    category: Array.isArray(listing.category) ? (listing.category[0] ?? null) : (listing.category ?? null),
  };
}

function mapCuratedListings(rows: unknown[]) {
  return (rows ?? [])
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const assignment = row as { listing?: unknown };
      return normalizeCuratedListing(assignment.listing);
    })
    .filter(
      (listing): listing is DestinationCuratedListing => {
        if (!listing) return false;
        return listing.status === "published" && listing.tier === "signature";
      },
    );
}

async function fetchCuratedListings(
  supabase: ServerSupabase,
  regionId: string,
  limit: number,
) {
  const select = `
    id,
    display_order,
    listing:listings(
      ${PUBLIC_LISTING_FIELDS},
      city:cities(${PUBLIC_CITY_FIELDS}),
      region:regions(${PUBLIC_REGION_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS})
    )
  `;

  const { data: regionAssignments, error: regionError } = await supabase
    .from("curated_assignments")
    .select(select)
    .eq("context_type", "region")
    .eq("context_id", regionId)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (regionError) throw regionError;

  let listings = mapCuratedListings(regionAssignments ?? []);

  if (listings.length === 0) {
    const { data: homepageAssignments, error: homepageError } = await supabase
      .from("curated_assignments")
      .select(select)
      .eq("context_type", "homepage")
      .order("display_order", { ascending: true })
      .limit(limit);

    if (homepageError) throw homepageError;
    listings = mapCuratedListings(homepageAssignments ?? []);
  }

  return listings.slice(0, limit);
}

const getDestinationPageData = cache(async (slug: string): Promise<DestinationPageData | null> => {
  const supabase = await createClient();

  const { data: regionData, error: regionError } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", slug)
    .or("is_active.eq.true,is_visible_destinations.eq.true")
    .maybeSingle();

  if (regionError) throw regionError;

  const region = (regionData as RegionRow | null) ?? null;
  if (!region) {
    return null;
  }

  const globalSettingKeys = normalizeSettingKeys(DESTINATION_DETAIL_CMS_KEYS);

  const [citiesResponse, listingsResponse, curatedListings, globalSettingsResponse] = await Promise.all([
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
    fetchCuratedListings(supabase, region.id, 8),
    supabase
      .from("global_settings")
      .select("key, value, category")
      .in("key", globalSettingKeys)
      .order("key", { ascending: true }),
  ]);

  if (citiesResponse.error) throw citiesResponse.error;
  if (listingsResponse.error) throw listingsResponse.error;
  if (globalSettingsResponse.error) throw globalSettingsResponse.error;

  const cities = (citiesResponse.data ?? [])
    .map((row) => row.city as unknown as DestinationCity | null)
    .filter((city): city is DestinationCity => Boolean(city));

  const listings = (listingsResponse.data ?? []) as unknown as DestinationListing[];
  const globalSettings = (globalSettingsResponse.data ?? []) as GlobalSettingRow[];

  return {
    region,
    cities,
    listings,
    curatedListings,
    globalSettings,
  };
});

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // On-demand ISR — pages are built on first visit, then cached for 1 hour.
  return [];
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDestinationPageData(slug);

  if (!data) {
    return buildMetadata({
      title: "Destination Not Found | AlgarveOfficial",
      description: "The requested destination could not be found.",
      path: `/destinations/${slug}`,
      noIndex: true,
      noFollow: true,
    });
  }

  const { region } = data;
  const description = buildDestinationDescription(region);
  const resolvedRegionImage = resolveRegionImage(region) ?? "/og-image.jpg";

  const metadata = buildMetadata({
    title: `${region.name} Destination Guide | AlgarveOfficial`,
    description,
    path: `/destinations/${region.slug}`,
    image: resolvedRegionImage,
    type: "place",
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      title: `${region.name} | Algarve Destination Guide`,
    },
  };
}

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const data = await getDestinationPageData(slug);

  if (!data) {
    notFound();
  }

  const { region, cities, listings, curatedListings, globalSettings } = data;
  const canonicalPath = `/destinations/${region.slug}`;
  const canonicalUrl = absoluteUrl(canonicalPath)!;
  const resolvedRegionImage = resolveRegionImage(region);
  const regionGeo = region as DestinationRegion & {
    latitude?: number | null;
    longitude?: number | null;
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Destinations", url: `${SITE_URL}/destinations` },
    { name: region.name, url: canonicalUrl },
  ]);

  const touristDestinationSchema = buildTouristDestinationSchema({
    name: region.name,
    description: region.short_description || region.description || undefined,
    image: absoluteUrl(resolvedRegionImage),
    url: canonicalUrl,
    latitude: regionGeo.latitude || undefined,
    longitude: regionGeo.longitude || undefined,
    containedInPlace: "Algarve, Portugal",
    touristType: ["Luxury Traveler", "Cultural Tourist", "Golf Enthusiast", "Beach Lover"],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristDestinationSchema) }}
      />

      <div
        id="destination-detail-server-shell"
        className="min-h-screen bg-background text-foreground"
      >
        <header className="border-b border-border/60 bg-[var(--colour-ink)] text-white">
          <div className="app-container flex items-center justify-between py-5">
            <Link href="/" className="font-serif text-2xl tracking-tight">
              <span className="text-gradient-gold">Algarve</span>
              <span className="text-white">Official</span>
            </Link>
            <nav className="hidden gap-6 text-sm text-white/80 md:flex">
              <Link href="/destinations" className="hover:text-white">
                Destinations
              </Link>
              <Link href="/directory" className="hover:text-white">
                Directory
              </Link>
            </nav>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden pt-[calc(6rem+10px)] pb-16 lg:pt-[calc(8rem+10px)] lg:pb-24">
            <div className="absolute inset-0">
              {resolvedRegionImage ? (
                <img
                  src={resolvedRegionImage}
                  alt={region.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-charcoal-light to-charcoal" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25" />
            </div>

            <div className="relative app-container content-max">
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors"
              >
                ← Back to Destinations
              </Link>

              <span className="mt-8 inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase">
                Premium Region
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
                      href={`/city/${city.slug || city.id}`}
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
                  Explore {region.name}
                </h2>
                <p className="mt-2 text-body text-muted-foreground">
                  {listings.length} premium listings in this region
                </p>
              </div>

              {listings.length > 0 ? (
                <div className="grid-adaptive grid-ultrawide">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.slug || listing.id}`}
                      className="group block h-full"
                    >
                      <article className="luxury-card flex h-full flex-col overflow-hidden hoverable">
                        {listing.tier === "signature" ? (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                          />
                        ) : null}

                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {listing.featured_image_url ? (
                            <img
                              src={listing.featured_image_url}
                              alt={listing.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-card to-muted" />
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-2 flex items-center gap-2 text-caption text-muted-foreground">
                            <span>{listing.category?.name || "Listing"}</span>
                            {listing.city ? (
                              <>
                                <span>•</span>
                                <span>{listing.city.name}</span>
                              </>
                            ) : null}
                          </div>

                          <h3 className="min-h-[3.35rem] font-serif text-lg font-medium text-foreground line-clamp-2">
                            {listing.name}
                          </h3>

                          <p className="mt-3 min-h-[3.2rem] flex-1 text-caption text-muted-foreground line-clamp-2">
                            {listing.short_description || listing.description}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card px-8 py-14 text-center">
                  <h3 className="text-title font-serif text-foreground">No Listings Yet</h3>
                  <p className="mt-3 text-body text-muted-foreground">
                    We&apos;re selecting the finest experiences for this region.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <DestinationDetailHydrator
        initialRegion={region}
        initialCities={cities}
        initialListings={listings}
        initialCuratedListings={curatedListings}
        initialGlobalSettings={globalSettings}
      />
    </>
  );
}
