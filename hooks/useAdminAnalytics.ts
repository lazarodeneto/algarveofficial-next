"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OverviewKPIs {
  totalListings: number;
  publishedListings: number;
  pendingReview: number;
  totalUsers: number;
  vipMembers: number;
  activeOwners: number;
  totalFavorites: number;
  totalMessages: number;
  curatedListings: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface TopListing {
  id: string;
  name: string;
  tier: string;
  viewCount: number;
  favoriteCount: number;
}

// Fetch Overview KPIs
export function useOverviewKPIs() {
  return useQuery({
    queryKey: ["admin-analytics", "overview-kpis"],
    queryFn: async (): Promise<OverviewKPIs> => {
      // Run all queries in parallel
      const [
        listingsResult,
        publishedResult,
        pendingResult,
        usersResult,
        vipResult,
        ownersResult,
        favoritesResult,
        messagesResult,
        curatedResult,
      ] = await Promise.all([
        // Total listings
        supabase.from("listings").select("id", { count: "exact" }).limit(1),
        // Published listings
        supabase
          .from("listings")
          .select("id", { count: "exact" })
          .eq("status", "published")
          .limit(1),
        // Pending review
        supabase
          .from("listings")
          .select("id", { count: "exact" })
          .eq("status", "pending_review")
          .limit(1),
        // Total users (profiles)
        supabase.from("profiles").select("id", { count: "exact" }).limit(1),
        // VIP members (viewer_logged role)
        supabase
          .from("user_roles")
          .select("id", { count: "exact" })
          .eq("role", "viewer_logged")
          .limit(1),
        // Active owners (distinct owner_ids from listings)
        supabase.from("listings").select("owner_id"),
        // Total favorites
        supabase.from("favorites").select("id", { count: "exact" }).limit(1),
        // Total messages
        supabase.from("chat_messages").select("id", { count: "exact" }).limit(1),
        // Signature Selection (signature + is_curated)
        supabase
          .from("listings")
          .select("id", { count: "exact" })
          .eq("tier", "signature")
          .eq("is_curated", true)
          .limit(1),
      ]);

      // Count distinct owners
      const uniqueOwners = new Set(
        (ownersResult.data || []).map((l) => l.owner_id)
      );

      return {
        totalListings: listingsResult.count || 0,
        publishedListings: publishedResult.count || 0,
        pendingReview: pendingResult.count || 0,
        totalUsers: usersResult.count || 0,
        vipMembers: vipResult.count || 0,
        activeOwners: uniqueOwners.size,
        totalFavorites: favoritesResult.count || 0,
        totalMessages: messagesResult.count || 0,
        curatedListings: curatedResult.count || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch Tier Distribution
export function useTierDistribution() {
  return useQuery({
    queryKey: ["admin-analytics", "tier-distribution"],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const [signatureResult, verifiedResult, unverifiedResult] =
        await Promise.all([
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("tier", "signature")
            .limit(1),
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("tier", "verified")
            .limit(1),
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("tier", "unverified")
            .limit(1),
        ]);

      return [
        { name: "Signature", value: signatureResult.count || 0 },
        { name: "Verified", value: verifiedResult.count || 0 },
        { name: "Unverified", value: unverifiedResult.count || 0 },
      ];
    },
    staleTime: 30 * 1000,
  });
}

// Fetch Status Distribution
export function useStatusDistribution() {
  return useQuery({
    queryKey: ["admin-analytics", "status-distribution"],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const [publishedResult, pendingResult, draftResult, rejectedResult] =
        await Promise.all([
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("status", "published")
            .limit(1),
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("status", "pending_review")
            .limit(1),
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("status", "draft")
            .limit(1),
          supabase
            .from("listings")
            .select("id", { count: "exact" })
            .eq("status", "rejected")
            .limit(1),
        ]);

      return [
        { name: "Published", value: publishedResult.count || 0 },
        { name: "Pending Review", value: pendingResult.count || 0 },
        { name: "Draft", value: draftResult.count || 0 },
        { name: "Rejected", value: rejectedResult.count || 0 },
      ];
    },
    staleTime: 30 * 1000,
  });
}

// Fetch Top Listings by views
export function useTopListings(limit = 5) {
  return useQuery({
    queryKey: ["admin-analytics", "top-listings", limit],
    queryFn: async (): Promise<TopListing[]> => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, name, tier, view_count")
        .order("view_count", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get favorite counts for these listings
      const listingIds = (data || []).map((l) => l.id);
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select("listing_id")
        .in("listing_id", listingIds);

      // Count favorites per listing
      const favoriteCounts: Record<string, number> = {};
      (favoritesData || []).forEach((f) => {
        if (f.listing_id) {
          favoriteCounts[f.listing_id] = (favoriteCounts[f.listing_id] || 0) + 1;
        }
      });

      return (data || []).map((listing) => ({
        id: listing.id,
        name: listing.name,
        tier: listing.tier,
        viewCount: listing.view_count || 0,
        favoriteCount: favoriteCounts[listing.id] || 0,
      }));
    },
    staleTime: 30 * 1000,
  });
}

// ============= LISTINGS ANALYTICS =============
export interface ListingsAnalytics {
  byCategory: ChartDataPoint[];
  byCity: ChartDataPoint[];
  byRegion: ChartDataPoint[];
  recentListings: { id: string; name: string; createdAt: string; status: string; tier: string }[];
}

export function useListingsAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics", "listings"],
    queryFn: async (): Promise<ListingsAnalytics> => {
      const [listingsData, categoriesData, citiesData, regionsData] = await Promise.all([
        supabase
          .from("listings")
          .select("id, name, created_at, status, tier, category_id, city_id, region_id")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("categories").select("id, name"),
        supabase.from("cities").select("id, name"),
        supabase.from("regions").select("id, name"),
      ]);

      const listings = listingsData.data || [];
      const categories = categoriesData.data || [];
      const cities = citiesData.data || [];
      const regions = regionsData.data || [];

      // Create lookup maps
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const cityMap = new Map(cities.map(c => [c.id, c.name]));
      const regionMap = new Map(regions.map(r => [r.id, r.name]));

      // Count by category
      const categoryCount: Record<string, number> = {};
      listings.forEach(l => {
        const name = categoryMap.get(l.category_id) || "Uncategorized";
        categoryCount[name] = (categoryCount[name] || 0) + 1;
      });

      // Count by city
      const cityCount: Record<string, number> = {};
      listings.forEach(l => {
        const name = cityMap.get(l.city_id) || "Unknown";
        cityCount[name] = (cityCount[name] || 0) + 1;
      });

      // Count by region
      const regionCount: Record<string, number> = {};
      listings.forEach(l => {
        const name = l.region_id ? (regionMap.get(l.region_id) || "Other") : "No Region";
        regionCount[name] = (regionCount[name] || 0) + 1;
      });

      return {
        byCategory: Object.entries(categoryCount).map(([name, value]) => ({ name, value })),
        byCity: Object.entries(cityCount).map(([name, value]) => ({ name, value })),
        byRegion: Object.entries(regionCount).map(([name, value]) => ({ name, value })),
        recentListings: listings.slice(0, 5).map(l => ({
          id: l.id,
          name: l.name,
          createdAt: l.created_at,
          status: l.status,
          tier: l.tier,
        })),
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============= USERS ANALYTICS =============
export interface UsersAnalytics {
  byRole: ChartDataPoint[];
  recentUsers: { id: string; email: string; displayName: string | null; createdAt: string }[];
  totalAdmins: number;
  totalEditors: number;
  totalOwners: number;
  totalViewers: number;
}

export function useUsersAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics", "users"],
    queryFn: async (): Promise<UsersAnalytics> => {
      const [rolesData, profilesData] = await Promise.all([
        supabase.from("user_roles").select("user_id, role"),
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const roles = rolesData.data || [];
      const profiles = profilesData.data || [];

      // Count by role
      const roleCount: Record<string, number> = {
        admin: 0,
        editor: 0,
        owner: 0,
        viewer_logged: 0,
      };
      roles.forEach(r => {
        roleCount[r.role] = (roleCount[r.role] || 0) + 1;
      });

      return {
        byRole: [
          { name: "Admin", value: roleCount.admin },
          { name: "Editor", value: roleCount.editor },
          { name: "Owner", value: roleCount.owner },
          { name: "VIP Viewer", value: roleCount.viewer_logged },
        ],
        recentUsers: profiles.slice(0, 5).map(p => ({
          id: p.id,
          email: p.full_name || "Anonymous",
          displayName: p.full_name,
          createdAt: p.created_at,
        })),
        totalAdmins: roleCount.admin,
        totalEditors: roleCount.editor,
        totalOwners: roleCount.owner,
        totalViewers: roleCount.viewer_logged,
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============= MONETIZATION ANALYTICS =============
export interface MonetizationAnalytics {
  subscriptionsByTier: ChartDataPoint[];
  subscriptionsByStatus: ChartDataPoint[];
  totalActiveSubscriptions: number;
  monthlyRecurring: number;
}

export function useMonetizationAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics", "monetization"],
    queryFn: async (): Promise<MonetizationAnalytics> => {
      const { data: subscriptions } = await supabase
        .from("owner_subscriptions")
        .select("tier, status, billing_period");

      const subs = subscriptions || [];

      // Count by tier
      const tierCount: Record<string, number> = {};
      subs.forEach(s => {
        tierCount[s.tier] = (tierCount[s.tier] || 0) + 1;
      });

      // Count by status
      const statusCount: Record<string, number> = {};
      subs.forEach(s => {
        statusCount[s.status] = (statusCount[s.status] || 0) + 1;
      });

      const activeCount = subs.filter(s => s.status === "active").length;

      return {
        subscriptionsByTier: Object.entries(tierCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
        subscriptionsByStatus: Object.entries(statusCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
        totalActiveSubscriptions: activeCount,
        monthlyRecurring: activeCount, // Simplified - would need pricing data
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============= GEOGRAPHY ANALYTICS =============
export interface GeographyAnalytics {
  listingsByCity: ChartDataPoint[];
  listingsByRegion: ChartDataPoint[];
  topCities: { name: string; listingCount: number; viewCount: number }[];
}

export function useGeographyAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics", "geography"],
    queryFn: async (): Promise<GeographyAnalytics> => {
      const [listingsData, citiesData, regionsData] = await Promise.all([
        supabase.from("listings").select("city_id, region_id, view_count"),
        supabase.from("cities").select("id, name").eq("is_active", true),
        supabase.from("regions").select("id, name").eq("is_active", true),
      ]);

      const listings = listingsData.data || [];
      const cities = citiesData.data || [];
      const regions = regionsData.data || [];

      const cityMap = new Map(cities.map(c => [c.id, c.name]));
      const regionMap = new Map(regions.map(r => [r.id, r.name]));

      // Count by city
      const cityStats: Record<string, { count: number; views: number }> = {};
      listings.forEach(l => {
        const name = cityMap.get(l.city_id) || "Unknown";
        if (!cityStats[name]) cityStats[name] = { count: 0, views: 0 };
        cityStats[name].count += 1;
        cityStats[name].views += l.view_count || 0;
      });

      // Count by region
      const regionCount: Record<string, number> = {};
      listings.forEach(l => {
        const name = l.region_id ? (regionMap.get(l.region_id) || "Other") : "No Region";
        regionCount[name] = (regionCount[name] || 0) + 1;
      });

      // Top cities by listings
      const topCities = Object.entries(cityStats)
        .map(([name, stats]) => ({
          name,
          listingCount: stats.count,
          viewCount: stats.views,
        }))
        .sort((a, b) => b.listingCount - a.listingCount)
        .slice(0, 10);

      return {
        listingsByCity: Object.entries(cityStats).map(([name, stats]) => ({ name, value: stats.count })),
        listingsByRegion: Object.entries(regionCount).map(([name, value]) => ({ name, value })),
        topCities,
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============= CURATED ANALYTICS =============
export interface CuratedAnalytics {
  curatedByCategory: ChartDataPoint[];
  curatedByRegion: ChartDataPoint[];
  curatedListings: { id: string; name: string; tier: string; viewCount: number }[];
  totalCurated: number;
}

export function useCuratedAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics", "curated"],
    queryFn: async (): Promise<CuratedAnalytics> => {
      const [curatedData, listingsData, categoriesData, regionsData] = await Promise.all([
        supabase.from("curated_assignments").select("listing_id, display_order"),
        supabase
          .from("listings")
          .select("id, name, tier, view_count, category_id, region_id")
          .eq("is_curated", true)
          .eq("tier", "signature"),
        supabase.from("categories").select("id, name"),
        supabase.from("regions").select("id, name"),
      ]);

      const listings = listingsData.data || [];
      const categories = categoriesData.data || [];
      const regions = regionsData.data || [];

      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const regionMap = new Map(regions.map(r => [r.id, r.name]));

      // Count by category
      const categoryCount: Record<string, number> = {};
      listings.forEach(l => {
        const name = categoryMap.get(l.category_id) || "Uncategorized";
        categoryCount[name] = (categoryCount[name] || 0) + 1;
      });

      // Count by region
      const regionCount: Record<string, number> = {};
      listings.forEach(l => {
        const name = l.region_id ? (regionMap.get(l.region_id) || "Other") : "No Region";
        regionCount[name] = (regionCount[name] || 0) + 1;
      });

      return {
        curatedByCategory: Object.entries(categoryCount).map(([name, value]) => ({ name, value })),
        curatedByRegion: Object.entries(regionCount).map(([name, value]) => ({ name, value })),
        curatedListings: listings.slice(0, 10).map(l => ({
          id: l.id,
          name: l.name,
          tier: l.tier,
          viewCount: l.view_count || 0,
        })),
        totalCurated: listings.length,
      };
    },
    staleTime: 30 * 1000,
  });
}

// ============= CONVERSIONS ANALYTICS =============
export interface ConversionsAnalytics {
  inquiriesByListing: ChartDataPoint[];
  favoritesByListing: ChartDataPoint[];
  conversionMetrics: {
    totalInquiries: number;
    totalFavorites: number;
    totalViews: number;
    favoriteRate: number;
  };
}

export function useConversionsAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics", "conversions"],
    queryFn: async (): Promise<ConversionsAnalytics> => {
      const [threadsData, favoritesData, listingsData] = await Promise.all([
        supabase.from("chat_threads").select("listing_id"),
        supabase.from("favorites").select("listing_id"),
        supabase.from("listings").select("id, name, view_count"),
      ]);

      const threads = threadsData.data || [];
      const favorites = favoritesData.data || [];
      const listings = listingsData.data || [];

      const listingMap = new Map(listings.map(l => [l.id, l.name]));

      // Count inquiries by listing (top 10)
      const inquiryCount: Record<string, number> = {};
      threads.forEach(t => {
        if (t.listing_id) {
          const name = listingMap.get(t.listing_id) || "Unknown";
          inquiryCount[name] = (inquiryCount[name] || 0) + 1;
        }
      });

      // Count favorites by listing (top 10)
      const favoriteCount: Record<string, number> = {};
      favorites.forEach(f => {
        if (f.listing_id) {
          const name = listingMap.get(f.listing_id) || "Unknown";
          favoriteCount[name] = (favoriteCount[name] || 0) + 1;
        }
      });

      const totalViews = listings.reduce((sum, l) => sum + (l.view_count || 0), 0);
      const totalFavorites = favorites.length;
      const favoriteRate = totalViews > 0 ? (totalFavorites / totalViews) * 100 : 0;

      // Get top 10 by count
      const topInquiries = Object.entries(inquiryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name: name.slice(0, 20), value }));

      const topFavorites = Object.entries(favoriteCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name: name.slice(0, 20), value }));

      return {
        inquiriesByListing: topInquiries,
        favoritesByListing: topFavorites,
        conversionMetrics: {
          totalInquiries: threads.length,
          totalFavorites,
          totalViews,
          favoriteRate: Math.round(favoriteRate * 100) / 100,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}
