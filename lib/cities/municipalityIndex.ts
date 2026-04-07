import type { Tables } from "@/integrations/supabase/types";

type CityRow = Tables<"cities">;
type RegionRow = Tables<"regions">;
type CityRegionMappingRow = Tables<"city_region_mapping">;

export interface MunicipalityCityIndexItem {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
  totalCount: number;
  municipalityRegionId?: string | null;
  municipalityCityIds?: string[];
}

export interface BuildMunicipalityCityIndexArgs {
  cities: CityRow[];
  cityListingCounts: Record<string, number>;
  cityRegionMappings?: CityRegionMappingRow[];
  regions?: RegionRow[];
}

const TARGET_MUNICIPALITIES = [
  "Loulé",
  "Faro",
  "Portimão",
  "Albufeira",
  "Lagos",
  "Lagoa",
] as const;

const LOCALITY_TO_MUNICIPALITY: Record<string, string> = {
  almancil: "Loulé",
  quarteira: "Loulé",
  vilamoura: "Loulé",
  "quinta-do-lago": "Loulé",
  "vale-do-lobo": "Loulé",
  boliqueime: "Loulé",
  "sao-clemente": "Loulé",
  "loule-sao-clemente": "Loulé",
  alvor: "Portimão",
  "mexilhoeira-grande": "Portimão",
  "praia-da-rocha": "Portimão",
  carvoeiro: "Lagoa",
  ferragudo: "Lagoa",
  porches: "Lagoa",
  estombar: "Lagoa",
  guia: "Albufeira",
  ferreiras: "Albufeira",
  "olhos-de-agua": "Albufeira",
  "praia-da-luz": "Lagos",
  luz: "Lagos",
};

function normalizeKey(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toSlug(value: string): string {
  return normalizeKey(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildMunicipalityCatalog() {
  const byKey = new Map<string, string>();
  for (const municipality of TARGET_MUNICIPALITIES) {
    byKey.set(normalizeKey(municipality), municipality);
  }
  return byKey;
}

function findMunicipalityByCityName(city: CityRow, municipalityByKey: Map<string, string>) {
  return municipalityByKey.get(normalizeKey(city.name)) ?? null;
}

function findMunicipalityByMapping(
  cityId: string,
  cityRegionMappings: CityRegionMappingRow[],
  regionById: Map<string, RegionRow>,
  municipalityByKey: Map<string, string>,
) {
  const mappedRows = cityRegionMappings.filter((row) => row.city_id === cityId);
  if (mappedRows.length === 0) return { municipality: null as string | null, regionId: null as string | null };

  const primary = mappedRows.find((row) => row.is_primary) ?? mappedRows[0];
  const region = regionById.get(primary.region_id);
  if (!region) return { municipality: null, regionId: primary.region_id };

  const municipality = municipalityByKey.get(normalizeKey(region.name)) ?? null;
  return { municipality, regionId: primary.region_id };
}

function findMunicipalityByFallback(city: CityRow) {
  const slugMatch = LOCALITY_TO_MUNICIPALITY[city.slug];
  if (slugMatch) return slugMatch;
  return LOCALITY_TO_MUNICIPALITY[toSlug(city.name)] ?? null;
}

export function buildMunicipalityCityIndex({
  cities,
  cityListingCounts,
  cityRegionMappings = [],
  regions = [],
}: BuildMunicipalityCityIndexArgs): MunicipalityCityIndexItem[] {
  const municipalityByKey = buildMunicipalityCatalog();
  const regionById = new Map(regions.map((region) => [region.id, region]));
  const municipalityCityByKey = new Map<string, CityRow>();

  for (const city of cities) {
    const key = normalizeKey(city.name);
    if (municipalityByKey.has(key)) {
      municipalityCityByKey.set(key, city);
    }
  }

  const aggregate = new Map<
    string,
    {
      municipalityName: string;
      totalCount: number;
      cityIds: Set<string>;
      regionId: string | null;
      representativeCity: CityRow | null;
      representativeCount: number;
    }
  >();

  for (const city of cities) {
    const count = cityListingCounts[city.id] ?? 0;
    if (count <= 0) continue;

    const directMunicipality = findMunicipalityByCityName(city, municipalityByKey);
    const mapped = findMunicipalityByMapping(city.id, cityRegionMappings, regionById, municipalityByKey);
    const fallbackMunicipality = findMunicipalityByFallback(city);
    const municipalityName = directMunicipality ?? mapped.municipality ?? fallbackMunicipality;
    if (!municipalityName) continue;

    const municipalityKey = normalizeKey(municipalityName);
    const existing = aggregate.get(municipalityKey);

    if (!existing) {
      aggregate.set(municipalityKey, {
        municipalityName,
        totalCount: count,
        cityIds: new Set([city.id]),
        regionId: mapped.regionId ?? null,
        representativeCity: city,
        representativeCount: count,
      });
      continue;
    }

    existing.totalCount += count;
    existing.cityIds.add(city.id);
    if (!existing.regionId && mapped.regionId) {
      existing.regionId = mapped.regionId;
    }
    if (count > existing.representativeCount) {
      existing.representativeCity = city;
      existing.representativeCount = count;
    }
  }

  return TARGET_MUNICIPALITIES.map((municipalityName) => {
    const municipalityKey = normalizeKey(municipalityName);
    const group = aggregate.get(municipalityKey);
    if (!group || group.totalCount <= 0) return null;

    const municipalityCity = municipalityCityByKey.get(municipalityKey);
    const representative = municipalityCity ?? group.representativeCity;
    if (!representative) return null;

    return {
      id: representative.id,
      slug: representative.slug || toSlug(municipalityName),
      name: municipalityName,
      short_description: representative.short_description ?? null,
      image_url: representative.image_url ?? null,
      hero_image_url: representative.hero_image_url ?? null,
      totalCount: group.totalCount,
      municipalityRegionId: group.regionId ?? null,
      municipalityCityIds: Array.from(group.cityIds),
    } satisfies MunicipalityCityIndexItem;
  }).filter((item): item is MunicipalityCityIndexItem => item !== null);
}
