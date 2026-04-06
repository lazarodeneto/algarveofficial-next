import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

export interface GlobalSetting {
  key: string;
  value: string;
  category: string | null;
}

interface UseGlobalSettingsOptions {
  enabled?: boolean;
  keys?: string[];
  locale?: string | null;
}

const EMPTY_GLOBAL_SETTINGS: GlobalSetting[] = [];

export function useGlobalSettings(options: UseGlobalSettingsOptions = {}) {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";
  const locale = options.locale?.trim() || "default";
  const normalizedKeys = options.keys?.length
    ? [...new Set(options.keys)].sort()
    : undefined;
  const cmsKeys = new Set<string>(Object.values(CMS_GLOBAL_SETTING_KEYS));
  const shouldUseCmsRuntime =
    !normalizedKeys || normalizedKeys.some((key) => cmsKeys.has(key));

  const query = useQuery({
    queryKey: ["global-settings", normalizedKeys ?? "all", locale],
    queryFn: async (): Promise<GlobalSetting[]> => {
      if (shouldUseCmsRuntime) {
        const params = new URLSearchParams();
        params.set("locale", locale);
        if (normalizedKeys?.length) {
          normalizedKeys.forEach((key) => params.append("key", key));
        }

        const response = await fetch(`/api/cms/runtime?${params.toString()}`);
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; data?: GlobalSetting[]; error?: { message?: string } }
          | null;

        if (response.ok && payload?.ok) {
          return (payload.data ?? []) as GlobalSetting[];
        }
      }

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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error("Missing authenticated session for admin global settings update.");
      }

      const response = await fetch("/api/admin/global-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ settings }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; data?: GlobalSetting[]; error?: { message?: string } }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error?.message || "Failed to update global settings.");
      }

      return (payload.data ?? []) as GlobalSetting[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-settings"] });
      queryClient.invalidateQueries({ queryKey: ["cms-runtime"] });
    },
  });

  const saveSettingsAsync = isBrowser
    ? saveMutation.mutateAsync
    : async (): Promise<GlobalSetting[]> => [];

  return {
    settings: isBrowser ? query.data ?? EMPTY_GLOBAL_SETTINGS : EMPTY_GLOBAL_SETTINGS,
    isLoading: isBrowser ? query.isLoading : false,
    error: isBrowser ? query.error : null,
    saveSettingsAsync,
    isSaving: isBrowser ? saveMutation.isPending : false,
  };
}
