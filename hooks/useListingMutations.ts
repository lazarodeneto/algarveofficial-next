"use client";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

/**
 * Upload a file to Supabase Storage and return the public URL
 */
async function uploadImageToStorage(file: File, listingId: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'webp';
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

      // Insert the listing
      const { data: newListing, error: listingError } = await supabase
        .from('listings')
        .insert(listing)
        .select()
        .single();

      if (listingError) {
        console.error('Error creating listing:', listingError);
        throw listingError;
      }

      // Insert images if provided
      if (images && images.length > 0 && newListing) {
        // Upload new images to storage first
        const processedImages = await processImages(images, newListing.id);

        const imageRows = processedImages.map((img) => ({
          listing_id: newListing.id,
          image_url: img.url,
          alt_text: img.alt_text || null,
          is_featured: img.is_featured,
          display_order: img.display_order,
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageRows);

        if (imagesError) {
          console.error('Error creating listing images:', imagesError);
          // Don't throw - listing was created successfully
        }

        // Update featured_image_url with the first processed image
        const featuredImage = processedImages.find(img => img.is_featured) || processedImages[0];
        if (featuredImage) {
          await supabase
            .from('listings')
            .update({ featured_image_url: featuredImage.url })
            .eq('id', newListing.id);
        }
      }

      return newListing;
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

      // Update the listing
      const { data: updatedListing, error: listingError } = await supabase
        .from('listings')
        .update(listing)
        .eq('id', id)
        .select()
        .single();

      if (listingError) {
        console.error('Error updating listing:', listingError);
        throw listingError;
      }

      // Update images if provided
      if (images !== undefined && updatedListing) {
        // Upload new images to storage first
        const processedImages = images.length > 0
          ? await processImages(images, id)
          : [];

        // Delete existing images from database
        const { error: deleteError } = await supabase
          .from('listing_images')
          .delete()
          .eq('listing_id', id);

        if (deleteError) {
          console.error('Error deleting old images:', deleteError);
          throw new Error(`Failed to replace listing images: ${deleteError.message}`);
        }

        // Insert new images
        if (processedImages.length > 0) {
          const imageRows = processedImages.map((img) => ({
            listing_id: id,
            image_url: img.url,
            alt_text: img.alt_text || null,
            is_featured: img.is_featured,
            display_order: img.display_order,
          }));

          const { error: imagesError } = await supabase
            .from('listing_images')
            .insert(imageRows);

          if (imagesError) {
            console.error('Error updating listing images:', imagesError);
            throw new Error(`Failed to save listing images: ${imagesError.message}`);
          }

          // Update featured_image_url with the first processed image
          const featuredImage = processedImages.find(img => img.is_featured) || processedImages[0];
          if (featuredImage) {
            const { error: featuredError } = await supabase
              .from('listings')
              .update({ featured_image_url: featuredImage.url })
              .eq('id', id);
            if (featuredError) {
              throw new Error(`Failed to update featured image: ${featuredError.message}`);
            }
          }
        } else {
          const { error: clearFeaturedError } = await supabase
            .from('listings')
            .update({ featured_image_url: null })
            .eq('id', id);
          if (clearFeaturedError) {
            throw new Error(`Failed to clear featured image: ${clearFeaturedError.message}`);
          }
        }
      }

      return updatedListing;
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

      const { error } = await supabase.rpc('admin_delete_listings', {
        listing_ids: [id],
      });

      if (error) {
        console.error('Error deleting listing:', error);
        throw error;
      }

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

      const updateData: ListingUpdate = { status };

      // Set published_at when publishing
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating listing status:', error);
        throw error;
      }

      return data;
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

      const { error } = await supabase.rpc('admin_delete_listings', {
        listing_ids: ids,
      });

      if (error) {
        console.error('Error bulk deleting listings:', error);
        throw error;
      }

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

      const publishedAt = new Date().toISOString();

      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batchIds = ids.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('listings')
          .update({
            status: 'published' as const,
            published_at: publishedAt
          })
          .in('id', batchIds);

        if (error) {
          console.error('Error bulk publishing listings batch:', {
            batchStart: i,
            batchSize: batchIds.length,
            error,
          });
          throw error;
        }
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
  const BATCH_SIZE = 200;
  const isBrowser = typeof window !== "undefined";

  return useMutation({
    mutationFn: async ({ ids, tier }: { ids: string[]; tier: 'unverified' | 'verified' | 'signature' }) => {
      if (!isBrowser) return { ids, tier };

      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batchIds = ids.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('listings')
          .update({ tier })
          .in('id', batchIds);

        if (error) {
          console.error('Error bulk updating tier batch:', {
            batchStart: i,
            batchSize: batchIds.length,
            error,
          });
          throw error;
        }
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
