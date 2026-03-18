"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface Section {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export interface TermsSettings {
  id: string;
  page_title: string | null;
  last_updated_date: string | null;
  introduction: string | null;
  sections: Section[] | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

export function useTermsSettings() {
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      settings: null,
      isLoading: false,
      error: null,
      updateSettings: { mutate: () => {}, mutateAsync: async () => {}, isPending: false } as any,
    };
  }

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['terms-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms_settings')
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
            icon: String(obj.icon || 'FileText'),
            content: String(obj.content || ''),
          };
        });
      }
      
      const parsed: TermsSettings = {
        ...data,
        sections: parsedSections,
      };
      return parsed;
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<TermsSettings>) => {
      const { sections, ...rest } = updates;
      
      const supabaseUpdates: Record<string, unknown> = { ...rest };
      if (sections !== undefined) {
        supabaseUpdates.sections = sections as unknown;
      }
      
      const { error } = await supabase
        .from('terms_settings')
        .update(supabaseUpdates)
        .eq('id', 'default');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms-settings'] });
      toast.success('Terms of Service settings saved');
    },
    onError: (error) => {
      console.error('Error updating terms settings:', error);
      toast.error('Failed to save settings');
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}
