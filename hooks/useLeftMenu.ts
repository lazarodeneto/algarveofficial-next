"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getValidAccessToken } from "@/lib/authToken";
import { toast } from "sonner";
import { isMissingSupabaseRelation } from "@/lib/supabaseErrors";

export interface LeftMenuItem {
  id: string;
  name: string;
  translation_key: string | null;
  href: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

const PUBLIC_LEFT_MENU_DISABLED_KEY = "ao:left-menu-unavailable";

function cachePublicLeftMenuUnavailable() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PUBLIC_LEFT_MENU_DISABLED_KEY, "1");
}

function isPublicLeftMenuUnavailableCached() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PUBLIC_LEFT_MENU_DISABLED_KEY) === "1";
}

export function useLeftMenu() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["left-menu"],
    queryFn: async (): Promise<LeftMenuItem[]> => {
      if (isPublicLeftMenuUnavailableCached()) {
        return [];
      }

      const { data, error } = await supabase
        .from("left_menu_items" as never)
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        if (isMissingSupabaseRelation(error, "left_menu_items")) {
          cachePublicLeftMenuUnavailable();
          return [];
        }
        throw error;
      }
      return (data ?? []) as unknown as LeftMenuItem[];
    },
    enabled: isBrowser,
    initialData: [] as LeftMenuItem[],
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useAdminLeftMenu() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ["admin-left-menu"],
    queryFn: async (): Promise<LeftMenuItem[]> => {
      const { data, error } = await supabase
        .from("left_menu_items" as never)
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as LeftMenuItem[];
    },
    enabled: isBrowser,
    initialData: [] as LeftMenuItem[],
  });
}

export function useLeftMenuMutations() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  const callAdminNavigationApi = async (
    method: "POST" | "PATCH" | "DELETE" | "PUT",
    payload: Record<string, unknown>,
  ) => {
    const accessToken = await getValidAccessToken();
    const response = await fetch("/api/admin/navigation/left", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; data?: LeftMenuItem; error?: { message?: string } }
      | null;

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error?.message || "Failed to update left menu.");
    }

    return data.data;
  };

  const createItem = useMutation({
    mutationFn: async (data: { name: string; href: string; icon: string; translation_key?: string; open_in_new_tab?: boolean }) => {
      if (!isBrowser) return {} as LeftMenuItem;
      const created = await callAdminNavigationApi("POST", data);
      return (created ?? {}) as LeftMenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-left-menu"] });
      queryClient.invalidateQueries({ queryKey: ["left-menu"] });
      toast.success("Left menu item created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create left menu item: ${error.message}`);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeftMenuItem> & { id: string }) => {
      if (!isBrowser) return {} as LeftMenuItem;
      const updated = await callAdminNavigationApi("PATCH", { id, ...data });
      return (updated ?? {}) as LeftMenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-left-menu"] });
      queryClient.invalidateQueries({ queryKey: ["left-menu"] });
      toast.success("Left menu item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update left menu item: ${error.message}`);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return;
      await callAdminNavigationApi("DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-left-menu"] });
      queryClient.invalidateQueries({ queryKey: ["left-menu"] });
      toast.success("Left menu item deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete left menu item: ${error.message}`);
    },
  });

  const reorderItems = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!isBrowser) return;
      await callAdminNavigationApi("PUT", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-left-menu"] });
      queryClient.invalidateQueries({ queryKey: ["left-menu"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder left menu items: ${error.message}`);
    },
  });

  return {
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}
