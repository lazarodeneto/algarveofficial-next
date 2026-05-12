import type { PublicLocationDTO } from "@/lib/public-data/types";

type MaybeArray<T> = T | T[] | null | undefined;

type LocationEntity = {
  name?: string | null;
  slug?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type LocationSource = {
  city?: MaybeArray<LocationEntity>;
  region?: MaybeArray<LocationEntity>;
  cityName?: string | null;
  regionName?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function unwrapRelation<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolvePublicLocation(
  source: LocationSource,
  options: { allowCityCoordinateFallback?: boolean } = {},
): PublicLocationDTO {
  const city = unwrapRelation(source.city);
  const region = unwrapRelation(source.region);
  const latitude =
    toFiniteNumber(source.latitude) ??
    (options.allowCityCoordinateFallback ? toFiniteNumber(city?.latitude) : null);
  const longitude =
    toFiniteNumber(source.longitude) ??
    (options.allowCityCoordinateFallback ? toFiniteNumber(city?.longitude) : null);

  return {
    city: cleanText(city?.name) ?? cleanText(source.cityName),
    region: cleanText(region?.name) ?? cleanText(source.regionName),
    country: cleanText(source.country) ?? "Portugal",
    latitude,
    longitude,
  };
}

