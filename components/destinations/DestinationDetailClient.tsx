"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { LocalizedLink } from "@/components/navigation/LocalizedLink";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, MapPin, Loader2 } from "lucide-react";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import { translateCategoryName } from "@/lib/translateCategory";
import {
  CMS_GLOBAL_SETTING_KEYS,
  type CmsPageConfigMap,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { getRegionImageSet } from "@/lib/regionImages";
import {
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";

export type DestinationRegion = Tables<"regions">;
export type DestinationCity = Tables<"cities">;
export type DestinationGlobalSetting = Pick<Tables<"global_settings">, "key" | "value" | "category">;

type DestinationCitySummary = Pick<
  Tables<"cities">,
  "id" | "name" | "slug" | "short_description" | "image_url" | "latitude" | "longitude"
>;

type DestinationCategorySummary = Pick<
  Tables<"categories">,
  "id" | "name" | "slug" | "icon" | "short_description" | "image_url"
>;

type DestinationRegionSummary = Pick<
  Tables<"regions">,
  "id" | "name" | "slug" | "short_description" | "image_url"
>;

type DestinationListingBase = Pick<
  Tables<"listings">,
  | "id"
  | "slug"
  | "name"
  | "short_description"
  | "description"
  | "featured_image_url"
  | "price_from"
  | "price_to"
  | "price_currency"
  | "tier"
  | "is_curated"
  | "status"
  | "city_id"
  | "region_id"
  | "category_id"
  | "owner_id"
  | "latitude"
  | "longitude"
  | "address"
  | "website_url"
  | "facebook_url"
  | "instagram_url"
  | "twitter_url"
  | "linkedin_url"
  | "youtube_url"
  | "tiktok_url"
  | "telegram_url"
  | "google_business_url"
  | "google_rating"
  | "google_review_count"
  | "tags"
  | "category_data"
  | "view_count"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

export type DestinationListing = DestinationListingBase & {
  city?: DestinationCitySummary | null;
  category?: DestinationCategorySummary | null;
};

export type DestinationCuratedListing = DestinationListingBase & {
  city?: DestinationCitySummary | null;
  region?: DestinationRegionSummary | null;
  category?: DestinationCategorySummary | null;
};

export interface DestinationDetailClientProps {
  initialRegion: DestinationRegion;
  initialCities: DestinationCity[];
  initialListings: DestinationListing[];
  initialCuratedListings: DestinationCuratedListing[];
  initialGlobalSettings: DestinationGlobalSetting[];
}

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

function parseJsonSetting<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextOverrides(input: unknown): CmsTextOverrideMap {
  if (!isPlainRecord(input)) return {};

  const normalized: CmsTextOverrideMap = {};
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === "string") {
      normalized[key.trim()] = value;
    }
  });

  return normalized;
}

function normalizePageConfigs(input: unknown): CmsPageConfigMap {
  if (!isPlainRecord(input)) return {};

  const out: CmsPageConfigMap = {};

  Object.entries(input).forEach(([pageId, rawPage]) => {
    if (!isPlainRecord(rawPage)) return;

    const normalizedPage: CmsPageConfigMap[string] = {};

    if (isPlainRecord(rawPage.blocks)) {
      const blocks: NonNullable<CmsPageConfigMap[string]["blocks"]> = {};

      Object.entries(rawPage.blocks).forEach(([blockId, rawBlock]) => {
        if (!isPlainRecord(rawBlock)) return;

        const block: NonNullable<NonNullable<CmsPageConfigMap[string]["blocks"]>[string]> = {};
        if (typeof rawBlock.enabled === "boolean") block.enabled = rawBlock.enabled;
        if (typeof rawBlock.order === "number" && Number.isFinite(rawBlock.order)) block.order = rawBlock.order;
        if (typeof rawBlock.className === "string") block.className = rawBlock.className;

        if (isPlainRecord(rawBlock.style)) {
          const style: Record<string, string | number> = {};
          Object.entries(rawBlock.style).forEach(([styleKey, styleValue]) => {
            if (typeof styleValue === "string" || typeof styleValue === "number") {
              style[styleKey] = styleValue;
            }
          });
          block.style = style;
        }

        blocks[blockId] = block;
      });

      normalizedPage.blocks = blocks;
    }

    if (isPlainRecord(rawPage.text)) {
      const text: Record<string, string> = {};
      Object.entries(rawPage.text).forEach(([textKey, textValue]) => {
        if (typeof textValue === "string") {
          text[textKey] = textValue;
        }
      });
      normalizedPage.text = text;
    }

    if (isPlainRecord(rawPage.meta)) {
      const meta: { title?: string; description?: string } = {};
      if (typeof rawPage.meta.title === "string") meta.title = rawPage.meta.title;
      if (typeof rawPage.meta.description === "string") meta.description = rawPage.meta.description;
      normalizedPage.meta = meta;
    }

    out[pageId] = normalizedPage;
  });

  return out;
}

