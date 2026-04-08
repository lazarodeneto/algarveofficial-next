"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updateAdminSettingsRow } from "@/lib/admin/settings-client";
import { toast } from "sonner";

export interface Section {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface CookieSettings {
  id: string;
  page_title: string | null;
  last_updated_date: string | null;
  introduction: string | null;
  sections: Section[] | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string | null;
}

export function useCookieSettings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['cookie-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cookie_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) throw error;
      
      // Parse sections from Json to Section[]
      let parsedSections: Section[] = [];
      if (Array.isArray(data.sections)) {
        parsedSections = (data.sections as unknown[]).map((item) => {
          const obj = item as Record<string, unknown>;
          return {
            id: String(obj.id || ''),
            title: String(obj.title || ''),
            icon: String(obj.icon || 'Cookie'),
            content: String(obj.content || ''),
          };
        });
      }
      
      const parsed: CookieSettings = {
        ...data,
        sections: parsedSections,
      };
      return parsed;
    },
    staleTime: 1000 * 60 * 5,
    enabled: isBrowser,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<CookieSettings>) => {
      if (!isBrowser) return;

      const { sections, ...rest } = updates;
      
      const supabaseUpdates: Record<string, unknown> = { ...rest };
      if (sections !== undefined) {
        supabaseUpdates.sections = sections as unknown;
      }
      
      await updateAdminSettingsRow({
        table: "cookie_settings",
        updates: supabaseUpdates,
        mode: "upsert",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie-settings'] });
      toast.success('Cookie Policy settings saved');
    },
    onError: (mutationError) => {
      console.error('Error updating cookie settings:', mutationError);
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
