"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

    if (typeof window === "undefined") {
        return {
            settings: null,
            isLoading: false,
            error: null,
            updateSettings: { mutate: () => {}, mutateAsync: async () => {}, isPending: false } as any,
        };
    }

    const { data: settings, isLoading, error } = useQuery({
        queryKey: ["contact-settings"],
        queryFn: async (): Promise<ContactSettings | null> => {
            const { data, error } = await (supabase.from("contact_settings" as any) as any)
                .select("*")
                .eq("id", "default")
                .maybeSingle();

            if (error) throw error;
            return data as ContactSettings;
        },
    });

    const updateSettings = useMutation({
        mutationFn: async (updates: Partial<Omit<ContactSettings, "id" | "updated_at">>) => {
            const { error } = await (supabase.from("contact_settings" as any) as any)
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
        onError: (error) => {
            console.error("Failed to save contact settings:", error);
            toast.error("Failed to save contact settings");
        },
    });

    return {
        settings,
        isLoading,
        error,
        updateSettings,
    };
}
