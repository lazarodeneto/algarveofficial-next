import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getDisallowedSlugInputError, getSlugValidationError, normalizeSlug } from "@/lib/slugify";

export type ListingCanonicalSlugUpdateResult = {
  old_slug: string | null;
  new_slug: string;
};

export type ListingCanonicalSlugUpdateError = {
  code: string;
  message: string;
};

export type ListingCanonicalSlugUpdateResponse =
  | { data: ListingCanonicalSlugUpdateResult; error: null }
  | { data: null; error: ListingCanonicalSlugUpdateError };

type ListingSlugClient = Pick<SupabaseClient<Database>, "from">;

type SlugAliasLookup = {
  listing_id: string;
  slug: string;
  is_current: boolean;
};

type ListingSlugLookup = {
  id: string;
  slug: string | null;
};

function slugUpdateError(code: string, message: string): ListingCanonicalSlugUpdateResponse {
  return { data: null, error: { code, message } };
}

function postgrestError(code: string, error: PostgrestError): ListingCanonicalSlugUpdateResponse {
  return slugUpdateError(code, error.message || "Unable to update listing URL.");
}

export function normalizeListingCanonicalSlug(value: string) {
  return getDisallowedSlugInputError(value)
    ? value.trim()
    : normalizeSlug(value, { entityType: "listing" });
}

export function isMissingCanonicalSlugRpcError(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message ?? "";
  return (
    error?.code === "PGRST202" ||
    error?.code === "42883" ||
    /could not find the function .*update_listing_canonical_slug.*schema cache/i.test(message) ||
    /function .*update_listing_canonical_slug.*does not exist/i.test(message)
  );
}

async function findAliasBySlug(
  client: ListingSlugClient,
  slug: string,
): Promise<{ data: SlugAliasLookup | null; error: PostgrestError | null }> {
  const { data, error } = await client
    .from("listing_slugs")
    .select("listing_id, slug, is_current")
    .eq("slug", slug)
    .maybeSingle();

  return { data: (data as SlugAliasLookup | null) ?? null, error };
}

export async function updateListingCanonicalSlugDirect(
  client: ListingSlugClient,
  listingId: string,
  requestedSlug: string,
): Promise<ListingCanonicalSlugUpdateResponse> {
  const newSlug = normalizeListingCanonicalSlug(requestedSlug);
  const validationError = getSlugValidationError(newSlug, { entityType: "listing" });
  if (validationError) {
    return slugUpdateError("22023", validationError);
  }

  const { data: listing, error: listingError } = await client
    .from("listings")
    .select("id, slug")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError) {
    return postgrestError("LISTING_READ_FAILED", listingError);
  }
  if (!listing) {
    return slugUpdateError("P0002", "Listing was not found.");
  }

  const oldSlug = ((listing as ListingSlugLookup).slug ?? "").trim() || null;

  const { data: listingConflict, error: listingConflictError } = await client
    .from("listings")
    .select("id")
    .eq("slug", newSlug)
    .neq("id", listingId)
    .limit(1)
    .maybeSingle();

  if (listingConflictError) {
    return postgrestError("SLUG_CONFLICT_CHECK_FAILED", listingConflictError);
  }
  if (listingConflict) {
    return slugUpdateError("23505", `Slug "${newSlug}" is already used by another listing.`);
  }

  const { data: aliasConflict, error: aliasConflictError } = await client
    .from("listing_slugs")
    .select("listing_id")
    .eq("slug", newSlug)
    .neq("listing_id", listingId)
    .limit(1)
    .maybeSingle();

  if (aliasConflictError) {
    return postgrestError("SLUG_ALIAS_CONFLICT_CHECK_FAILED", aliasConflictError);
  }
  if (aliasConflict) {
    return slugUpdateError(
      "23505",
      `Slug "${newSlug}" is already reserved as a current or previous listing URL.`,
    );
  }

  const { error: clearCurrentError } = await client
    .from("listing_slugs")
    .update({ is_current: false })
    .eq("listing_id", listingId);
  if (clearCurrentError) {
    return postgrestError("SLUG_ALIAS_UPDATE_FAILED", clearCurrentError);
  }

  if (oldSlug && oldSlug !== newSlug) {
    const { data: oldAlias, error: oldAliasError } = await findAliasBySlug(client, oldSlug);
    if (oldAliasError) {
      return postgrestError("SLUG_ALIAS_READ_FAILED", oldAliasError);
    }

    if (!oldAlias) {
      const { error: insertOldAliasError } = await client
        .from("listing_slugs")
        .insert({ listing_id: listingId, slug: oldSlug, is_current: false });
      if (insertOldAliasError) {
        return postgrestError("SLUG_ALIAS_INSERT_FAILED", insertOldAliasError);
      }
    } else if (oldAlias.listing_id === listingId && oldAlias.is_current) {
      const { error: updateOldAliasError } = await client
        .from("listing_slugs")
        .update({ is_current: false })
        .eq("slug", oldSlug)
        .eq("listing_id", listingId);
      if (updateOldAliasError) {
        return postgrestError("SLUG_ALIAS_UPDATE_FAILED", updateOldAliasError);
      }
    }
  }

  const { error: listingUpdateError } = await client
    .from("listings")
    .update({ slug: newSlug })
    .eq("id", listingId);
  if (listingUpdateError) {
    return postgrestError("SLUG_LISTING_UPDATE_FAILED", listingUpdateError);
  }

  const { error: clearAfterListingUpdateError } = await client
    .from("listing_slugs")
    .update({ is_current: false })
    .eq("listing_id", listingId);
  if (clearAfterListingUpdateError) {
    return postgrestError("SLUG_ALIAS_UPDATE_FAILED", clearAfterListingUpdateError);
  }

  const { error: upsertCurrentError } = await client
    .from("listing_slugs")
    .upsert(
      {
        listing_id: listingId,
        slug: newSlug,
        is_current: true,
      },
      { onConflict: "slug" },
    );
  if (upsertCurrentError) {
    return postgrestError("SLUG_ALIAS_INSERT_FAILED", upsertCurrentError);
  }

  return {
    data: {
      old_slug: oldSlug,
      new_slug: newSlug,
    },
    error: null,
  };
}
