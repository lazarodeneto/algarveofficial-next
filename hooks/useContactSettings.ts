"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizePublicContactEmail } from "@/lib/contactEmail";
import { normalizePublicWhatsAppNumber } from "@/lib/contactPhone";
import { toast } from "sonner";

export interface ContactSettings {
    id: string;
    hero_title: string | null;
    hero_subtitle: string | null;
    get_in_touch_title: string | null;
    get_in_touch_description: string | null;
    display_email: string | null;
    whatsapp_number: string | null;
    office_location: string | null;
    form_title: string | null;
    form_description: string | null;
    success_message: string | null;
    forwarding_email: string | null;
    updated_at: string;
}

export function useContactSettings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["contact-settings"],
    queryFn: async (): Promise<ContactSettings | null> => {
      const { data, error } = await supabase
        .from("contact_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (error) throw error;
      const settings = data as ContactSettings;

      return {
        ...settings,
        display_email: normalizePublicContactEmail(settings.display_email),
        whatsapp_number: normalizePublicWhatsAppNumber(settings.whatsapp_number),
        forwarding_email: normalizePublicContactEmail(settings.forwarding_email),
      };
    },
    enabled: isBrowser,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<ContactSettings, "id" | "updated_at">>) => {
      if (!isBrowser) return;

      const { error } = await supabase
        .from("contact_settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "default");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-settings"] });
      toast.success("Contact settings saved successfully");
    },
    onError: (mutationError) => {
      console.error("Failed to save contact settings:", mutationError);
      toast.error("Failed to save contact settings");
    },
  });

  return {
    settings: isBrowser ? settings : null,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings,
  };
}
