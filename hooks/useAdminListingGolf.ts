import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type {
  GolfCourseStructure,
  GolfHoleDataStatus,
  ListingGolfCourseForm,
  ListingGolfDetailsForm,
} from "@/types/listing";

interface AdminApiError {
  code?: string;
  message?: string;
}

interface AdminApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: AdminApiError;
}

export interface AdminGolfData {
  structure: GolfCourseStructure;
  details: ListingGolfDetailsForm;
  courses: ListingGolfCourseForm[];
  status: GolfHoleDataStatus;
}

export interface UpsertAdminGolfPayload {
  structure?: GolfCourseStructure;
  details?: Partial<ListingGolfDetailsForm>;
  courses?: ListingGolfCourseForm[];
  clear_courses?: boolean;
  generate_empty_holes?: boolean; // backwards-compatible quick action
  holes_count?: number | null; // backwards-compatible quick action
}

async function getAdminAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message || "Failed to read current session.");
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Missing authentication token.");
  }

  return token;
}

async function parseJsonResponse<T>(response: Response): Promise<AdminApiResponse<T> | null> {
  try {
    return (await response.json()) as AdminApiResponse<T>;
  } catch {
    return null;
  }
}

async function adminGolfRequest<T>(
  listingId: string,
  init: Omit<RequestInit, "headers"> & { headers?: HeadersInit },
): Promise<T> {
  const token = await getAdminAccessToken();

  const response = await fetch(`/api/admin/listings/${encodeURIComponent(listingId)}/golf`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  const payload = await parseJsonResponse<T>(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error?.message || `Request failed (${response.status}).`);
  }

  return payload.data as T;
}

export function useAdminListingGolf(listingId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["admin-listing-golf", listingId],
    enabled: Boolean(listingId) && enabled,
    queryFn: async () => {
      if (!listingId) return null;
      return adminGolfRequest<AdminGolfData>(listingId, {
        method: "GET",
      });
    },
  });
}

export function useUpsertAdminListingGolf(listingId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertAdminGolfPayload) => {
      if (!listingId) {
        throw new Error("Listing id is required.");
      }

      return adminGolfRequest<AdminGolfData>(listingId, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-listing-golf", listingId] });
    },
  });
}
