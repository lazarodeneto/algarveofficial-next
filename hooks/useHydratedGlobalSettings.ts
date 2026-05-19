import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { normalizeLocale } from "@/lib/i18n/config";
import { globalSettingsQueryKey } from "@/lib/query-keys";

export interface HydratedGlobalSetting {
  key: string;
  value: string;
  category: string | null;
}

interface UseHydratedGlobalSettingsOptions {
  keys?: string[];
  locale?: string | null;
}

export function useHydratedGlobalSettings(options: UseHydratedGlobalSettingsOptions = {}) {
  const queryClient = useQueryClient();
  const routeLocale = useCurrentLocale();
  const rawLocale = options.locale?.trim().toLowerCase().replaceAll("_", "-") ?? "";
  const locale = rawLocale === "default" ? "default" : normalizeLocale(rawLocale || routeLocale);
  const normalizedKeys = useMemo(
    () => (options.keys?.length ? [...new Set(options.keys)].sort() : undefined),
    [options.keys],
  );

  const settings =
    queryClient.getQueryData<HydratedGlobalSetting[]>(globalSettingsQueryKey(normalizedKeys, locale)) ??
    queryClient.getQueryData<HydratedGlobalSetting[]>(globalSettingsQueryKey(normalizedKeys, "default")) ??
    [];

  return {
    settings,
    isLoading: false,
    error: null,
    isFetching: false,
  };
}
