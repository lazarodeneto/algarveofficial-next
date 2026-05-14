"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpenText,
  Compass,
  ExternalLink,
  Hash,
  MapPin,
  MapPinned,
  Route,
  Sparkles,
  Tag,
  Waves,
} from "lucide-react";

import { SharedListingCard } from "@/components/listing/SharedListingCard";
import type { MapListingPoint } from "@/components/map/ListingsLeafletMap";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useHydrated } from "@/hooks/useHydrated";
import { useLocalePath } from "@/hooks/useLocalePath";
import { buildCategoryHref, buildListingHref } from "@/lib/public-route-builders";
import { cn } from "@/lib/utils";

const ListingsLeafletMap = dynamic(
  () => import("@/components/map/ListingsLeafletMap").then((mod) => mod.ListingsLeafletMap),
  {
    ssr: false,
    loading: () => <BeachMapPlaceholder />,
  },
);

export interface BeachGuideListing {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  imageUrl: string | null;
  tier: string | null;
  isCurated: boolean;
  categorySlug: string | null;
  categoryName: string | null;
  categoryImageUrl: string | null;
  cityName: string | null;
  regionName: string | null;
  latitude: number | null;
  longitude: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  updatedAt: string | null;
}

interface BeachGuideListingsProps {
  listings: BeachGuideListing[];
}

interface ArticleRelatedCardsCopy {
  anchorId?: string;
  badgeLabel?: string;
  detailsLabel?: string;
  eyebrow?: string;
  title?: string;
}

export interface ArticleRelatedGuide {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  category: string | null;
  readingTime: number | null;
  tags: string[] | null;
}

interface ArticleRelatedGuidesProps {
  guides: ArticleRelatedGuide[];
  tags: string[];
}

const GUIDE_CATEGORY_LABELS: Record<string, string> = {
  events: "Events",
  "food-wine": "Food & wine",
  golf: "Golf",
  "insider-tips": "Insider tips",
  lifestyle: "Lifestyle",
  "real-estate": "Real estate",
  "travel-guides": "Travel guides",
  wellness: "Wellness",
};

function BeachMapPlaceholder() {
  return (
    <div className="flex min-h-[430px] w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
      Loading beach map...
    </div>
  );
}

function hasCoordinates(listing: BeachGuideListing) {
  return (
    typeof listing.latitude === "number" &&
    Number.isFinite(listing.latitude) &&
    typeof listing.longitude === "number" &&
    Number.isFinite(listing.longitude)
  );
}