function useDestinationDetailCmsHelpers(globalSettings: DestinationGlobalSetting[]) {
  return useMemo(() => {
    const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});

    const textOverrides = normalizeTextOverrides(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    );
    const pageConfigs = normalizePageConfigs(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
    );
    const pageConfig = pageConfigs["destination-detail"] ?? {};
    const blocks = pageConfig.blocks ?? {};
    const pageText = pageConfig.text ?? {};

    const isBlockEnabled = (blockId: string, fallback = true) => {
      const configured = blocks[blockId]?.enabled;
      return typeof configured === "boolean" ? configured : fallback;
    };

    const getBlockClassName = (blockId: string) => {
      const className = blocks[blockId]?.className;
      return typeof className === "string" ? className : "";
    };

    const getBlockStyle = (blockId: string): CSSProperties => {
      const style = blocks[blockId]?.style;
      if (!style || typeof style !== "object") return {};
      return style as CSSProperties;
    };

    const getText = (textKey: string, fallback: string) =>
      pageText[textKey] ??
      textOverrides[`destination-detail.${textKey}`] ??
      textOverrides[textKey] ??
      fallback;

    return {
      getText,
      isBlockEnabled,
      getBlockClassName,
      getBlockStyle,
    };
  }, [globalSettings]);
}

function DestinationDetailCmsBlock({
  blockId,
  children,
  className,
  style,
  as: Component = "div",
  defaultEnabled = true,
  cms,
}: {
  blockId: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  defaultEnabled?: boolean;
  cms: ReturnType<typeof useDestinationDetailCmsHelpers>;
}) {
  if (!cms.isBlockEnabled(blockId, defaultEnabled)) {
    return null;
  }

  return (
    <Component
      data-cms-page="destination-detail"
      data-cms-block={blockId}
      className={[className, cms.getBlockClassName(blockId)].filter(Boolean).join(" ")}
      style={{ ...style, ...cms.getBlockStyle(blockId) }}
    >
      {children}
    </Component>
  );
}

function resolveStaticImageSrc(value?: string | { src: string } | null) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.src;
}

function resolveRegionImage(region: DestinationRegion) {
  const fallbackRegionImage = getRegionImageSet(region.slug, { includeAliases: true });
  return resolveStaticImageSrc(
    region.hero_image_url || region.image_url || fallbackRegionImage?.image || null,
  );
}

async function fetchRegionBySlug(slug: string, locale: PublicContentLocale) {
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", slug)
    .or("is_active.eq.true,is_visible_destinations.eq.true")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (locale === "en") return data as DestinationRegion;

  const [translation] = await fetchRegionTranslations(locale, [data.id]);
  if (!translation) {
    return data as DestinationRegion;
  }

  return {
    ...data,
    name: translation.name?.trim() || data.name,
    short_description: translation.short_description?.trim() || data.short_description,
    description: translation.description?.trim() || data.description,
  } as DestinationRegion;
}

