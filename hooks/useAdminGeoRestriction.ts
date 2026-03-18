"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks whether admin geo-restriction to Portugal is enabled,
 * and if so, whether the current visitor is located in Portugal.
 *
 * Fail-open: if geolocation fails, access is allowed to prevent admin lockout.
 */
export function useAdminGeoRestriction() {
  // 1. Check if the setting is enabled
  const settingQuery = useQuery({
    queryKey: ["global-settings", "admin_restrict_portugal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_settings")
        .select("value")
        .eq("key", "admin_restrict_portugal")
        .maybeSingle();

      if (error) throw error;
      return data?.value === "true";
    },
    staleTime: 1000 * 60 * 5,
  });

  const isEnabled = settingQuery.data === true;

  // 2. Check visitor country only when restriction is enabled
  const geoQuery = useQuery({
    queryKey: ["admin-geo-check"],
    queryFn: async () => {
      try {
        // Use a free, no-key-required geolocation API
        const response = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return { allowed: true, country: "unknown" }; // fail-open

        const data = await response.json();
        const country = data?.country_code ?? "unknown";
        return { allowed: country === "PT", country };
      } catch {
        // Fail-open: allow access if geolocation fails
        return { allowed: true, country: "unknown" };
      }
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: false,
  });

  // If setting is off or still loading → allow access
  if (!isEnabled) {
    return { isBlocked: false, isLoading: settingQuery.isLoading, country: null };
  }

  // If geo check is loading, don't block yet (fail-open during loading)
  if (geoQuery.isLoading) {
    return { isBlocked: false, isLoading: true, country: null };
  }

  const geoResult = geoQuery.data ?? { allowed: true, country: "unknown" };

  return {
    isBlocked: !geoResult.allowed,
    isLoading: false,
    country: geoResult.country,
  };
}
