export type BeachWeatherCoordinateSource = "listing" | "category_data" | null;

export type BeachWeatherCoordinates = {
  isBeachListing: boolean;
  latitude: number | null;
  longitude: number | null;
  hasCoordinates: boolean;
  source: BeachWeatherCoordinateSource;
};

type ResolveBeachWeatherCoordinatesInput = {
  categorySlug?: string | null;
  categoryName?: string | null;
  listingLatitude?: unknown;
  listingLongitude?: unknown;
  categoryData?: unknown;
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeCategoryValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isBeachesCategory(categorySlug?: string | null, categoryName?: string | null) {
  return normalizeCategoryValue(categorySlug) === "beaches" || normalizeCategoryValue(categoryName) === "beaches";
}

function readCoordinatePair(record: Record<string, unknown>) {
  return {
    latitude: toFiniteNumber(record.latitude ?? record.Latitude ?? record.lat),
    longitude: toFiniteNumber(record.longitude ?? record.Longitude ?? record.lng ?? record.lon),
  };
}

function readCategoryDataCoordinates(categoryData: unknown) {
  const details = asRecord(categoryData);
  const coordinates = asRecord(details.coordinates ?? details.location ?? details.geo);
  const direct = readCoordinatePair(details);
  const nested = readCoordinatePair(coordinates);

  return {
    latitude: direct.latitude ?? nested.latitude,
    longitude: direct.longitude ?? nested.longitude,
  };
}

export function resolveBeachWeatherCoordinates({
  categorySlug,
  categoryName,
  listingLatitude,
  listingLongitude,
  categoryData,
}: ResolveBeachWeatherCoordinatesInput): BeachWeatherCoordinates {
  const isBeachListing = isBeachesCategory(categorySlug, categoryName);

  if (!isBeachListing) {
    return {
      isBeachListing: false,
      latitude: null,
      longitude: null,
      hasCoordinates: false,
      source: null,
    };
  }

  const listingCoordinates = {
    latitude: toFiniteNumber(listingLatitude),
    longitude: toFiniteNumber(listingLongitude),
  };

  if (listingCoordinates.latitude !== null && listingCoordinates.longitude !== null) {
    return {
      isBeachListing: true,
      latitude: listingCoordinates.latitude,
      longitude: listingCoordinates.longitude,
      hasCoordinates: true,
      source: "listing",
    };
  }

  const categoryDataCoordinates = readCategoryDataCoordinates(categoryData);

  if (categoryDataCoordinates.latitude !== null && categoryDataCoordinates.longitude !== null) {
    return {
      isBeachListing: true,
      latitude: categoryDataCoordinates.latitude,
      longitude: categoryDataCoordinates.longitude,
      hasCoordinates: true,
      source: "category_data",
    };
  }

  return {
    isBeachListing: true,
    latitude: null,
    longitude: null,
    hasCoordinates: false,
    source: null,
  };
}
