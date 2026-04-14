import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  homepageSettingsQueryKey,
  homepageSettingsTranslationQueryKey,
} from "@/lib/query-keys";

export interface HomepageSettings {
  id: string;
  hero_video_url: string | null;
  hero_youtube_url: string | null;
  hero_poster_url: string | null;
  hero_media_type: string;
  hero_overlay_intensity: number;
  hero_autoplay: boolean;
  hero_loop: boolean;
  hero_muted: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_primary_link: string | null;
  hero_cta_secondary_text: string | null;
  hero_cta_secondary_link: string | null;
  show_regions_section: boolean;
  show_categories_section: boolean;
  show_cities_section: boolean;
  show_vip_section: boolean;
  show_curated_section: boolean;
  show_all_listings_section: boolean;
  show_cta_section: boolean;
  section_order: string[] | null;
  updated_at: string;
}

interface HomepageSettingsTranslation {
  locale: string;
  status: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_secondary_text: string | null;
}

const HOMEPAGE_TRANSLATION_FIELDS =
  "locale, status, hero_title, hero_subtitle, hero_cta_primary_text, hero_cta_secondary_text";

const homepageTranslationClient = supabase as typeof supabase & {
  from: (relation: "homepage_settings_translations") => {
    select: (...args: unknown[]) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: HomepageSettingsTranslation | null; error: unknown }>;
        };
      };
    };
  };
};

const normalizeHomepageLocale = (language: string | undefined): string => {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return "en";
  if (normalized === "pt") return "pt-pt";
  if (normalized.startsWith("pt-pt")) return "pt-pt";
  if (["de", "fr", "es", "it", "nl", "sv", "no", "da"].includes(normalized)) return normalized;
  return "en";
};

const preferTranslatedValue = (translated: string | null | undefined, fallback: string | null) => {
  const trimmed = translated?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

export function useHomepageSettings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";
  const routeLocale = useCurrentLocale();
  const locale = normalizeHomepageLocale(routeLocale);

  const { data: settings, isLoading, error } = useQuery({
    queryKey: homepageSettingsQueryKey(locale),
    queryFn: async () => {
      const { data, error, status } = await supabase
        .from('homepage_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        if (status === 503) {
          return null;
        }
        throw error;
      }
      return (data ?? null) as HomepageSettings | null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: isBrowser,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<HomepageSettings>) => {
      if (!isBrowser) {
        return {} as HomepageSettings;
      }

      // Read current row first so updates only include columns that actually exist
      // in the connected database schema.
      const { data: current, error: currentError } = await supabase
        .from('homepage_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (currentError) throw currentError;
      const currentRow = current as Record<string, unknown> | null;

      if (!currentRow) {
        // Create if doesn't exist
        const payload = {
          ...newSettings,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('homepage_settings')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as HomepageSettings;
      }

      // Filter unknown keys to avoid failures when DB is missing newer columns.
      const allowedKeys = new Set(Object.keys(currentRow));
      const filteredSettings = Object.fromEntries(
        Object.entries(newSettings).filter(([key, value]) => value !== undefined && allowedKeys.has(key))
      );
      const safeSettings = {
        ...filteredSettings,
        ...(allowedKeys.has("updated_at") ? { updated_at: new Date().toISOString() } : {}),
      };

      if (Object.keys(filteredSettings).length === 0) {
        throw new Error("No compatible homepage fields were saved. Please run latest database migrations.");
      }

      const { data, error } = await supabase
        .from('homepage_settings')
        .update(safeSettings)
        .eq('id', String(currentRow.id))
        .select()
        .single();
      
      if (error) throw error;
      return data as HomepageSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(homepageSettingsQueryKey(locale), data);
      // Force cache refresh so the public homepage gets fresh data immediately
      queryClient.invalidateQueries({ queryKey: homepageSettingsQueryKey(locale) });
    },
  });

  const noopUpdateSettings = () => undefined;
  const noopUpdateSettingsAsync = async (): Promise<HomepageSettings> => ({} as HomepageSettings);

  return {
    settings: isBrowser ? settings : null,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings: isBrowser ? updateSettings.mutate : noopUpdateSettings,
    updateSettingsAsync: isBrowser ? updateSettings.mutateAsync : noopUpdateSettingsAsync,
    isUpdating: isBrowser ? updateSettings.isPending : false,
  };
}

// Lightweight hook for public pages - just fetches hero data
export function useHeroSettings() {
  const { settings, isLoading } = useHomepageSettings();
  const locale = normalizeHomepageLocale(useCurrentLocale());

  const { data: translation, isLoading: isTranslationLoading } = useQuery({
    queryKey: homepageSettingsTranslationQueryKey(settings?.id ?? null, locale),
    enabled: Boolean(settings?.id) && locale !== "en",
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (typeof window === "undefined" || !settings?.id || locale === "en") return null;

      const { data, error } = await homepageTranslationClient
        .from("homepage_settings_translations")
        .select(HOMEPAGE_TRANSLATION_FIELDS)
        .eq("settings_id", settings.id)
        .eq("locale", locale)
        .maybeSingle();

      if (error) {
        // Public hero copy should gracefully fall back to English if translation
        // rows are temporarily unavailable or not yet migrated.
        return null;
      }

      return (data ?? null) as HomepageSettingsTranslation | null;
    },
  });

  const localizedSettings = useMemo(() => {
    if (!settings) return null;
    if (!translation || locale === "en") return settings;

    return {
      ...settings,
      hero_title: preferTranslatedValue(translation.hero_title, settings.hero_title),
      hero_subtitle: preferTranslatedValue(translation.hero_subtitle, settings.hero_subtitle),
      hero_cta_primary_text: preferTranslatedValue(
        translation.hero_cta_primary_text,
        settings.hero_cta_primary_text,
      ),
      hero_cta_secondary_text: preferTranslatedValue(
        translation.hero_cta_secondary_text,
        settings.hero_cta_secondary_text,
      ),
    } satisfies HomepageSettings;
  }, [locale, settings, translation]);

  return {
    settings: localizedSettings,
    isLoading: isLoading ?? locale !== "en" && Boolean(settings?.id) && isTranslationLoading,
  };
}
