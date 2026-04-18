"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getValidAccessToken } from "@/lib/authToken";
import { toast } from "sonner";

async function callAdminListingsApi(
  url: string,
  method: "POST" | "PATCH",
  body: unknown
) {
  const token = await getValidAccessToken();

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error?.message || "Admin listings request failed.");
  }

  return data.data;
}

/* ---------------- CREATE ---------------- */

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listing, images }: any) => {
      return await callAdminListingsApi("/api/admin/listings", "POST", {
        listing: {
          ...listing,
          published_status: "draft",
        },
        images,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing created");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/* ---------------- UPDATE FULL ---------------- */

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, listing, images }: any) => {
      return await callAdminListingsApi(
        `/api/admin/listings/${id}`,
        "PATCH",
        {
          ...listing,
          images,
          status: "draft",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/* ---------------- STATUS ---------------- */

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await callAdminListingsApi(
        `/api/admin/listings/${id}`,
        "PATCH",
        { status: "draft" }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/* ---------------- BULK ---------------- */

export function useBulkPublishListings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await callAdminListingsApi("/api/admin/listings", "PATCH", {
        action: "bulk-publish",
        ids,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listings published");
    },
  });
}

export function useBulkDeleteListings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      return await callAdminListingsApi("/api/admin/listings", "PATCH", {
        action: "bulk-delete",
        ids,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listings deleted");
    },
  });
}

export function useBulkUpdateTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, tier }: any) => {
      return await callAdminListingsApi("/api/admin/listings", "PATCH", {
        action: "bulk-update-tier",
        ids,
        tier,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Tier updated");
    },
  });
}

export function useToggleListingCurated() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_curated }: any) => {
      return await callAdminListingsApi(
        `/api/admin/listings/${id}`,
        "PATCH",
        { is_curated }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Curated updated");
    },
  });
}
