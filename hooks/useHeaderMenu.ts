import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  const createItem = useMutation({
    mutationFn: async (data: { name: string; href: string; icon: string; translation_key?: string; open_in_new_tab?: boolean }) => {
      // Get max display_order
      const { data: existing, error: existingError } = await supabase
        .from("header_menu_items")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      if (existingError) throw existingError;
      
      const maxOrder = existing?.[0]?.display_order ?? 0;

      const { data: created, error } = await supabase
        .from("header_menu_items")
        .insert({ ...data, display_order: maxOrder + 1 })
        .select()
        .single();

      if (error) throw error;
      return created;
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
      const { data: updated, error } = await supabase
        .from("header_menu_items")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
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
      const { error } = await supabase
        .from("header_menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
      const results = await Promise.all(
        orderedIds.map((id, index) =>
        supabase
          .from("header_menu_items")
          .update({ display_order: index + 1 })
          .eq("id", id)
        ),
      );

      const failedResult = results.find((result) => result.error);
      if (failedResult?.error) throw failedResult.error;
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
