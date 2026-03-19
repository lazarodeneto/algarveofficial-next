"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FAQ {
  question: string;
  answer: string;
}

export interface PartnerSettings {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  new_listing_title: string | null;
  new_listing_description: string | null;
  new_listing_cta: string | null;
  claim_business_title: string | null;
  claim_business_description: string | null;
  claim_business_cta: string | null;
  form_title: string | null;
  success_message: string | null;
  benefits_title: string | null;
  benefit_1_title: string | null;
  benefit_1_description: string | null;
  benefit_2_title: string | null;
  benefit_2_description: string | null;
  benefit_3_title: string | null;
  benefit_3_description: string | null;
  faq_title: string | null;
  faqs: FAQ[] | null;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
}

export function usePartnerSettings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['partner-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      
      if (error) throw error;
      
      // Parse faqs from Json to FAQ[]
      let parsedFaqs: FAQ[] = [];
      if (Array.isArray(data.faqs)) {
        parsedFaqs = (data.faqs as unknown[]).map((item) => {
          const obj = item as Record<string, unknown>;
          return {
            question: String(obj.question || ''),
            answer: String(obj.answer || ''),
          };
        });
      }
      
      const parsed: PartnerSettings = {
        ...data,
        faqs: parsedFaqs,
      };
      return parsed;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: isBrowser,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PartnerSettings>) => {
      if (!isBrowser) return;

      // Build the update object explicitly for Supabase
      const { faqs, ...rest } = updates;
      
      const supabaseUpdates: Record<string, unknown> = { ...rest };
      if (faqs !== undefined) {
        supabaseUpdates.faqs = faqs as unknown;
      }
      
      const { error } = await supabase
        .from('partner_settings')
        .update(supabaseUpdates)
        .eq('id', 'default');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-settings'] });
      toast.success('Partner page settings saved');
    },
    onError: (mutationError) => {
      console.error('Error updating partner settings:', mutationError);
      toast.error('Failed to save settings');
    },
  });

  return {
    settings: isBrowser ? settings : undefined,
    isLoading: isBrowser ? isLoading : false,
    error: isBrowser ? error : null,
    updateSettings,
  };
}
