"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Region {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_visible_destinations: boolean;
  display_order: number;
  created_at: string;
}

export function useRegions(options?: { featuredOnly?: boolean; activeOnly?: boolean; destinationsOnly?: boolean }) {
  if (typeof window === "undefined") {
    return {
      data: [],
      isLoading: false,
      error: null,
    } as any;
  }
  return useQuery({
    queryKey: ["regions", options],
    queryFn: async () => {
      let query = supabase
        .from("regions")
        .select("*")
        .order("display_order", { ascending: true });

      // If destinationsOnly is true and activeOnly is not explicitly set, skip is_active filter
      const shouldFilterByActive = options?.destinationsOnly 
        ? options?.activeOnly === true 
        : options?.activeOnly !== false;

      if (shouldFilterByActive) {
        query = query.eq("is_active", true);
      }

      if (options?.featuredOnly) {
        query = query.eq("is_featured", true);
      }

      if (options?.destinationsOnly) {
        query = query.eq("is_visible_destinations", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Region[];
    },
  });
}

export function useCities(options?: { activeOnly?: boolean }) {
  if (typeof window === "undefined") {
    return {
      data: [],
      isLoading: false,
      error: null,
    } as any;
  }
  return useQuery({
    queryKey: ["cities", options],
    queryFn: async () => {
      let query = supabase
        .from("cities")
        .select("*")
        .order("display_order", { ascending: true });

      if (options?.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}
