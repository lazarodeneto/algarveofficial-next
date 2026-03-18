"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

const defaultSettings: CookieBannerSettings = {
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
  if (!data) return defaultSettings;
  const merged = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings) as (keyof CookieBannerSettings)[]) {
    const val = data[key];
    if (val !== undefined && val !== null && val !== '') {
      (merged as any)[key] = val;
    }
  }
  return merged;
}

export function useCookieBannerSettings() {
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      settings: defaultSettings,
      isLoading: false,
      error: null,
      updateSettings: { mutate: () => {}, mutateAsync: async () => {}, isPending: false } as any,
      isUpdating: false,
    };
  }

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
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<CookieBannerSettings>) => {
      const { data, error } = await supabase
        .from('cookie_banner_settings')
        .upsert({
          id: 'default',
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie-banner-settings'] });
      toast.success("Cookie banner settings saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save settings: " + error.message);
    },
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    error,
    updateSettings,
    isUpdating: updateSettings.isPending,
  };
}
