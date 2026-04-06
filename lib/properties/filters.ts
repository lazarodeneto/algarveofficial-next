type PropertyFilterInput = {
  type: string;
  beds: string;
};

type ListingLike = {
  category_data: unknown;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return NaN;
}

export function matchesPropertyCategoryFilters(
  listing: ListingLike,
  filters: PropertyFilterInput,
): boolean {
  const data = toRecord(listing.category_data);
  const selectedType = filters.type.trim().toLowerCase();

  if (selectedType !== "all") {
    const propertyType =
      typeof data.property_type === "string" ? data.property_type.trim().toLowerCase() : "";
    if (propertyType !== selectedType) {
      return false;
    }
  }

  if (filters.beds !== "all") {
    const selectedBeds = Number.parseInt(filters.beds, 10);
    if (Number.isFinite(selectedBeds)) {
      const bedrooms = toNumber(data.bedrooms);
      if (!Number.isFinite(bedrooms) || bedrooms < selectedBeds) {
        return false;
      }
    }
  }

  return true;
}
