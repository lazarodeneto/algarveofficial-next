import { useQuery } from "@tanstack/react-query";

import type { HomepageSettings } from "@/hooks/useHomepageSettings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { homepageSettingsQueryKey } from "@/lib/query-keys";

function normalizeHomepageLocale(language: string | undefined): string {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return "en";
  if (normalized === "pt") return "pt-pt";
  if (normalized.startsWith("pt-pt")) return "pt-pt";
  if (["de", "fr", "es", "it", "nl", "sv", "no", "da"].includes(normalized)) return normalized;
  return "en";
}

export function usePublicHomepageSettings() {
  const routeLocale = useCurrentLocale();
  const locale = normalizeHomepageLocale(routeLocale);

  const query = useQuery<HomepageSettings | null>({
    queryKey: homepageSettingsQueryKey(locale),
    queryFn: async () => null,
    enabled: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    settings: query.data ?? null,
    isLoading: false,
    error: null,
    hasLocaleTranslation: true,
  };
}
