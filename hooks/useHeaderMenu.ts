import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getValidAccessToken } from "@/lib/authToken";
import { toast } from "sonner";

export interface HeaderMenuItem {
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

// Public hook - fetches only active items
export function useHeaderMenu() {
  return useQuery({
    queryKey: ["header-menu"],
    queryFn: async (): Promise<HeaderMenuItem[]> => {
      const { data, error } = await supabase
        .from("header_menu_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HeaderMenuItem[];
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes — menu rarely changes
  });
}

// Admin hook - fetches all items including inactive
export function useAdminHeaderMenu() {
  return useQuery({
    queryKey: ["admin-header-menu"],
    queryFn: async (): Promise<HeaderMenuItem[]> => {
      const { data, error } = await supabase
        .from("header_menu_items")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HeaderMenuItem[];
    },
  });
}

// Admin mutations
export function useHeaderMenuMutations() {
  const queryClient = useQueryClient();

  const callAdminNavigationApi = async (
    method: "POST" | "PATCH" | "DELETE" | "PUT",
    payload: Record<string, unknown>,
  ) => {
    const accessToken = await getValidAccessToken();
    const response = await fetch("/api/admin/navigation/header", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; data?: HeaderMenuItem; error?: { message?: string } }
      | null;

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error?.message || "Failed to update header menu.");
    }

    return data.data;
  };

  const createItem = useMutation({
    mutationFn: async (data: { name: string; href: string; icon: string; translation_key?: string; open_in_new_tab?: boolean }) => {
      return await callAdminNavigationApi("POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-header-menu"] });
      queryClient.invalidateQueries({ queryKey: ["header-menu"] });
      toast.success("Menu item created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create menu item: ${error.message}`);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...data }: Partial<HeaderMenuItem> & { id: string }) => {
      return await callAdminNavigationApi("PATCH", { id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-header-menu"] });
      queryClient.invalidateQueries({ queryKey: ["header-menu"] });
      toast.success("Menu item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update menu item: ${error.message}`);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await callAdminNavigationApi("DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-header-menu"] });
      queryClient.invalidateQueries({ queryKey: ["header-menu"] });
      toast.success("Menu item deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete menu item: ${error.message}`);
    },
  });

  const reorderItems = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await callAdminNavigationApi("PUT", { orderedIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-header-menu"] });
      queryClient.invalidateQueries({ queryKey: ["header-menu"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder items: ${error.message}`);
    },
  });

  return {
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}
