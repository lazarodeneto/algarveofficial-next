"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

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

/**
 * SECURITY: This hook must use API route.
 * Do NOT use Supabase client here.
 */

// Fetch Overview KPIs
export function useOverviewKPIs() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "overview-kpis"],
    enabled: !!user && !authLoading,
    queryFn: async (): Promise<OverviewKPIs> => {
      const res = await fetch("/api/admin/analytics/overview?type=overview", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 1000,
  });
}

// Fetch Tier Distribution
export function useTierDistribution() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "tier-distribution"],
    enabled: !!user && !authLoading,
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const res = await fetch("/api/admin/analytics/overview?type=tier-distribution", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 1000,
  });
}

// Fetch Status Distribution
export function useStatusDistribution() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "status-distribution"],
    enabled: !!user && !authLoading,
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const res = await fetch("/api/admin/analytics/overview?type=status-distribution", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 1000,
  });
}

// Placeholder - remaining analytics functions would need individual API routes
// For now, these query protected data directly - should be migrated

export function useTopListings(_limit = 5) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "top-listings", _limit],
    enabled: !!user && !authLoading,
    queryFn: async (): Promise<TopListing[]> => {
      const res = await fetch("/api/admin/analytics/listings?type=top", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useListingsAnalytics(_filters?: Record<string, unknown>) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "listings", _filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/listings", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useUsersAnalytics(_filters?: Record<string, unknown>) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "users", _filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/users", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMonetizationAnalytics(_filters?: Record<string, unknown>) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "monetization", _filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/monetization", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useGeographyAnalytics(_filters?: Record<string, unknown>) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "geography", _filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/geography", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCuratedAnalytics(_filters?: Record<string, unknown>) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "curated", _filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/curated", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useConversionsAnalytics(_filters?: Record<string, unknown>) {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ["admin-analytics", user?.id, "conversions", _filters],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/conversions", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}
