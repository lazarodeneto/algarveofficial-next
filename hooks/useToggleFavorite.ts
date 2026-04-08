"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { UserFavoriteRow } from "@/hooks/useUserFavorites";
import type { TablesInsert } from "@/integrations/supabase/types";

type FavoriteType = "listing" | "category" | "city" | "region";

interface TogglePayload {
    type: FavoriteType;
    id: string;
}

export function useToggleFavorite() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ type, id }: TogglePayload) => {
            if (!user?.id) throw new Error("User not authenticated");

            // 🔍 Check if already exists
            const { data: existing } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq(`${type}_id`, id)
                .maybeSingle();

            // ❌ REMOVE
            if (existing) {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("id", existing.id);

                if (error) throw error;

                return { action: "removed", id, type };
            }

            // ✅ ADD
            const payload: TablesInsert<"favorites"> = { user_id: user.id };

            if (type === "listing") payload.listing_id = id;
            if (type === "category") payload.category_id = id;
            if (type === "city") payload.city_id = id;
            if (type === "region") payload.region_id = id;

            const { error } = await supabase.from("favorites").insert(payload);

            if (error) throw error;

            return { action: "added", id, type };
        },

        // ⚡ OPTIMISTIC UPDATE
        onMutate: async ({ type, id }) => {
            await queryClient.cancelQueries({ queryKey: ["favorites"] });

            const previous =
                queryClient.getQueryData<UserFavoriteRow[]>(["favorites", "all", user?.id]) || [];

            const exists = previous.some(
                (f) => f[`${type}_id` as keyof UserFavoriteRow] === id
            );

            let updated: UserFavoriteRow[];

            if (exists) {
                updated = previous.filter(
                    (f) => f[`${type}_id` as keyof UserFavoriteRow] !== id
                );
            } else {
                updated = [
                    ...previous,
                    {
                        id: "temp-" + id,
                        user_id: user!.id,
                        listing_id: null,
                        category_id: null,
                        city_id: null,
                        region_id: null,
                        created_at: new Date().toISOString(),
                        [`${type}_id`]: id,
                    } as UserFavoriteRow,
                ];
            }

            queryClient.setQueryData(["favorites", "all", user?.id], updated);

            return { previous };
        },

        // ❌ ROLLBACK
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    ["favorites", "all", user?.id],
                    context.previous
                );
            }
        },

        // 🔄 SYNC WITH SERVER
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        },
    });
}
