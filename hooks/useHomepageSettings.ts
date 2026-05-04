import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  homepageSettingsQueryKey,
  homepageSettingsTranslationQueryKey,
} from "@/lib/query-keys";
import {
  HomeSectionCopyMap,
} from "@/lib/cms/home-section-copy";

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
  section_copy: HomeSectionCopyMap | null;
  updated_at: string;
}

interface HomepageSettingsTranslation {
  settings_id?: string;
  locale: string;
  status: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_primary_text: string | null;
  hero_cta_secondary_text: string | null;
}

const HOMEPAGE_TRANSLATION_FIELDS =
  "settings_id, locale, status, hero_title, hero_subtitle, hero_cta_primary_text, hero_cta_secondary_text";

const HOMEPAGE_TRANSLATABLE_FIELDS = new Set<keyof HomepageSettings>([
  "hero_title",
  "hero_subtitle",
  "hero_cta_primary_text",
  "hero_cta_secondary_text",
]);

const homepageTranslationClient = supabase as typeof supabase & {
  from: (relation: "homepage_settings_translations") => {
    select: (...args: unknown[]) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: HomepageSettingsTranslation | null; error: unknown }>;
        };
      };
    };
    upsert: (
      payload: Record<string, unknown>,
      options: { onConflict: string },
    ) => {
      select: (...args: unknown[]) => {
        maybeSingle: () => Promise<{ data: HomepageSettingsTranslation | null; error: unknown }>;
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

const normalizeTranslatableText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return String(value);
  const trimmed = value.trim();
  return trimmed.length > 0 ? value : null;
};

const mergeHomepageTranslation = (
  settings: HomepageSettings | null,
  translation: HomepageSettingsTranslation | null,
  locale: string,
): HomepageSettings | null => {
  if (!settings) return null;
  if (locale === "en" || !translation) return settings;

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
};

export function useHomepageSettings() {
  const queryClient = useQueryClient();
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
    staleTime: 1000 * 60 * 5,
  });

  const { data: translation, isLoading: isTranslationLoading } = useQuery({
    queryKey: homepageSettingsTranslationQueryKey(settings?.id ?? null, locale),
    enabled: Boolean(settings?.id) && locale !== "en",
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      if (!settings?.id || locale === "en") return null;

      const { data, error } = await homepageTranslationClient
        .from("homepage_settings_translations")
        .select(HOMEPAGE_TRANSLATION_FIELDS)
        .eq("settings_id", settings.id)
        .eq("locale", locale)
        .maybeSingle();

      if (error) {
        // Non-English locales gracefully fall back to the base row.
        return null;
      }

      return (data ?? null) as HomepageSettingsTranslation | null;
    },
  });

  const localizedSettings = useMemo(
    () => mergeHomepageTranslation(settings ?? null, translation ?? null, locale),
    [locale, settings, translation],
  );

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<HomepageSettings>) => {
      const translatableUpdates = Object.fromEntries(
        Object.entries(newSettings)
          .filter(([key, value]) => value !== undefined && HOMEPAGE_TRANSLATABLE_FIELDS.has(key as keyof HomepageSettings))
          .map(([key, value]) => [key, normalizeTranslatableText(value)]),
      );

      const baseUpdates = Object.fromEntries(
        Object.entries(newSettings).filter(
          ([key, value]) => value !== undefined && !HOMEPAGE_TRANSLATABLE_FIELDS.has(key as keyof HomepageSettings),
        ),
      );

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
      const shouldWriteBaseTranslatableFields = locale === "en";
      const desiredBaseUpdates = shouldWriteBaseTranslatableFields
        ? newSettings
        : baseUpdates;

      if (!currentRow) {
        // Create if doesn't exist
        const createPayloadSource = shouldWriteBaseTranslatableFields
          ? desiredBaseUpdates
          : baseUpdates;
        const payload = {
          ...createPayloadSource,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('homepage_settings')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        const createdRow = data as HomepageSettings;

        if (locale !== "en" && Object.keys(translatableUpdates).length > 0) {
          const { data: upsertedTranslation, error: translationError } = await homepageTranslationClient
            .from("homepage_settings_translations")
            .upsert(
              {
                settings_id: createdRow.id,
                locale,
                ...translatableUpdates,
                status: "reviewed",
                translated_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "settings_id,locale" },
            )
            .select(HOMEPAGE_TRANSLATION_FIELDS)
            .maybeSingle();

          if (translationError) {
            const message =
              translationError instanceof Error
                ? translationError.message
                : "Failed to save localized hero content.";
            throw new Error(message);
          }

          return mergeHomepageTranslation(createdRow, upsertedTranslation, locale) as HomepageSettings;
        }

        return createdRow;
      }

      // Filter unknown keys to avoid failures when DB is missing newer columns.
      const allowedKeys = new Set(Object.keys(currentRow));
      const filteredBaseUpdates = Object.fromEntries(
        Object.entries(desiredBaseUpdates).filter(([key, value]) => value !== undefined && allowedKeys.has(key))
      );

      const hasBaseUpdates = Object.keys(filteredBaseUpdates).length > 0;
      const hasTranslationUpdates = Object.keys(translatableUpdates).length > 0;

      if (!hasBaseUpdates && !hasTranslationUpdates) {
        throw new Error("No compatible homepage fields were saved. Please run latest database migrations.");
      }

      let updatedRow = currentRow as unknown as HomepageSettings;

      if (hasBaseUpdates) {
        const safeBaseUpdates = {
          ...filteredBaseUpdates,
          ...(allowedKeys.has("updated_at") ? { updated_at: new Date().toISOString() } : {}),
        };

        const { data, error } = await supabase
          .from('homepage_settings')
          .update(safeBaseUpdates)
          .eq('id', String(currentRow.id))
          .select()
          .single();

        if (error) throw error;
        updatedRow = data as HomepageSettings;
      }

      if (locale !== "en" && hasTranslationUpdates) {
        const { data: upsertedTranslation, error: translationError } = await homepageTranslationClient
          .from("homepage_settings_translations")
          .upsert(
            {
              settings_id: String(currentRow.id),
              locale,
              ...translatableUpdates,
              status: "reviewed",
              translated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "settings_id,locale" },
          )
          .select(HOMEPAGE_TRANSLATION_FIELDS)
          .maybeSingle();

        if (translationError) {
          const message =
            translationError instanceof Error
              ? translationError.message
              : "Failed to save localized hero content.";
          throw new Error(message);
        }

        return mergeHomepageTranslation(updatedRow, upsertedTranslation, locale) as HomepageSettings;
      }

      return updatedRow;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(homepageSettingsQueryKey(locale), data);
      // Force cache refresh so the public homepage gets fresh data immediately
      queryClient.invalidateQueries({ queryKey: homepageSettingsQueryKey(locale) });
      queryClient.invalidateQueries({ queryKey: homepageSettingsTranslationQueryKey(data?.id ?? null, locale) });
    },
  });

  return {
    settings: localizedSettings,
    isLoading: isLoading || (locale !== "en" && Boolean(settings?.id) && isTranslationLoading),
    error,
    hasLocaleTranslation: locale === "en" ? true : Boolean(translation),
    updateSettings: updateSettings.mutate,
    updateSettingsAsync: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}

// Lightweight hook for public pages - just fetches hero data
export function useHeroSettings() {
  const { settings, isLoading, hasLocaleTranslation } = useHomepageSettings();

  return {
    settings,
    hasLocaleTranslation,
    isLoading,
  };
}
