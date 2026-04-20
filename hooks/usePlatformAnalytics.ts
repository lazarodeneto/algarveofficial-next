"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { TimeRange } from "@/components/admin/analytics/TimeRangeSelector";

export type AnalyticsFilters = {
  timeRange: TimeRange;
  cityId?: string;
  categoryId?: string;
  tier?: "signature" | "verified" | "unverified" | "all";
};

type ListingLite = {
  id: string;
  name: string;
  tier: string;
  city_id: string | null;
  category_id: string | null;
  view_count: number | null;
};

type EventLite = {
  event_type: string;
  listing_id: string | null;
  event_data: unknown;
  session_id: string | null;
  created_at: string;
};

type DailyLite = {
  listing_id: string | null;
  views: number;
  favorites: number;
  inquiries: number;
  date: string;
};

type NamedMetric = {
  id?: string;
  name: string;
  views: number;
  clicks: number;
  ctr: number;
  engagementRate: number;
};

type BlockMetric = {
  blockId: string;
  impressions: number;
  clicks: number;
  ctr: number;
};

type PositionMetric = {
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
};

type SelectionMetric = {
  selection: "manual" | "tier-driven" | "hybrid" | "unknown";
  clicks: number;
  impressions: number;
  engagementRate: number;
};

type TierMetric = {
  tier: "signature" | "verified" | "unverified";
  views: number;
  clicks: number;
  ctr: number;
  visibilityShare: number;
  clickShare: number;
};

export type PlatformAnalyticsData = {
  trafficOverview: {
    source: "ga" | "none";
    isGaConnected: boolean;
    gaError: string | null;
    totalUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDurationSec: number;
    topPages: Array<{ page: string; views: number }>;
    topCities: Array<{ city: string; views: number }>;
    topCategories: Array<{ category: string; views: number }>;
  };
  contentPerformance: {
    topCities: NamedMetric[];
    topCategories: NamedMetric[];
    topListings: NamedMetric[];
  };
  placementPerformance: {
    blockPerformance: BlockMetric[];
    positionPerformance: PositionMetric[];
    selectionModePerformance: SelectionMetric[];
  };
  monetizationInsights: {
    byTier: TierMetric[];
  };
};

type GaTrafficOverviewApiData = {
  connected: boolean;
  totalUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSec: number;
  topPages: Array<{ page: string; views: number }>;
  topCities: Array<{ city: string; views: number }>;
};

type GaTrafficOverviewApiResponse =
  | {
      ok: true;
      data: GaTrafficOverviewApiData | null;
    }
  | {
      ok: false;
      error?: {
        code?: string;
        message?: string;
      };
    };

const KNOWN_BLOCKS = ["cities", "featured-city", "all-listings", "listings", "curated"] as const;

type KnownBlock = (typeof KNOWN_BLOCKS)[number];

type EventDataMap = Record<string, string | number | boolean | null>;

function getSinceIso(timeRange: TimeRange): string {
  const now = new Date();
  const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

function toEventDataMap(value: unknown): EventDataMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: EventDataMap = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean" || item === null) {
      out[key] = item;
    }
  }
  return out;
}

function asKnownBlock(value: unknown): KnownBlock | null {
  if (typeof value !== "string") return null;
  if ((KNOWN_BLOCKS as readonly string[]).includes(value)) return value as KnownBlock;
  return null;
}

function toSelection(value: unknown): SelectionMetric["selection"] {
  if (value === "manual" || value === "tier-driven" || value === "hybrid") {
    return value;
  }
  return "unknown";
}

function toPercent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 10000) / 100;
}

