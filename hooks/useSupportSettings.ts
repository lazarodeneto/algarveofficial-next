"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { updateAdminSettingsRow } from "@/lib/admin/settings-client";
import { normalizePublicContactEmail } from "@/lib/contactEmail";
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
  const isBrowser = typeof window !== "undefined";

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
        email: normalizePublicContactEmail(raw.email),
        categories: Array.isArray(raw.categories) ? raw.categories as string[] : [],
        faqs: Array.isArray(raw.faqs) ? (raw.faqs as FAQ[]) : [],
      };
    },
    enabled: isBrowser,
  });

  const updateSettingsMut = useMutation({
    mutationFn: async (updates: Partial<Omit<SupportSettings, "id" | "updated_at">>) => {
      if (!isBrowser) return;

      // Cast arrays to JSON-compatible types for Supabase
      const dbUpdates: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      await updateAdminSettingsRow({
        table: "support_settings",
        updates: dbUpdates,
        mode: "upsert",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-settings"] });
      toast.success("Support settings saved successfully");
    },
    onError: (mutationError) => {
      console.error("Failed to save support settings:", mutationError);
      toast.error("Failed to save support settings");
    },
  });

  return {
    settings: isBrowser ? settings : null,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings: updateSettingsMut,
  };
}
