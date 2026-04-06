"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updateAdminSettingsRow } from "@/lib/admin/settings-client";
import { toast } from "sonner";

export interface CookieBannerSettings {
  id: string;
  title: string;
  description: string;
  learn_more_text: string;
  learn_more_link: string;
  decline_button_text: string;
  accept_button_text: string;
  gdpr_badge_text: string;
  data_retention_text: string;
  show_gdpr_badge: boolean;
  show_data_retention: boolean;
  updated_at: string;
}

export const DEFAULT_COOKIE_BANNER_SETTINGS: CookieBannerSettings = {
  id: 'default',
  title: 'Your Privacy Matters',
  description: 'We use cookies and similar technologies to analyze site usage and improve your experience. This includes collecting anonymized data such as page views and session information. You can choose to accept or decline analytics tracking.',
  learn_more_text: 'Learn more',
  learn_more_link: '/privacy-policy',
  decline_button_text: 'Decline',
  accept_button_text: 'Accept Analytics',
  gdpr_badge_text: 'GDPR Compliant',
  data_retention_text: 'Data retained for 90 days',
  show_gdpr_badge: true,
  show_data_retention: true,
  updated_at: new Date().toISOString(),
};

// Merge DB record with defaults: empty strings are treated as "not set"
function mergeWithDefaults(data: Partial<CookieBannerSettings> | null): CookieBannerSettings {
  if (!data) return DEFAULT_COOKIE_BANNER_SETTINGS;
  const merged = { ...DEFAULT_COOKIE_BANNER_SETTINGS };

  const assignIfPresent = <K extends keyof CookieBannerSettings>(key: K) => {
    const val = data[key];
    if (val !== undefined && val !== null && val !== "") {
      merged[key] = val as CookieBannerSettings[K];
    }
  };

  for (const key of Object.keys(DEFAULT_COOKIE_BANNER_SETTINGS) as (keyof CookieBannerSettings)[]) {
    assignIfPresent(key);
  }

  return merged;
}

export function useCookieBannerSettings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['cookie-banner-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cookie_banner_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      return mergeWithDefaults(data as Partial<CookieBannerSettings> | null);
    },
    staleTime: 1000 * 60 * 5,
    enabled: isBrowser,
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<CookieBannerSettings>) => {
      if (!isBrowser) {
        return DEFAULT_COOKIE_BANNER_SETTINGS;
      }

      const data = await updateAdminSettingsRow<CookieBannerSettings>({
        table: "cookie_banner_settings",
        updates: {
          id: "default",
          ...newSettings,
          updated_at: new Date().toISOString(),
        },
        mode: "upsert",
      });
      return data ?? DEFAULT_COOKIE_BANNER_SETTINGS;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie-banner-settings'] });
      toast.success("Cookie banner settings saved successfully");
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error ? mutationError.message : "Unknown error";
      toast.error(`Failed to save settings: ${message}`);
    },
  });

  return {
    settings: isBrowser ? settings || DEFAULT_COOKIE_BANNER_SETTINGS : DEFAULT_COOKIE_BANNER_SETTINGS,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings,
    isUpdating: isBrowser ? updateSettings.isPending : false,
  };
}