export function usePlatformAnalytics(filters: AnalyticsFilters) {
  const sinceIso = useMemo(() => getSinceIso(filters.timeRange), [filters.timeRange]);

  return useQuery({
    queryKey: ["admin-platform-analytics", filters, sinceIso],
    queryFn: async (): Promise<PlatformAnalyticsData> => {
      const [
        listingsResult,
        citiesResult,
        categoriesResult,
        eventsResult,
        dailyResult,
      ] = await Promise.all([
        supabase
          .from("listings")
          .select("id, name, tier, city_id, category_id, view_count")
          .eq("status", "published"),
        supabase.from("cities").select("id, name").eq("is_active", true),
        supabase.from("categories").select("id, name, slug").eq("is_active", true),
        supabase
          .from("analytics_events")
          .select("event_type, listing_id, event_data, session_id, created_at")
          .gte("created_at", sinceIso)
          .in("event_type", ["listing_click", "block_impression", "block_click"]),
        supabase
          .from("analytics_daily")
          .select("listing_id, views, favorites, inquiries, date")
          .gte("date", sinceIso.slice(0, 10)),
      ]);

      if (listingsResult.error) throw listingsResult.error;
      if (citiesResult.error) throw citiesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (dailyResult.error) throw dailyResult.error;

      const listings = (listingsResult.data ?? []) as ListingLite[];
      const events = (eventsResult.data ?? []) as EventLite[];
      const dailyRows = (dailyResult.data ?? []) as DailyLite[];

      const cityNameById = new Map((citiesResult.data ?? []).map((row) => [row.id, row.name]));
      const categoryNameById = new Map((categoriesResult.data ?? []).map((row) => [row.id, row.name]));
      const categorySlugById = new Map(
        (categoriesResult.data ?? []).map((row) => [row.id, row.slug]),
      );

      const filteredListings = listings.filter((listing) => {
        if (filters.cityId && listing.city_id !== filters.cityId) return false;
        if (filters.categoryId && listing.category_id !== filters.categoryId) return false;
        if (filters.tier && filters.tier !== "all" && listing.tier !== filters.tier) return false;
        return true;
      });
      const filteredListingIdSet = new Set(filteredListings.map((listing) => listing.id));

      const filteredDailyRows = dailyRows.filter(
        (row) => row.listing_id && filteredListingIdSet.has(row.listing_id),
      );

      const filteredEvents = events.filter((event) => {
        if (!event.listing_id) {
          return event.event_type === "block_impression" || event.event_type === "block_click";
        }
        return filteredListingIdSet.has(event.listing_id);
      });

      const viewsByListing = new Map<string, number>();
      for (const row of filteredDailyRows) {
        if (!row.listing_id) continue;
        viewsByListing.set(row.listing_id, (viewsByListing.get(row.listing_id) ?? 0) + (row.views ?? 0));
      }

      const clicksByListing = new Map<string, number>();
      const blockImpressions = new Map<KnownBlock, number>();
      const blockClicks = new Map<KnownBlock, number>();
      const positionClicks = new Map<number, number>();
      const selectionClicks = new Map<SelectionMetric["selection"], number>();
      const selectionImpressions = new Map<SelectionMetric["selection"], number>();

      for (const event of filteredEvents) {
        const eventData = toEventDataMap(event.event_data);
        const blockId = asKnownBlock(eventData.blockId);
        const selection = toSelection(eventData.selection);

        if (event.event_type === "listing_click") {
          if (event.listing_id) {
            clicksByListing.set(event.listing_id, (clicksByListing.get(event.listing_id) ?? 0) + 1);
          }

          if (blockId) {
            blockClicks.set(blockId, (blockClicks.get(blockId) ?? 0) + 1);
          }

          const positionRaw = eventData.position;
          if (typeof positionRaw === "number" && Number.isFinite(positionRaw) && positionRaw > 0) {
            const position = Math.floor(positionRaw);
            positionClicks.set(position, (positionClicks.get(position) ?? 0) + 1);
          }

          selectionClicks.set(selection, (selectionClicks.get(selection) ?? 0) + 1);
        }

        if (event.event_type === "block_click" && blockId) {
          blockClicks.set(blockId, (blockClicks.get(blockId) ?? 0) + 1);
          selectionClicks.set(selection, (selectionClicks.get(selection) ?? 0) + 1);
        }

        if (event.event_type === "block_impression") {
          if (blockId) {
            blockImpressions.set(blockId, (blockImpressions.get(blockId) ?? 0) + 1);
          }
          selectionImpressions.set(selection, (selectionImpressions.get(selection) ?? 0) + 1);
        }
      }

      const topCityStats = new Map<string, { views: number; clicks: number }>();
      const topCategoryStats = new Map<string, { views: number; clicks: number }>();
      const topListingStats: NamedMetric[] = [];

      for (const listing of filteredListings) {
        const listingViews = viewsByListing.get(listing.id) ?? listing.view_count ?? 0;
        const listingClicks = clicksByListing.get(listing.id) ?? 0;

        const cityName = cityNameById.get(listing.city_id ?? "") ?? "Unknown";
        const categoryName = categoryNameById.get(listing.category_id ?? "") ?? "Uncategorized";

        const cityStats = topCityStats.get(cityName) ?? { views: 0, clicks: 0 };
        cityStats.views += listingViews;
        cityStats.clicks += listingClicks;
        topCityStats.set(cityName, cityStats);

        const categoryStats = topCategoryStats.get(categoryName) ?? { views: 0, clicks: 0 };
        categoryStats.views += listingViews;
        categoryStats.clicks += listingClicks;
        topCategoryStats.set(categoryName, categoryStats);

        topListingStats.push({
          id: listing.id,
          name: listing.name,
          views: listingViews,
          clicks: listingClicks,
          ctr: toPercent(listingClicks, listingViews),
          engagementRate: toPercent(listingClicks, listingViews),
        });
      }

      const toNamedMetrics = (input: Map<string, { views: number; clicks: number }>): NamedMetric[] =>
        Array.from(input.entries())
          .map(([name, metrics]) => ({
            name,
            views: metrics.views,
            clicks: metrics.clicks,
            ctr: toPercent(metrics.clicks, metrics.views),
            engagementRate: toPercent(metrics.clicks, metrics.views),
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

      const blockPerformance: BlockMetric[] = KNOWN_BLOCKS.map((blockId) => {
        const impressions = blockImpressions.get(blockId) ?? 0;
        const clicks = blockClicks.get(blockId) ?? 0;
        return {
          blockId,
          impressions,
          clicks,
          ctr: toPercent(clicks, impressions),
        };
      });

      const totalBlockImpressions = blockPerformance.reduce((sum, row) => sum + row.impressions, 0);
      const positionPerformance: PositionMetric[] = Array.from(positionClicks.entries())
        .map(([position, clicks]) => ({
          position,
          clicks,
          impressions: totalBlockImpressions,
          ctr: toPercent(clicks, totalBlockImpressions),
        }))
        .sort((a, b) => a.position - b.position)
        .slice(0, 10);

      const selectionSet = ["manual", "tier-driven", "hybrid", "unknown"] as const;
      const selectionModePerformance: SelectionMetric[] = selectionSet.map((selection) => {
        const clicks = selectionClicks.get(selection) ?? 0;
        const impressions = selectionImpressions.get(selection) ?? 0;
        return {
          selection,
          clicks,
          impressions,
          engagementRate: toPercent(clicks, impressions),
        };
      });

      const tierViews: Record<TierMetric["tier"], number> = {
        signature: 0,
        verified: 0,
        unverified: 0,
      };
      const tierClicks: Record<TierMetric["tier"], number> = {
        signature: 0,
        verified: 0,
        unverified: 0,
      };

      for (const listing of filteredListings) {
        const tier = listing.tier === "signature" || listing.tier === "verified" ? listing.tier : "unverified";
        tierViews[tier] += viewsByListing.get(listing.id) ?? listing.view_count ?? 0;
        tierClicks[tier] += clicksByListing.get(listing.id) ?? 0;
      }

      const totalViews = tierViews.signature + tierViews.verified + tierViews.unverified;
      const totalClicks = tierClicks.signature + tierClicks.verified + tierClicks.unverified;
      const byTier: TierMetric[] = (["signature", "verified", "unverified"] as const).map((tier) => ({
        tier,
        views: tierViews[tier],
        clicks: tierClicks[tier],
        ctr: toPercent(tierClicks[tier], tierViews[tier]),
        visibilityShare: toPercent(tierViews[tier], totalViews),
        clickShare: toPercent(tierClicks[tier], totalClicks),
      }));

      const topCategories = toNamedMetrics(topCategoryStats).map((row) => ({ category: row.name, views: row.views }));

      let gaTrafficOverview: GaTrafficOverviewApiData | null = null;
      let gaErrorMessage: string | null = null;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          const params = new URLSearchParams({
            timeRange: filters.timeRange,
          });

          if (filters.cityId) {
            const cityName = cityNameById.get(filters.cityId);
            if (cityName) params.set("city", cityName);
          }

          if (filters.categoryId) {
            const categorySlug = categorySlugById.get(filters.categoryId);
            if (categorySlug) params.set("categorySlug", categorySlug);
          }

          const gaResponse = await fetch(`/api/admin/analytics/ga?${params.toString()}`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          const payload = (await gaResponse.json().catch(() => null)) as
            | GaTrafficOverviewApiResponse
            | null;

          if (gaResponse.ok) {
            if (payload?.ok && payload.data?.connected) {
              gaTrafficOverview = payload.data;
            } else if (payload && !payload.ok) {
              gaErrorMessage = payload.error?.message ?? "Google Analytics API request failed.";
            } else {
              gaErrorMessage =
                "Google Analytics API returned no connected data for the current account/configuration.";
            }
          } else {
            gaErrorMessage =
              payload && !payload.ok
                ? payload.error?.message ?? `Google Analytics API request failed (${gaResponse.status}).`
                : `Google Analytics API request failed (${gaResponse.status}).`;
          }
        } else {
          gaErrorMessage = "No authenticated admin/editor session found for GA API request.";
        }
      } catch (gaError) {
        gaErrorMessage =
          gaError instanceof Error
            ? gaError.message
            : "Unexpected Google Analytics connection error.";
      }

      const isGaConnected = Boolean(gaTrafficOverview?.connected);

      if (!isGaConnected) {
        return {
          trafficOverview: {
            source: "none",
            isGaConnected: false,
            gaError: gaErrorMessage,
            totalUsers: 0,
            sessions: 0,
            pageViews: 0,
            avgSessionDurationSec: 0,
            topPages: [],
            topCities: [],
            topCategories: [],
          },
          contentPerformance: {
            topCities: [],
            topCategories: [],
            topListings: [],
          },
          placementPerformance: {
            blockPerformance: [],
            positionPerformance: [],
            selectionModePerformance: [],
          },
          monetizationInsights: {
            byTier: [],
          },
        };
      }

      return {
        trafficOverview: {
          source: "ga",
          isGaConnected: true,
          gaError: null,
          totalUsers: gaTrafficOverview?.totalUsers ?? 0,
          sessions: gaTrafficOverview?.sessions ?? 0,
          pageViews: gaTrafficOverview?.pageViews ?? 0,
          avgSessionDurationSec: gaTrafficOverview?.avgSessionDurationSec ?? 0,
          topPages: gaTrafficOverview?.topPages?.length ? gaTrafficOverview.topPages : [],
          topCities: gaTrafficOverview?.topCities?.length ? gaTrafficOverview.topCities : [],
          topCategories,
        },
        contentPerformance: {
          topCities: toNamedMetrics(topCityStats),
          topCategories: toNamedMetrics(topCategoryStats),
          topListings: topListingStats
            .sort((a, b) => b.views - a.views)
            .slice(0, 10),
        },
        placementPerformance: {
          blockPerformance,
          positionPerformance,
          selectionModePerformance,
        },
        monetizationInsights: {
          byTier,
        },
      };
    },
    staleTime: 60 * 1000,
  });
}
