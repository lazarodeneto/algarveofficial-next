"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  if (typeof window === "undefined") {
    return {
      data: [] as LeftMenuItem[],
      isLoading: false,
      error: null,
    };
  }
  return useQuery({
    queryKey: ["left-menu"],
    queryFn: async (): Promise<LeftMenuItem[]> => {
      if (isPublicLeftMenuUnavailableCached()) {
        return [];
      }

      const { data, error } = await (supabase.from("left_menu_items" as any) as any)
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
      return data as LeftMenuItem[];
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useAdminLeftMenu() {
  if (typeof window === "undefined") {
    return {
      data: [] as LeftMenuItem[],
      isLoading: false,
      error: null,
    };
  }
  return useQuery({
    queryKey: ["admin-left-menu"],
    queryFn: async (): Promise<LeftMenuItem[]> => {
      const { data, error } = await (supabase.from("left_menu_items" as any) as any)
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as LeftMenuItem[];
    },
  });
}

export function useLeftMenuMutations() {
  const queryClient = useQueryClient();

  if (typeof window === "undefined") {
    return {
      createItem: { mutate: () => {}, mutateAsync: async () => ({}), isPending: false } as any,
      updateItem: { mutate: () => {}, mutateAsync: async () => ({}), isPending: false } as any,
      deleteItem: { mutate: () => {}, mutateAsync: async () => ({}), isPending: false } as any,
      reorderItems: { mutate: () => {}, mutateAsync: async () => ({}), isPending: false } as any,
    };
  }

  const createItem = useMutation({
    mutationFn: async (data: { name: string; href: string; icon: string; translation_key?: string; open_in_new_tab?: boolean }) => {
      const { data: existing, error: existingError } = await (supabase.from("left_menu_items" as any) as any)
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      if (existingError) throw existingError;

      const maxOrder = existing?.[0]?.display_order ?? 0;

      const { data: created, error } = await (supabase.from("left_menu_items" as any) as any)
        .insert({ ...data, display_order: maxOrder + 1 })
        .select()
        .single();

      if (error) throw error;
      return created;
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
      const { data: updated, error } = await (supabase.from("left_menu_items" as any) as any)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
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
      const { error } = await (supabase.from("left_menu_items" as any) as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
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
      const results = await Promise.all(
        orderedIds.map((id, index) =>
          (supabase.from("left_menu_items" as any) as any)
            .update({ display_order: index + 1 })
            .eq("id", id),
        ),
      );

      const failedResult = results.find((result: { error?: unknown }) => result.error);
      if (failedResult?.error) throw failedResult.error;
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
