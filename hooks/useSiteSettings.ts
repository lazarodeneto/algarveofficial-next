import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface SiteSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  site_name: string;
  tagline: string;
  contact_email?: string | null;
  updated_at: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_ip_whitelist: string[];
  logo_url?: string | null;
  favicon_url?: string | null;
  ga_measurement_id?: string | null;
  ga_dashboard_url?: string | null;
}

// Convert RGBA to HSL for CSS variable compatibility
const rgbaToHsl = (rgba: string): string => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return "43 74% 49%"; // Default gold

  const r = parseInt(match[1], 10) / 255;
  const g = parseInt(match[2], 10) / 255;
  const b = parseInt(match[3], 10) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Apply colors to CSS variables
// IMPORTANT: Only apply brand colors (primary, accent). 
// Do NOT override --secondary as it's a structural theme color, not a brand accent.
const applyColorsToDocument = (settings: SiteSettings) => {
  const root = document.documentElement;

  // Convert RGBA to HSL for CSS variables
  const primaryHsl = rgbaToHsl(settings.primary_color);
  const accentHsl = rgbaToHsl(settings.accent_color);

  // Apply only brand colors - leave structural colors (secondary, muted, etc.) untouched
  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--accent', accentHsl);

  // Store raw RGBA values for components that need them
  root.style.setProperty('--primary-rgba', settings.primary_color);
  root.style.setProperty('--secondary-rgba', settings.secondary_color);
  root.style.setProperty('--accent-rgba', settings.accent_color);
};

const STORAGE_KEY = 'site-settings-v1';

export function useSiteSettings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  // Try to load from local storage for initial data
  const getStoredSettings = (): SiteSettings | undefined => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return undefined;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored site settings', e);
    }
    return undefined;
  };

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Site settings not found');

      // Update local storage
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      return data as SiteSettings;
    },
    // Use stored data initially to avoid loading state if possible
    initialData: getStoredSettings,
    // Force a fresh fetch on mount even when localStorage provides initial data.
    // This prevents stale maintenance flags from lingering client-side.
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 5, // Keep in garbage collection for 5 minutes
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 60, // Keep critical flags (e.g., maintenance mode) updated while tab is open
    enabled: isBrowser,
  });

  // Apply colors whenever settings change
  useEffect(() => {
    if (settings) {
      applyColorsToDocument(settings);
    }
  }, [settings]);

  const updateSettingsMut = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettings>) => {
      if (!isBrowser) {
        return {} as SiteSettings;
      }

      const { data, error } = await supabase
        .from('site_settings')
        .update(newSettings)
        .eq('id', 'default')
        .select('*')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Site settings not found after update');
      return data as SiteSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['site-settings'], data);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      if (typeof document !== "undefined") {
        applyColorsToDocument(data);
      }
    },
  });

  const noopUpdateSettings = () => undefined;
  const noopUpdateSettingsAsync = async (): Promise<SiteSettings> => ({} as SiteSettings);

  return {
    settings: isBrowser ? settings : undefined,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings: isBrowser ? updateSettingsMut.mutate : noopUpdateSettings,
    updateSettingsAsync: isBrowser ? updateSettingsMut.mutateAsync : noopUpdateSettingsAsync,
    isUpdating: isBrowser ? updateSettingsMut.isPending : false,
  };
}

// Hook to just apply colors on app load (for non-admin pages)
export function useSiteColors() {
  const { settings } = useSiteSettings();
  return settings;
}
