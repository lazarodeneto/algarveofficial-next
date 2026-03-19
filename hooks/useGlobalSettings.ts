import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GlobalSetting {
  key: string;
  value: string;
  category: string | null;
}

interface UseGlobalSettingsOptions {
  enabled?: boolean;
  keys?: string[];
}

export function useGlobalSettings(options: UseGlobalSettingsOptions = {}) {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";
  const normalizedKeys = options.keys?.length
    ? [...new Set(options.keys)].sort()
    : undefined;

  const query = useQuery({
    queryKey: ["global-settings", normalizedKeys ?? "all"],
    queryFn: async (): Promise<GlobalSetting[]> => {
      let queryBuilder = supabase
        .from("global_settings")
        .select("key, value, category")
        .order("key", { ascending: true });

      if (normalizedKeys?.length) {
        queryBuilder = queryBuilder.in("key", normalizedKeys);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return (data ?? []) as GlobalSetting[];
    },
    enabled: isBrowser && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: async (settings: GlobalSetting[]) => {
      if (!isBrowser) return [];
      if (!settings.length) return [];

      const { data, error } = await supabase
        .from("global_settings")
        .upsert(
          settings.map((s) => ({
            key: s.key,
            value: s.value ?? "",
            category: s.category ?? null,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "key" }
        )
        .select("key, value, category");

      if (error) throw error;
      return (data ?? []) as GlobalSetting[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
    },
  });

  const saveSettingsAsync = isBrowser
    ? saveMutation.mutateAsync
    : async (): Promise<GlobalSetting[]> => [];

  return {
    settings: isBrowser ? query.data ?? [] : [],
    isLoading: isBrowser ? query.isLoading : false,
    error: isBrowser ? query.error : null,
    saveSettingsAsync,
    isSaving: isBrowser ? saveMutation.isPending : false,
  };
}
