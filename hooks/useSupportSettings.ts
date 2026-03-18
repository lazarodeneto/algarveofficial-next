"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FAQ {
  question: string;
  answer: string;
}

export interface SupportSettings {
  id: string;
  email: string | null;
  phone: string | null;
  phone_hours: string | null;
  help_center_url: string | null;
  help_center_label: string | null;
  response_time: string | null;
  response_time_note: string | null;
  form_title: string | null;
  form_description: string | null;
  success_message: string | null;
  categories: string[];
  faqs: FAQ[];
  updated_at: string;
}

interface RawSupportSettings {
  id: string;
  email: string | null;
  phone: string | null;
  phone_hours: string | null;
  help_center_url: string | null;
  help_center_label: string | null;
  response_time: string | null;
  response_time_note: string | null;
  form_title: string | null;
  form_description: string | null;
  success_message: string | null;
  categories: unknown;
  faqs: unknown;
  updated_at: string;
}

export function useSupportSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["support-settings"],
    queryFn: async (): Promise<SupportSettings | null> => {
      const { data, error } = await supabase
        .from("support_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const raw = data as RawSupportSettings;

      // Parse JSONB fields
      return {
        ...raw,
        categories: Array.isArray(raw.categories) ? raw.categories as string[] : [],
        faqs: Array.isArray(raw.faqs) ? (raw.faqs as FAQ[]) : [],
      };
    },
  });

  const updateSettingsMut = useMutation({
    mutationFn: async (updates: Partial<Omit<SupportSettings, "id" | "updated_at">>) => {
      // Cast arrays to JSON-compatible types for Supabase
      const dbUpdates: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from("support_settings")
        .update(dbUpdates)
        .eq("id", "default");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-settings"] });
      toast.success("Support settings saved successfully");
    },
    onError: (error) => {
      console.error("Failed to save support settings:", error);
      toast.error("Failed to save support settings");
    },
  });

  if (typeof window === "undefined") {
    return {
      settings: null,
      isLoading: false,
      error: null,
      updateSettings: { mutate: () => {}, mutateAsync: async () => {}, isPending: false } as any,
    };
  }

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMut,
  };
}