function uniqueValues(values: Array<string | null>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function getGuideCategoryLabel(category: string | null) {
  if (!category) return "Guide";
  return GUIDE_CATEGORY_LABELS[category] ?? category.replace(/-/g, " ");
}

function useBeachGuideListingData(listings: BeachGuideListing[]) {
  const locale = useCurrentLocale();
  const l = useLocalePath();

  const mappedListings = useMemo(() => listings.filter(hasCoordinates), [listings]);
  const cityNames = useMemo(() => uniqueValues(listings.map((listing) => listing.cityName)), [listings]);
  const categoryHref = buildCategoryHref("beaches", locale);

  const mapPoints = useMemo<MapListingPoint[]>(() => {
    return mappedListings.map((listing) => ({
      id: listing.id,
      name: listing.name,
      latitude: listing.latitude as number,
      longitude: listing.longitude as number,
      slug: listing.slug,
      categorySlug: listing.categorySlug ?? "beaches",
      categoryName: listing.categoryName ?? "Beaches",
      categoryImageUrl: listing.categoryImageUrl,
      cityName: listing.cityName,
      tier: listing.tier,
      featuredImageUrl: listing.imageUrl,
      href: l(buildListingHref({ slug: listing.slug, id: listing.id })),
    }));
  }, [l, mappedListings]);

  return { categoryHref, cityNames, l, mappedListings, mapPoints };
}

export function ArticleRelatedGuides({ guides, tags }: ArticleRelatedGuidesProps) {
  const l = useLocalePath();
  const { t } = useTranslation();
  const visibleTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, 16);
  const visibleGuides = guides.slice(0, 3);
  const totalLinks = visibleTags.length + visibleGuides.length;
  const totalLinksLabel = t("blog.relatedGuidesLinkCount", {
    count: totalLinks,
    defaultValue: `${totalLinks} ${totalLinks === 1 ? "link" : "links"}`,
  });
  const tagsCountLabel = t("blog.relatedTagsCount", {
    count: visibleTags.length,
    defaultValue: `${visibleTags.length} ${visibleTags.length === 1 ? "link" : "links"}`,
  });
  const guidesCountLabel = t("blog.relatedReadNextCount", {
    count: visibleGuides.length,
    defaultValue: `${visibleGuides.length} ${visibleGuides.length === 1 ? "guide" : "guides"}`,
  });

  if (totalLinks === 0) return null;

  return (
    <section
      aria-labelledby="article-related-guides-title"
      className="my-10 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-sm sm:p-6 lg:p-7 ao-glass-tag-surface"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
            {t("blog.relatedGuidesEyebrow", "Explore more")}
          </p>
          <h2 id="article-related-guides-title" className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("blog.relatedGuidesTitle", "Related guides")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t(
              "blog.relatedGuidesDescription",
              "Continue with Algarve guides, quick tags, and useful context connected to this article.",
            )}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {totalLinksLabel}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleTags.length > 0 ? (
          <article className="ao-glass-tag-surface rounded-2xl p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex min-w-0 items-center gap-3">
              <span className="ao-tag-section-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                <Hash className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-semibold leading-tight text-foreground sm:text-xl">
                  {t("blog.relatedTagsTitle", "Related tags")}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {tagsCountLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {visibleTags.map((tag, index) => (
                <Link
                  key={`${tag}-${index}`}
                  href={l(`/blog?tag=${encodeURIComponent(tag)}`)}
                  aria-label={`${index + 1}. ${tag}`}
                  className="ao-glass-tag-chip group text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="ao-glass-tag-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="ao-glass-tag-label">{tag}</span>
                </Link>
              ))}
            </div>
          </article>
        ) : null}

        {visibleGuides.length > 0 ? (
          <article className="ao-glass-tag-surface rounded-2xl p-4 sm:p-5 lg:col-span-2">
            <div className="mb-4 flex min-w-0 items-center gap-3">
              <span className="ao-tag-section-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                <BookOpenText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-semibold leading-tight text-foreground sm:text-xl">
                  {t("blog.relatedReadNextTitle", "Read next")}
                </h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {guidesCountLabel}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {visibleGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={l(`/blog/${guide.slug}`)}
                  className="group overflow-hidden rounded-xl border border-border/70 bg-background/80 transition-colors hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {guide.featuredImage ? (
                      <img
                        src={guide.featuredImage}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <Tag className="h-6 w-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                      {getGuideCategoryLabel(guide.category)}
                    </p>
                    <h4 className="mt-2 line-clamp-2 font-serif text-lg font-semibold leading-tight text-foreground">
                      {guide.title}
                    </h4>
                    {guide.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {guide.excerpt}
                      </p>
                    ) : null}
                    {guide.readingTime ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {t("blog.relatedGuideReadTime", {
                          count: guide.readingTime,
                          defaultValue: `${guide.readingTime} min read`,
                        })}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

export function BeachGuideMap({
  listings,
  activeListingId,
  onListingSelect,
}: BeachGuideListingsProps & {
  activeListingId?: string | null;
  onListingSelect?: (listingId: string) => void;
}) {
  const hydrated = useHydrated();
  const { categoryHref, cityNames, mappedListings, mapPoints } = useBeachGuideListingData(listings);

  if (listings.length === 0) return null;

  return (
    <section
      aria-labelledby="beach-guide-listings-title"
      className="my-10 overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-[0_28px_90px_-58px_rgba(9,48,43,0.55)]"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative overflow-hidden bg-[linear-gradient(145deg,#0b2f35_0%,#0f5b52_58%,#d49b1f_145%)] p-6 text-white sm:p-8 lg:p-10">
          <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between gap-8">
            <div>
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/12 text-[#f4c95d] ring-1 ring-white/20">
                <Waves className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 id="beach-guide-listings-title" className="max-w-xl font-serif text-3xl font-medium leading-tight sm:text-4xl">
                Explore every published beach in this guide
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/78">
                Use the live map to scan the Algarve coast, then open each verified beach listing for photos, details, directions, and local context.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-semibold">{listings.length}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-white/65">Published</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-semibold">{mappedListings.length}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-white/65">Mapped</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-semibold">{cityNames.length}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-white/65">Cities</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              <Button asChild size="sm" className="bg-white text-slate-950 hover:bg-white">
                <Link href={categoryHref}>
                  <MapPinned className="h-4 w-4" aria-hidden="true" />
                  Browse beaches
                </Link>
              </Button>
              <a
                href="#beach-listing-cards"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Route className="h-4 w-4" aria-hidden="true" />
                Jump to cards
              </a>
            </div>
          </div>
        </div>

        <div className="min-h-[430px] bg-slate-100">
          {hydrated ? (
            <ListingsLeafletMap
              points={mapPoints}
              className="h-full rounded-none border-0"
              mapClassName="min-h-[430px] lg:min-h-[520px]"
              scrollWheelZoom={false}
              activeListingId={activeListingId}
              onListingSelect={onListingSelect}
              emptyMessage="No beach coordinates are available yet."
            />
          ) : (
            <BeachMapPlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}

export function BeachGuideRelatedCards({
  listings,
  activeListingId,
  onListingSelect,
  anchorId = "beach-listing-cards",
  badgeLabel,
  detailsLabel = "View beach details",
  eyebrow = "Related beach listings",
  title = "Beaches mentioned in this article",
}: BeachGuideListingsProps & {
  activeListingId?: string | null;
  onListingSelect?: (listingId: string) => void;
} & ArticleRelatedCardsCopy) {
  const { l, mappedListings } = useBeachGuideListingData(listings);

  if (listings.length === 0) return null;
  const resolvedBadgeLabel = badgeLabel ?? `${mappedListings.length} map pins`;

  return (
    <section
      aria-labelledby="beach-related-listings-title"
      className="my-10 overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-[0_28px_90px_-58px_rgba(9,48,43,0.4)]"
    >

      <div id={anchorId} className="border-t border-slate-200 bg-[#f7fbfa] p-5 sm:p-7 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-emerald-700">
              <Compass className="h-4 w-4" aria-hidden="true" />
              {eyebrow}
            </p>
            <h3 id="beach-related-listings-title" className="font-serif text-2xl font-medium text-slate-950 sm:text-3xl">
              {title}
            </h3>
          </div>
          <Badge className="w-fit rounded-md border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-50">
            {resolvedBadgeLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, index) => {
            const href = l(buildListingHref({ slug: listing.slug, id: listing.id }));
            const isActive = activeListingId === listing.id;

            return (
              <div
                key={listing.id}
                id={`listing-${listing.id}`}
                className={cn(
                  "scroll-mt-28 rounded-lg transition-all duration-200",
                  isActive ? "ring-2 ring-emerald-500 ring-offset-4 ring-offset-[#f7fbfa]" : "ring-0",
                )}
                onMouseEnter={() => onListingSelect?.(listing.id)}
                onFocus={() => onListingSelect?.(listing.id)}
              >
                <SharedListingCard
                  index={index}
                  href={href}
                  className="h-auto"
                  listing={{
                    id: listing.id,
                    name: listing.name,
                    short_description: listing.shortDescription,
                    featured_image_url: listing.imageUrl,
                    updated_at: listing.updatedAt,
                    tier: listing.tier,
                    google_rating: listing.googleRating,
                    google_review_count: listing.googleReviewCount,
                    is_curated: listing.isCurated,
                    category_slug: listing.categorySlug ?? "beaches",
                    category_name: listing.categoryName ?? "Beaches",
                    city_name: listing.cityName ?? "Algarve",
                    region_name: listing.regionName,
                  }}
                  showCuratedBadge
                  curatedLabel="Curated"
                />
                <Link
                  href={href}
                  className="relative z-10 mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
                >
                  {detailsLabel}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>

        {mappedListings.length < listings.length ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            {listings.length - mappedListings.length} published beach listings are included here but do not have map coordinates yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ArticleRelatedListingCards({
  listings,
  activeListingId,
  onListingSelect,
  ...copy
}: BeachGuideListingsProps & {
  activeListingId?: string | null;
  onListingSelect?: (listingId: string) => void;
} & ArticleRelatedCardsCopy) {
  return (
    <BeachGuideRelatedCards
      listings={listings}
      activeListingId={activeListingId}
      onListingSelect={onListingSelect}
      {...copy}
    />
  );
}

export function BeachGuideListings({ listings }: BeachGuideListingsProps) {
  const [activeListingId, setActiveListingId] = useState<string | null>(listings[0]?.id ?? null);

  return (
    <>
      <BeachGuideMap
        listings={listings}
        activeListingId={activeListingId}
        onListingSelect={setActiveListingId}
      />
      <BeachGuideRelatedCards
        listings={listings}
        activeListingId={activeListingId}
        onListingSelect={setActiveListingId}
      />
    </>
  );
}
