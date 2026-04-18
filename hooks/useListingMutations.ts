import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ListingRow = Tables<"listings">;
type ListingStatus = ListingRow["status"];
type ListingMutationPayload =
  & Partial<TablesInsert<"listings">>
  & Partial<TablesUpdate<"listings">>
  & Record<string, unknown>;

interface AdminApiError {
  code?: string;
  message?: string;
}

interface AdminApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: AdminApiError;
}

export interface ListingMutationImageInput {
  url: string;
  alt_text?: string | null;
  is_featured?: boolean;
  display_order?: number;
  _file?: File;
}

export interface CreateListingVariables {
  listing: ListingMutationPayload;
  images?: ListingMutationImageInput[];
}

export interface UpdateListingVariables extends CreateListingVariables {
  id: string;
}

interface UpdateListingStatusVariables {
  id: string;
  status: ListingStatus;
}

interface DeleteListingsVariables {
  ids: string[];
}

interface ListingImageApiPayload {
  url: string;
  alt_text?: string | null;
  is_featured: boolean;
  display_order: number;
}

function invalidateAdminListingQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
  void queryClient.invalidateQueries({ queryKey: ["admin-all-listings"] });
  void queryClient.invalidateQueries({ queryKey: ["listing", "admin"] });
}

function buildStoragePath(file: File): string {
  const fromName = file.name.split(".").pop()?.trim().toLowerCase();

  let extension = fromName;
  if (!extension) {
    if (file.type === "image/webp") extension = "webp";
    else if (file.type === "image/png") extension = "png";
    else if (file.type === "image/jpeg") extension = "jpg";
    else extension = "bin";
  }

  const randomSegment =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `admin-listings/${Date.now()}-${randomSegment}.${extension}`;
}

async function uploadListingImage(file: File): Promise<string> {
  const path = buildStoragePath(file);

  const { error } = await supabase.storage.from("listing-images").upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(error.message || "Failed to upload image.");
  }

  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Failed to resolve uploaded image URL.");
  }

  return data.publicUrl;
}

async function normalizeListingImages(
  images: ListingMutationImageInput[] = [],
): Promise<ListingImageApiPayload[]> {
  const normalized = await Promise.all(
    images.map(async (image, index): Promise<ListingImageApiPayload> => {
      const uploadedUrl = image._file ? await uploadListingImage(image._file) : image.url;
      const url = uploadedUrl.trim();

      if (!url) {
        throw new Error("Listing image URL is required.");
      }

      return {
        url,
        alt_text: typeof image.alt_text === "string" ? image.alt_text : null,
        is_featured: image.is_featured === true,
        display_order: typeof image.display_order === "number" ? image.display_order : index,
      };
    }),
  );

  return normalized;
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

async function adminApiRequest<T>(
  url: string,
  init: Omit<RequestInit, "headers"> & { headers?: HeadersInit },
): Promise<T> {
  const token = await getAdminAccessToken();

  const response = await fetch(url, {
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

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingRow, Error, CreateListingVariables>({
    mutationFn: async ({ listing, images }) => {
      const normalizedImages = await normalizeListingImages(images);

      return adminApiRequest<ListingRow>("/api/admin/listings", {
        method: "POST",
        body: JSON.stringify({ listing, images: normalizedImages }),
      });
    },
    onSuccess: () => {
      invalidateAdminListingQueries(queryClient);
      toast.success("Listing created.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation<ListingRow | null, Error, UpdateListingVariables>({
    mutationFn: async ({ id, listing, images }) => {
      const normalizedImages = await normalizeListingImages(images);

      return adminApiRequest<ListingRow | null>(`/api/admin/listings/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ listing, images: normalizedImages }),
      });
    },
    onSuccess: () => {
      invalidateAdminListingQueries(queryClient);
      toast.success("Listing updated.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation<ListingRow | null, Error, UpdateListingStatusVariables>({
    mutationFn: async ({ id, status }) => {
      return adminApiRequest<ListingRow | null>(`/api/admin/listings/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      invalidateAdminListingQueries(queryClient);
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteListings() {
  const queryClient = useQueryClient();

  return useMutation<number, Error, DeleteListingsVariables>({
    mutationFn: async ({ ids }) => {
      const normalizedIds = Array.from(
        new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0)),
      );

      if (normalizedIds.length === 0) {
        throw new Error("No listings selected for deletion.");
      }

      const result = await adminApiRequest<{ count?: number }>("/api/admin/listings", {
        method: "PATCH",
        body: JSON.stringify({ action: "bulk-delete", ids: normalizedIds }),
      });

      return result?.count ?? normalizedIds.length;
    },
    onSuccess: (count) => {
      invalidateAdminListingQueries(queryClient);
      toast.success(`Deleted ${count} listing${count === 1 ? "" : "s"}.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
