"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, MapPin, Loader2, Crown } from "lucide-react";

import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { GoogleRatingBadge } from "@/components/ui/google-rating-badge";
import { CuratedExcellence } from "@/components/sections/CuratedExcellence";
import ListingTierBadge from "@/components/ui/ListingTierBadge";
import {
  CMS_GLOBAL_SETTING_KEYS,
  normalizeCmsPageConfigs,
  type CmsTextOverrideMap,
} from "@/lib/cms/pageBuilderRegistry";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import {
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";

export type CityDetailCity = Tables<"cities">;
export type CityDetailRegion = Pick<
  Tables<"regions">,
  | "id"
  | "name"
  | "slug"
  | "short_description"
  | "description"
  | "image_url"
  | "hero_image_url"
>;
export type CityDetailGlobalSetting = Pick<Tables<"global_settings">, "key" | "value" | "category">;

type CityCategorySummary = Pick<Tables<"categories">, "id" | "name" | "slug" | "icon">;
type CitySummary = Pick<
  Tables<"cities">,
  "id" | "name" | "slug" | "short_description" | "image_url" | "latitude" | "longitude"
>;
type RegionSummary = Pick<Tables<"regions">, "id" | "name" | "slug" | "short_description" | "image_url">;

type ListingBase = Pick<
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

export type CityDetailListing = ListingBase & {
  category?: CityCategorySummary | null;
};

export type CityDetailCuratedListing = ListingBase & {
  city?: CitySummary | null;
  region?: RegionSummary | null;
  category?: CityCategorySummary | null;
};

export interface CityDetailClientProps {
  initialCity: CityDetailCity;
  initialRegion: CityDetailRegion | null;
  initialListings: CityDetailListing[];
  initialCuratedListings: CityDetailCuratedListing[];
  initialGlobalSettings: CityDetailGlobalSetting[];
}

const CITY_DETAIL_CMS_KEYS = [
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
const CITY_DETAIL_CITY_FIELDS = `
  id, name, slug, short_description, description, image_url, hero_image_url, latitude, longitude,
  is_active, is_featured, display_order, created_at
`;
const PUBLIC_REGION_FIELDS =
  "id, name, slug, short_description, description, image_url, hero_image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon";

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

function useCityDetailCmsHelpers(globalSettings: CityDetailGlobalSetting[]) {
  return useMemo(() => {
    const settingMap = globalSettings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value ?? "";
      return acc;
    }, {});

    const textOverrides = normalizeTextOverrides(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.textOverrides], {}),
    );
    const pageConfigs = normalizeCmsPageConfigs(
      parseJsonSetting(settingMap[CMS_GLOBAL_SETTING_KEYS.pageConfigs], {}),
    );
    const pageConfig = pageConfigs["city-detail"] ?? {};
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
      textOverrides[`city-detail.${textKey}`] ??
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

function CityDetailCmsBlock({
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
  cms: ReturnType<typeof useCityDetailCmsHelpers>;
}) {
  if (!cms.isBlockEnabled(blockId, defaultEnabled)) {
    return null;
  }

  return (
    <Component
      data-cms-page="city-detail"
      data-cms-block={blockId}
      className={[className, cms.getBlockClassName(blockId)].filter(Boolean).join(" ")}
      style={{ ...style, ...cms.getBlockStyle(blockId) }}
    >
      {children}
    </Component>
  );
}

async function fetchCityBySlug(slug: string, locale: PublicContentLocale) {
  const { data, error } = await supabase
    .from("cities")
    .select(CITY_DETAIL_CITY_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (locale === "en") return data as CityDetailCity;

  const [translation] = await fetchCityTranslations(locale, [data.id]);
  if (!translation) return data as CityDetailCity;

  return {
    ...data,
    name: translation.name?.trim() || data.name,
    short_description: translation.short_description?.trim() || data.short_description,
    description: translation.description?.trim() || data.description,
  } as CityDetailCity;
}

async function fetchCityRegion(cityId: string, locale: PublicContentLocale) {
  const { data, error } = await supabase
    .from("city_region_mapping")
    .select(`region:regions(${PUBLIC_REGION_FIELDS})`)
    .eq("city_id", cityId)
    .eq("is_primary", true)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  const rawRegion = data?.region;
  const region = (
    Array.isArray(rawRegion) ? rawRegion[0] : rawRegion
  ) as CityDetailRegion | null;
  if (!region || locale === "en") return region;

  const [translation] = await fetchRegionTranslations(locale, [region.id]);
  if (!translation) return region;

  return {
    ...region,
    name: translation.name?.trim() || region.name,
    short_description: translation.short_description?.trim() || region.short_description,
    description: translation.description?.trim() || region.description,
  } as CityDetailRegion;
}

async function fetchCityListings(cityId: string, locale: PublicContentLocale) {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      ${PUBLIC_LISTING_FIELDS},
      category:categories(${PUBLIC_CATEGORY_FIELDS})
    `)
    .eq("city_id", cityId)
    .eq("status", "published")
    .order("is_curated", { ascending: false })
    .order("tier", { ascending: false })
    .limit(24);

  if (error) throw error;

  const listings = (data ?? []) as unknown as CityDetailListing[];
  if (locale === "en" || listings.length === 0) {
    return listings;
  }

  const translations = await fetchListingTranslations(
    locale,
    listings.map((listing) => listing.id),
  );
  const translationMap = new Map(
    translations.map((translation) => [translation.listing_id, translation]),
  );

  return listings.map((listing) => {
    const translation = translationMap.get(listing.id);
    return {
      ...listing,
      name: translation?.title?.trim() || listing.name,
      short_description: translation?.short_description?.trim() || listing.short_description,
      description: translation?.description?.trim() || listing.description,
    };
  });
}

async function fetchCuratedCityAssignments(cityId: string, limit: number) {
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

  const { data: cityAssignments, error: cityError } = await supabase
    .from("curated_assignments")
    .select(select)
    .eq("context_type", "city")
    .eq("context_id", cityId)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (cityError) throw cityError;

  let listings = (cityAssignments ?? [])
    .map((assignment) => {
      const item = Array.isArray(assignment.listing) ? assignment.listing[0] : assignment.listing;
      return item as unknown as CityDetailCuratedListing | null;
    })
    .filter(
      (listing): listing is CityDetailCuratedListing =>
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
        return item as unknown as CityDetailCuratedListing | null;
      })
      .filter(
        (listing): listing is CityDetailCuratedListing =>
          listing != null && listing.status === "published" && listing.tier === "signature",
      );
  }

  return listings.slice(0, limit);
}

async function fetchCityGlobalSettings() {
  const { data, error } = await supabase
    .from("global_settings")
    .select("key, value, category")
    .in("key", [...CITY_DETAIL_CMS_KEYS])
    .order("key", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CityDetailGlobalSetting[];
}

function CityDetailClientInner({
  initialCity,
  initialRegion,
  initialListings,
  initialCuratedListings,
  initialGlobalSettings,
}: CityDetailClientProps) {
  const { t } = useTranslation();
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const { isDestinationSaved, toggleCity } = useSavedDestinations();
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ["city", initialCity.slug ?? "", locale],
    queryFn: () => {
      if (!initialCity.slug) {
        throw new Error("City slug is required");
      }
      return fetchCityBySlug(initialCity.slug, locale);
    },
    initialData: locale === "en" ? initialCity : undefined,
    enabled: Boolean(initialCity.slug),
    staleTime: 1000 * 60 * 10,
  });

  const { data: cityRegion = locale === "en" ? initialRegion : null } = useQuery({
    queryKey: ["city-region", city?.id, locale],
    queryFn: () => {
      if (!city?.id) return Promise.resolve(null as CityDetailRegion | null);
      return fetchCityRegion(city.id, locale);
    },
    initialData: locale === "en" ? initialRegion : undefined,
    enabled: Boolean(city?.id),
    staleTime: 1000 * 60 * 10,
  });

  const { data: listings = locale === "en" ? initialListings : [], isLoading: listingsLoading } =
    useQuery({
      queryKey: ["city-listings", city?.id, locale],
      queryFn: () => {
        if (!city?.id) return Promise.resolve([] as CityDetailListing[]);
        return fetchCityListings(city.id, locale);
      },
      initialData: locale === "en" ? initialListings : undefined,
      enabled: Boolean(city?.id),
      staleTime: 1000 * 60 * 5,
    });

  useQuery({
    queryKey: ["curated-assignments", "city", city?.id, 3],
    queryFn: () => {
      if (!city?.id) return Promise.resolve([] as CityDetailCuratedListing[]);
      return fetchCuratedCityAssignments(city.id, 3);
    },
    initialData: city?.id === initialCity.id ? initialCuratedListings.slice(0, 3) : undefined,
    enabled: Boolean(city?.id),
    staleTime: 1000 * 60,
  });

  const { data: globalSettings = initialGlobalSettings } = useQuery({
    queryKey: ["global-settings", [...CITY_DETAIL_CMS_KEYS].sort()],
    queryFn: fetchCityGlobalSettings,
    initialData: initialGlobalSettings,
    staleTime: 1000 * 60 * 5,
  });

  const cms = useCityDetailCmsHelpers(globalSettings);

  if (cityLoading) {
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

  if (!city) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-[calc(8rem+10px)] pb-20 text-center app-container">
          <h1 className="text-title font-serif text-foreground mb-4">
            {cms.getText("notFound.title", t("notFound.title"))}
          </h1>
          <p className="text-body text-muted-foreground mb-8">
            {cms.getText("notFound.description", t("notFound.description"))}
          </p>
          <LocaleLink
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {cms.getText("notFound.back", t("notFound.backHome"))}
          </LocaleLink>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-cms-page="city-detail">
      <Header />
      {!cms.isBlockEnabled("hero", true) && <div className="h-[4.5rem] sm:h-20" aria-hidden="true" />}

      {cms.isBlockEnabled("hero", true) ? (
        <CityDetailCmsBlock
          blockId="hero"
          as="section"
          cms={cms}
          className="relative pt-[calc(6rem+10px)] pb-16 lg:pt-[calc(8rem+10px)] lg:pb-24 overflow-hidden"
        >
          {(city.hero_image_url || city.image_url) ? (
            <div className="absolute inset-0">
              <Image
                src={city.hero_image_url || city.image_url || ""}
                alt={city.name}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/80">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>

          <div className="relative app-container content-max">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex items-center justify-between"
            >
              <LocaleLink
                href="/#cities"
                className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {cms.getText("hero.backToCities", "Back to Cities")}
              </LocaleLink>

              <FavoriteButton
                isFavorite={city.slug ? isDestinationSaved("city", city.slug) : false}
                onToggle={() => {
                  if (city.id) {
                    toggleCity(city.id);
                  }
                }}
                size="lg"
                variant="glassmorphism"
              />
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary tracking-[0.3em] uppercase">
                {cms.getText("hero.badge", "Algarve, Portugal")}
              </span>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-hero font-serif font-medium text-white mb-6"
            >
              {city.name}
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-body text-white/85 readable mb-8"
            >
              {city.description ||
                cms
                  .getText(
                    "hero.descriptionFallback",
                    "Discover premium listings in {{city}}, one of the Algarve's most sought-after destinations.",
                  )
                  .replace("{{city}}", city.name)}
            </m.p>

            {cityRegion ? (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <LocaleLink
                  href={`/destinations/${cityRegion.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-sm text-white hover:bg-black/35 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  {cms
                    .getText("hero.regionTag", "Part of {{region}}")
                    .replace("{{region}}", cityRegion.name)}
                  <ArrowRight className="w-3 h-3" />
                </LocaleLink>
              </m.div>
            ) : null}
          </div>
        </CityDetailCmsBlock>
      ) : null}

      {cms.isBlockEnabled("curated", true) ? (
        <CityDetailCmsBlock blockId="curated" cms={cms}>
          <CuratedExcellence context={{ type: "city", cityId: city.id }} limit={3} />
        </CityDetailCmsBlock>
      ) : null}

      {cms.isBlockEnabled("listings", true) ? (
        <CityDetailCmsBlock
          blockId="listings"
          as="section"
          cms={cms}
          className="py-16 lg:py-24"
        >
          <div className="app-container content-max density">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-12"
            >
              <div>
                <h2 className="text-title font-serif font-medium text-foreground">
                  {cms.getText("listings.title", "Explore {{city}}").replace("{{city}}", city.name)}
                </h2>
                <p className="mt-2 text-body text-muted-foreground">
                  {cms
                    .getText("listings.count", "{{count}} premium listings in this city")
                    .replace("{{count}}", String(listings.length))}
                </p>
              </div>
            </m.div>

            {listingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : listings.length > 0 ? (
              <div className="grid-adaptive grid-ultrawide">
                {listings.map((listing, index) => (
                  <m.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <LocaleLink href={`/listing/${listing.slug}`} className="group block h-full">
                      <article className="luxury-card overflow-hidden flex flex-col h-full hoverable">
                        {listing.tier === "signature" ? (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]"
                          />
                        ) : null}

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

                          {listing.google_rating ? (
                            <GoogleRatingBadge
                              rating={listing.google_rating}
                              reviewCount={listing.google_review_count}
                              variant="overlay"
                              size="sm"
                              className="absolute top-3 right-3"
                            />
                          ) : null}

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs bg-black/60 backdrop-blur-sm">
                              {listing.category?.name}
                            </Badge>
                            <FavoriteButton
                              isFavorite={isFavorite(listing.id)}
                              onToggle={() => toggleFavorite(listing.id)}
                              size="sm"
                              variant="glassmorphism"
                            />
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
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
                    </LocaleLink>
                  </m.div>
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
                    "We're selecting the finest experiences for this city.",
                  )}
                </p>
                <LocaleLink
                  href="/"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  {cms.getText("listings.emptyCta", "Explore All Listings")}
                  <ArrowRight className="w-4 h-4" />
                </LocaleLink>
              </div>
            )}
          </div>
        </CityDetailCmsBlock>
      ) : null}

      {cms.isBlockEnabled("faq", true) ? (
        <CityDetailCmsBlock
          blockId="faq"
          as="section"
          cms={cms}
          className="py-16 lg:py-24 bg-card"
        >
          <div className="app-container text-center" style={{ maxWidth: "56rem" }}>
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-title font-serif font-medium text-foreground mb-4">
                {cms.getText("faq.title", "Explore More Cities")}
              </h2>
              <p className="text-body text-muted-foreground mb-8 readable mx-auto">
                {cms.getText("faq.description", "Discover other vibrant cities across the Algarve")}
              </p>
              <LocaleLink
                href="/#cities"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors tap-target"
              >
                {cms.getText("faq.cta", "View All Cities")}
                <ArrowRight className="w-4 h-4" />
              </LocaleLink>
            </m.div>
          </div>
        </CityDetailCmsBlock>
      ) : null}

      <Footer />
    </div>
  );
}

export function CityDetailClient(props: CityDetailClientProps) {
  useEffect(() => {
    const serverShell = document.getElementById("city-detail-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }

    return () => {
      if (serverShell) {
        serverShell.style.display = "";
      }
    };
  }, []);

  return <CityDetailClientInner {...props} />;
}
