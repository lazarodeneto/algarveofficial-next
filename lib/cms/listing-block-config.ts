const DEFAULT_MAX_ITEMS = 24;

function normalizeId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeSelectedListingIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of value) {
    const id = normalizeId(raw);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}

export function normalizeListingFilterId(value: unknown): string | null {
  const normalized = normalizeId(value);
  return normalized || null;
}

export function normalizeListingMaxItems(value: unknown, fallback = DEFAULT_MAX_ITEMS): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;
  if (!Number.isFinite(parsedValue)) return fallback;
  const parsed = Math.floor(parsedValue);
  if (parsed < 1) return fallback;
  return parsed;
}

export function validateSelectedListingIds<TListing extends { id: string }>(
  selectedListingIds: string[],
  listings: TListing[],
): {
  validListingIds: string[];
  invalidListingIds: string[];
} {
  const validSet = new Set(
    listings
      .map((listing) => normalizeId(listing.id))
      .filter(Boolean),
  );

  const validListingIds: string[] = [];
  const invalidListingIds: string[] = [];

  for (const rawId of selectedListingIds) {
    const id = normalizeId(rawId);
    if (!id) continue;
    if (validSet.has(id)) {
      validListingIds.push(id);
      continue;
    }
    invalidListingIds.push(id);
  }

  return { validListingIds, invalidListingIds };
}
