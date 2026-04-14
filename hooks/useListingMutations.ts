"use client";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getValidAccessToken } from "@/lib/authToken";
import { toast } from 'sonner';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ListingInsert = TablesInsert<'listings'>;
export type ListingUpdate = TablesUpdate<'listings'>;

interface ImageInput {
  url: string;
  alt_text?: string;
  is_featured: boolean;
  display_order: number;
  /** File to upload (for new images with blob URLs) */
  _file?: File;
}

interface CreateListingParams {
  listing: ListingInsert;
  images?: ImageInput[];
}

interface UpdateListingParams {
  id: string;
  listing: ListingUpdate;
  images?: ImageInput[];
}

type AdminApiPayload = {
  ok?: boolean;
  data?: Record<string, unknown> | null;
  error?: { message?: string };
};

async function callAdminListingsApi(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  payload?: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const data = (await response.json().catch(() => null)) as AdminApiPayload | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error?.message || "Admin listings request failed.");
  }

  return data?.data ?? null;
}

/**
 * Upload a file to Supabase Storage and return the public URL
 */
async function uploadImageToStorage(file: File, listingId: string): Promise<string> {
  const fileExt = file.name.split('.').pop() ?? 'webp';
  const fileName = `${listingId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(fileName, file, {
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('listing-images')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Process images - upload new ones and keep existing URLs
 */
async function processImages(images: ImageInput[], listingId: string): Promise<ImageInput[]> {
  const processedImages = await Promise.all(
    images.map(async (img) => {
      // If the image has a file attached (new upload), upload it to storage
      if (img._file && img.url.startsWith('blob:')) {
        const publicUrl = await uploadImageToStorage(img._file, listingId);
        return {
          ...img,
          url: publicUrl,
          _file: undefined, // Remove the file reference
        };
      }
      // Existing image - keep the URL as is
      return img;
    })
  );
  return processedImages;
}

/**
 * Create a new listing
 */
export function useCreateListing() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ listing, images }: CreateListingParams) => {
      if (!isBrowser) return null;

      const listingId = (listing.id as string | null | undefined) ?? crypto.randomUUID();
      const processedImages = images && images.length > 0
        ? await processImages(images, listingId)
        : [];

      const data = await callAdminListingsApi("/api/admin/listings", "POST", {
        listing,
        images: processedImages,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast.success('Listing created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create listing: ${error.message}`);
    },
  });
}

/**
 * Update an existing listing
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ id, listing, images }: UpdateListingParams) => {
      if (!isBrowser) return null;

      const processedImages = images !== undefined
        ? (images.length > 0 ? await processImages(images, id) : [])
        : undefined;

      const data = await callAdminListingsApi(`/api/admin/listings/${id}`, "PATCH", {
        listing,
        ...(processedImages !== undefined ? { images: processedImages } : {}),
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data?.id] });
      toast.success('Listing updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });
}

/**
 * Delete a listing
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isBrowser) return id;
      await callAdminListingsApi(`/api/admin/listings/${id}`, "DELETE");

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast.success('Listing deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
    },
  });
}

/**
 * Update listing status
 */
export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'pending_review' | 'published' | 'rejected' }) => {
      if (!isBrowser) {
        return { id, status } as ListingUpdate & { id: string };
      }

      const data = await callAdminListingsApi(`/api/admin/listings/${id}`, "PATCH", { status });
      return data as ListingUpdate & { id: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data?.id] });
      toast.success(`Listing status updated to ${data?.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

/**
 * Bulk delete multiple listings (admin only).
 * Delegates all cascade cleanup to the admin_delete_listings RPC which runs
 * as SECURITY DEFINER, bypassing RLS on all dependent tables.
 */
export function useBulkDeleteListings() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isBrowser) return ids;

      await callAdminListingsApi("/api/admin/listings", "PATCH", {
        action: "bulk-delete",
        ids,
      });

      return ids;
    },
    onSuccess: (ids) => {
      // Optimistically remove deleted items from cache immediately
      queryClient.setQueryData(['admin-all-listings'], (old: { id: string }[] | undefined) =>
        old ? old.filter((l) => !ids.includes(l.id)) : []
      );
      // Then force a hard refetch to sync with DB
      queryClient.removeQueries({ queryKey: ['listings'] });
      queryClient.refetchQueries({ queryKey: ['admin-all-listings'] });
      toast.success(`${ids.length} listing(s) deleted successfully`);
    },
    onError: (error: Error & { code?: string; details?: string; hint?: string }) => {
      const detail = [error.code, error.message, error.details, error.hint].filter(Boolean).join(' | ');
      toast.error(`Delete failed: ${detail}`, { duration: 10000 });
    },
  });
}

/**
 * Bulk publish multiple listings
 */
export function useBulkPublishListings() {
  const queryClient = useQueryClient();
  const BATCH_SIZE = 200;
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!isBrowser) return ids;

      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batchIds = ids.slice(i, i + BATCH_SIZE);
        await callAdminListingsApi("/api/admin/listings", "PATCH", {
          action: "bulk-publish",
          ids: batchIds,
        });
      }

      return ids;
    },
    onSuccess: (ids) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast.success(`${ids.length} listing(s) published successfully`);
    },
    onError: (error: Error & { code?: string; details?: string; hint?: string }) => {
      const detail = [error.code, error.message, error.details, error.hint].filter(Boolean).join(' | ');
      toast.error(`Failed to publish listings: ${detail}`, { duration: 10000 });
    },
  });
}

/**
 * Bulk update tier for multiple listings
 */
export function useBulkUpdateTier() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ ids, tier }: { ids: string[]; tier: 'unverified' | 'verified' | 'signature' }) => {
      if (!isBrowser) return { ids, tier };
      const accessToken = await getValidAccessToken();
      const response = await fetch("/api/admin/listings/bulk-tier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ids, tier }),
      });

      let payload: { error?: string } | null = null;
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to update listing tier.");
      }

      return { ids, tier };
    },
    onSuccess: ({ ids, tier }) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast.success(`${ids.length} listing(s) updated to ${tier} tier`);
    },
    onError: (error: Error & { code?: string; details?: string; hint?: string }) => {
      const detail = [error.code, error.message, error.details, error.hint].filter(Boolean).join(' | ');
      toast.error(`Failed to update tier: ${detail}`, { duration: 10000 });
    },
  });
}

export function useToggleListingCurated() {
  const queryClient = useQueryClient();
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ id, isCurated }: { id: string; isCurated: boolean }) => {
      if (!isBrowser) return { id, is_curated: isCurated };
      const data = await callAdminListingsApi(`/api/admin/listings/${id}`, "PATCH", {
        is_curated: isCurated,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast.success(variables.isCurated ? "Added to curated list" : "Removed from curated list");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update curated status: ${error.message}`);
    },
  });
}