async function fetchRegionCities(regionId: string, locale: PublicContentLocale) {
  const { data, error } = await supabase
    .from("city_region_mapping")
    .select("city:cities(*)")
    .eq("region_id", regionId);

  if (error) throw error;

  const cities = (data ?? [])
    .map((row) => row.city as unknown as DestinationCity | null)
    .filter((city): city is DestinationCity => Boolean(city));

  if (locale === "en" || cities.length === 0) {
    return cities;
  }

  const translations = await fetchCityTranslations(
    locale,
    cities.map((city) => city.id),
  );
  const translationMap = new Map(
    translations.map((translation) => [translation.city_id, translation]),
  );

  return cities.map((city) => {
    const translation = translationMap.get(city.id);
    return {
      ...city,
      name: translation?.name?.trim() || city.name,
      short_description: translation?.short_description?.trim() || city.short_description,
      description: translation?.description?.trim() || city.description,
    };
  });
}

async function fetchRegionListings(regionId: string, locale: PublicContentLocale) {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      ${PUBLIC_LISTING_FIELDS},
      city:cities(${PUBLIC_CITY_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS})
    `)
    .eq("region_id", regionId)
    .eq("status", "published")
    .order("is_curated", { ascending: false })
    .order("tier", { ascending: false })
    .limit(24);

  if (error) throw error;

  const listings = (data ?? []) as unknown as DestinationListing[];
  if (locale === "en" || listings.length === 0) {
    return listings;
  }

  const [listingTranslations, cityTranslations] = await Promise.all([
    fetchListingTranslations(locale, listings.map((listing) => listing.id)),
    fetchCityTranslations(
      locale,
      listings.map((listing) => listing.city?.id).filter(Boolean) as string[],
    ),
  ]);

  const listingTranslationMap = new Map(
    listingTranslations.map((translation) => [translation.listing_id, translation]),
  );
  const cityTranslationMap = new Map(
    cityTranslations.map((translation) => [translation.city_id, translation]),
  );

  return listings.map((listing) => {
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
          }
        : listing.city,
    };
  });
}

async function fetchCuratedRegionAssignments(regionId: string, limit: number) {
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

  let listings = (regionAssignments ?? [])
    .map((assignment) => {
      const item = Array.isArray(assignment.listing) ? assignment.listing[0] : assignment.listing;
      return item as unknown as DestinationCuratedListing | null;
    })
    .filter(
      (listing): listing is DestinationCuratedListing =>
        listing != null && listing.status === "published" && listing.tier === "signature",
    );

  if (listings.length === 0) {
    const { data: homepageAssignments, error: homepageError } = await supabase
      .from("curated_assignments")
      .select(select)
      .eq("context_type", "homepage")
      .order("display_order", { ascending: true })
      .limit(limit);

    if (homepageError) throw homepageError;

    listings = (homepageAssignments ?? [])
      .map((assignment) => {
        const item = Array.isArray(assignment.listing) ? assignment.listing[0] : assignment.listing;
        return item as unknown as DestinationCuratedListing | null;
      })
      .filter(
        (listing): listing is DestinationCuratedListing =>
          listing != null && listing.status === "published" && listing.tier === "signature",
      );
  }

  return listings.slice(0, limit);
}

async function fetchDestinationGlobalSettings() {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...DESTINATION_DETAIL_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DestinationGlobalSetting[];
}

function DestinationDetailClientInner({
  initialRegion,
  initialCities,
  initialListings,
  initialCuratedListings,
  initialGlobalSettings,
}: DestinationDetailClientProps) {
  const { t, i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);

  const { data: region, isLoading: regionLoading } = useQuery({
    queryKey: ["region", initialRegion.slug, locale],
    queryFn: () => fetchRegionBySlug(initialRegion.slug, locale),
    initialData: locale === "en" ? initialRegion : undefined,
    enabled: Boolean(initialRegion.slug),
    staleTime: 1000 * 60 * 10,
  });

  const { data: regionCities = locale === "en" ? initialCities : [], isLoading: citiesLoading } =
    useQuery({
      queryKey: ["region-cities", region?.id, locale],
      queryFn: () => {
        if (!region?.id) return Promise.resolve([] as DestinationCity[]);
        return fetchRegionCities(region.id, locale);
      },
      initialData: locale === "en" ? initialCities : undefined,
      enabled: Boolean(region?.id),
      staleTime: 1000 * 60 * 10,
    });

  const { data: listings = locale === "en" ? initialListings : [], isLoading: listingsLoading } =
    useQuery({
      queryKey: ["region-listings", region?.id, locale],
      queryFn: () => {
        if (!region?.id) return Promise.resolve([] as DestinationListing[]);
        return fetchRegionListings(region.id, locale);
      },
      initialData: locale === "en" ? initialListings : undefined,
      enabled: Boolean(region?.id),
      staleTime: 1000 * 60 * 5,
    });

  useQuery({
    queryKey: ["curated-assignments", "region", region?.id, 3],
    queryFn: () => {
      if (!region?.id) return Promise.resolve([] as DestinationCuratedListing[]);
      return fetchCuratedRegionAssignments(region.id, 3);
    },
    initialData:
      region?.id === initialRegion.id ? initialCuratedListings.slice(0, 3) : undefined,
    enabled: Boolean(region?.id),
    staleTime: 1000 * 60,
  });

  const { data: globalSettings = initialGlobalSettings } = useQuery({
    queryKey: ["global-settings", [...DESTINATION_DETAIL_CMS_KEYS].sort()],
    queryFn: fetchDestinationGlobalSettings,
    initialData: initialGlobalSettings,
    staleTime: 1000 * 60 * 5,
  });

  const cms = useDestinationDetailCmsHelpers(globalSettings);

  if (regionLoading || citiesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[calc(8rem+10px)] pb-20 text-center app-container">
          <h1 className="text-title font-serif text-foreground mb-4">
            {cms.getText("notFound.title", "Destination Not Found")}
          </h1>
          <p className="text-body text-muted-foreground mb-8">
            {cms.getText("notFound.description", "The destination you're looking for doesn't exist.")}
          </p>
          <LocalizedLink
            href="/destinations"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {cms.getText("notFound.back", "Back to Destinations")}
          </LocalizedLink>
        </div>
        <Footer />
      </div>
    );
  }

  const resolvedRegionImage = resolveRegionImage(region);

  return (
    <div className="min-h-screen bg-background" data-cms-page="destination-detail">
      <Header />

      {cms.isBlockEnabled("hero", true) ? (
        <DestinationDetailCmsBlock
          blockId="hero"
          as="section"
          cms={cms}
          className="relative pt-[calc(6rem+10px)] pb-16 lg:pt-[calc(8rem+10px)] lg:pb-24 overflow-hidden"
        >
          <div className="absolute inset-0">
            {resolvedRegionImage ? (
              <Image
                src={resolvedRegionImage}
                alt={region.name}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25" />
          </div>

          <div className="relative app-container content-max">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <LocalizedLink
                href="/destinations"
                className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {cms.getText("hero.backToDestinations", "Back to Destinations")}
              </LocalizedLink>
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase mb-4"
            >
              {cms.getText("hero.badge", "Premium Region")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-hero font-serif font-medium text-white mb-6"
            >
              {region.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-body text-white/85 readable mb-8"
            >
              {region.description || region.short_description}
            </motion.p>

            {regionCities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                {regionCities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/city/${city.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-sm text-white hover:bg-black/35 hover:border-white/30 transition-colors tap-target"
                  >
                    <MapPin className="w-3 h-3 text-primary" />
                    {city.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        </DestinationDetailCmsBlock>
      ) : null}

      {cms.isBlockEnabled("curated", true) ? (
        <DestinationDetailCmsBlock blockId="curated" cms={cms}>
          <CuratedExcellence context={{ type: "region", regionId: region.id }} limit={3} />
        </DestinationDetailCmsBlock>
      ) : null}

      {cms.isBlockEnabled("listings", true) ? (
        <DestinationDetailCmsBlock
          blockId="listings"
          as="section"
          cms={cms}
          className="py-16 lg:py-24"
        >
          <div className="app-container content-max density">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-title font-serif font-medium text-foreground">
                  {cms.getText("listings.title", "Explore {{region}}").replace("{{region}}", region.name)}
                </h2>
                <p className="mt-2 text-body text-muted-foreground">
                  {cms
                    .getText("listings.count", "{{count}} premium listings in this region")
                    .replace("{{count}}", String(listings.length))}
                </p>
              </div>
            </motion.div>

            {listingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length > 0 ? (
              <div className="grid-adaptive grid-ultrawide">
                {listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Link href={`/listing/${listing.slug}`} className="group block h-full">
                      <article className="luxury-card overflow-hidden flex flex-col h-full hoverable">
                        {listing.tier === "signature" && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                          />
                        )}

                        <div className="relative aspect-[4/3] overflow-hidden">
                          <ImageWithFallback
                            src={listing.featured_image_url ?? undefined}
                            alt={listing.name}
                            containerClassName="w-full h-full"
                            fallbackIconSize={48}
                            className="transition-transform duration-500 group-hover:scale-105"
                          />

                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            <ListingTierBadge tier={listing.tier} />
                          </div>

                          {listing.google_rating && (
                            <GoogleRatingBadge
                              rating={listing.google_rating}
                              reviewCount={listing.google_review_count}
                              variant="overlay"
                              size="sm"
                              className="absolute top-3 right-3"
                            />
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 text-caption text-muted-foreground mb-2">
                            <span>
                              {translateCategoryName(t, listing.category?.slug, listing.category?.name)}
                            </span>
                            {listing.city && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {listing.city.name}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="min-h-[3.35rem] font-serif text-lg font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {listing.name}
                          </h3>

                          <p className="min-h-[3.2rem] text-caption text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {listing.short_description || listing.description}
                          </p>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                            <span className="text-sm font-medium text-primary">
                              {cms.getText("listings.viewDetails", "View Details")}
                            </span>
                            <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-title font-serif text-foreground mb-2">
                  {cms.getText("listings.emptyTitle", "No Listings Yet")}
                </h3>
                <p className="text-body text-muted-foreground mb-6">
                  {cms.getText(
                    "listings.emptyDescription",
                    "We're selecting the finest experiences for this region.",
                  )}
                </p>
                <LocalizedLink
                  href="/destinations"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  {cms.getText("listings.emptyCta", "Explore Other Destinations")}
                  <ArrowRight className="w-4 h-4" />
                </LocalizedLink>
              </div>
            )}
          </div>
        </DestinationDetailCmsBlock>
      ) : null}

      {cms.isBlockEnabled("faq", true) ? (
        <DestinationDetailCmsBlock
          blockId="faq"
          as="section"
          cms={cms}
          className="py-16 lg:py-24 bg-card"
        >
          <div className="app-container text-center" style={{ maxWidth: "56rem" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-title font-serif font-medium text-foreground mb-4">
                {cms.getText("faq.title", "Explore More Destinations")}
              </h2>
              <p className="text-body text-muted-foreground mb-8 readable mx-auto">
                {cms.getText(
                  "faq.description",
                  "Discover other prestigious regions across the Algarve",
                )}
              </p>
              <LocalizedLink
                href="/destinations"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors tap-target"
              >
                {cms.getText("faq.cta", "View All Destinations")}
                <ArrowRight className="w-4 h-4" />
              </LocalizedLink>
            </motion.div>
          </div>
        </DestinationDetailCmsBlock>
      ) : null}

      <Footer />
    </div>
  );
}

export function DestinationDetailClient(props: DestinationDetailClientProps) {
  useEffect(() => {
    const serverShell = document.getElementById("destination-detail-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }

    return () => {
      if (serverShell) {
        serverShell.style.display = "";
      }
    };
  }, []);

  return <DestinationDetailClientInner {...props} />;
}
