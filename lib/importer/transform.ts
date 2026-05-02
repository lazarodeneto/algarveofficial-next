import type { Json } from "@/integrations/supabase/types";
import {
  normalizeImportListing,
  type GolfHoleImport,
  type NormalizedImportListing,
} from "@/lib/admin/listing-json-import";

export type ImporterDbPayload = {
  normalized: NormalizedImportListing;
  listing: NormalizedImportListing["base"];
  categoryDataPatch: Record<string, Json>;
  golfHoles: GolfHoleImport[];
};

export function transformImportListing(
  value: unknown,
  index: number,
  options: { fallbackCategory?: string; existingSlugs?: Set<string> } = {},
): ImporterDbPayload {
  const normalized = normalizeImportListing(value, index, options);

  return {
    normalized,
    listing: normalized.base,
    categoryDataPatch: normalized.categoryDataPatch,
    golfHoles: normalized.golfHoles,
  };
}
