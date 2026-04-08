"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildLegalSettingsCandidateIds,
  parseLegalSections,
  pickLegalSettingsRowByLocale,
} from "@/lib/legal/settings";
import { updateAdminSettingsRow } from "@/lib/admin/settings-client";
import { toast } from "sonner";

export interface Section {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface PrivacySettings {
  id: string;
  page_title: string | null;
  last_updated_date: string | null;
  introduction: string | null;
  sections: Section[] | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string | null;
}

export function usePrivacySettings(locale?: string | null) {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";
  const localeKey = locale ?? "default";

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['privacy-settings', localeKey],
    queryFn: async () => {
      const candidateIds = buildLegalSettingsCandidateIds(locale);
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .in('id', candidateIds);
      
      if (error) throw error;
      if (!data || data.length === 0) return null;

      const selected = pickLegalSettingsRowByLocale(data, locale);
      if (!selected) return null;
      
      // Parse sections from Json to Section[]
      const parsedSections = parseLegalSections(selected.sections, 'Shield');
      
      const parsed: PrivacySettings = {
        ...selected,
        sections: parsedSections,
      };
      return parsed;
    },
    staleTime: 1000 * 60 * 5,
    enabled: isBrowser,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      if (!isBrowser) return;

      const { sections, ...rest } = updates;
      
      const supabaseUpdates: Record<string, unknown> = { ...rest };
      if (sections !== undefined) {
        supabaseUpdates.sections = sections as unknown;
      }

      const targetId = settings?.id ?? "default";
      await updateAdminSettingsRow({
        table: "privacy_settings",
        id: targetId,
        updates: supabaseUpdates,
        mode: "upsert",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
      toast.success('Privacy Policy settings saved');
    },
    onError: (mutationError) => {
      console.error('Error updating privacy settings:', mutationError);
      toast.error('Failed to save settings');
    },
  });

  return {
    settings: isBrowser ? settings : null,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings,
  };
}
