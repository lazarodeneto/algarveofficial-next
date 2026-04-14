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
  "Albufeira",
  "Loulé",
  "Portimão",
  "Lagos",
  "Tavira",
  "Olhão",
  "Lagoa",
  "Faro",
] as const;

const LOCALITY_TO_MUNICIPALITY: Record<string, string> = {
  // Loulé municipalities and localities
  loule: "Loulé",
  almancil: "Loulé",
  quarteira: "Loulé",
  vilamoura: "Loulé",
  "quinta-do-lago": "Loulé",
  "vale-do-lobo": "Loulé",
  boliqueime: "Loulé",
  "sao-clemente": "Loulé",
  "loule-sao-clemente": "Loulé",
  // Portimão municipalities
  portimao: "Portimão",
  alvor: "Portimão",
  "mexilhoeira-grande": "Portimão",
  "praia-da-rocha": "Portimão",
  // Lagoa municipalities
  lagoa: "Lagoa",
  carvoeiro: "Lagoa",
  ferragudo: "Lagoa",
  porches: "Lagoa",
  estombar: "Lagoa",
  // Albufeira municipalities
  albufeira: "Albufeira",
  guia: "Albufeira",
  ferreiras: "Albufeira",
  "olhos-de-agua": "Albufeira",
  // Lagos municipalities
  lagos: "Lagos",
  "praia-da-luz": "Lagos",
  luz: "Lagos",
  // Tavira municipalities
  tavira: "Tavira",
  "castro-marim": "Tavira",
  "santa-luzia": "Tavira",
  alcoutim: "Tavira",
  // Olhão municipalities
  olhao: "Olhão",
  "olhao-doce-vida": "Olhão",
  // Faro municipalities
  faro: "Faro",
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

function resolveMunicipalityForCity(
  city: CityRow,
  cityRegionMappings: CityRegionMappingRow[],
  regionById: Map<string, RegionRow>,
  municipalityByKey: Map<string, string>,
) {
  const directMunicipality = findMunicipalityByCityName(city, municipalityByKey);
  const mapped = findMunicipalityByMapping(city.id, cityRegionMappings, regionById, municipalityByKey);
  const fallbackMunicipality = findMunicipalityByFallback(city);
  return {
    municipalityName: directMunicipality ?? mapped.municipality ?? fallbackMunicipality,
    regionId: mapped.regionId ?? null,
  };
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

    const { municipalityName, regionId } = resolveMunicipalityForCity(
      city,
      cityRegionMappings,
      regionById,
      municipalityByKey,
    );
    if (!municipalityName) continue;

    const municipalityKey = normalizeKey(municipalityName);
    const existing = aggregate.get(municipalityKey);

    if (!existing) {
      aggregate.set(municipalityKey, {
        municipalityName,
        totalCount: count,
        cityIds: new Set([city.id]),
        regionId,
        representativeCity: city,
        representativeCount: count,
      });
      continue;
    }

    existing.totalCount += count;
    existing.cityIds.add(city.id);
    if (!existing.regionId && regionId) {
      existing.regionId = regionId;
    }
    if (count > existing.representativeCount) {
      existing.representativeCity = city;
      existing.representativeCount = count;
    }
  }

  // Preserve full municipality membership for ALL cities, even those with
  // zero direct listing count in the current dataset. This ensures complete
  // municipality filtering and accurate counts.
  for (const city of cities) {
    const { municipalityName } = resolveMunicipalityForCity(
      city,
      cityRegionMappings,
      regionById,
      municipalityByKey,
    );
    if (!municipalityName) continue;

    const municipalityKey = normalizeKey(municipalityName);
    const existing = aggregate.get(municipalityKey);

    // Add city to existing municipality aggregate
    if (existing) {
      existing.cityIds.add(city.id);
    } else {
      // If no group exists yet (municipality has no listings), create one
      // to ensure we capture all cities in the municipality
      aggregate.set(municipalityKey, {
        municipalityName,
        totalCount: 0,
        cityIds: new Set([city.id]),
        regionId: null,
        representativeCity: city,
        representativeCount: 0,
      });
    }
  }

  const items: Array<MunicipalityCityIndexItem | null> = TARGET_MUNICIPALITIES.map((municipalityName) => {
    const municipalityKey = normalizeKey(municipalityName);
    const group = aggregate.get(municipalityKey);
    const municipalityCity = municipalityCityByKey.get(municipalityKey);

    // If no group and no direct municipality city, check if we have any city from this municipality
    let representative = municipalityCity ?? group?.representativeCity ?? null;

    // If still no representative, look through all cities to find one that matches this municipality
    if (!representative && cities.length > 0) {
      const candidateCity = cities.find(city => normalizeKey(city.name) === municipalityKey);
      if (candidateCity) {
        representative = candidateCity;
      }
    }

    // Include municipality even without a representative (zero listings case)
    if (!representative) return null;

    return {
      id: representative.id,
      slug: representative.slug ?? toSlug(municipalityName),
      name: municipalityName,
      short_description: representative.short_description ?? null,
      image_url: representative.image_url ?? null,
      hero_image_url: representative.hero_image_url ?? null,
      totalCount: group?.totalCount ?? 0,
      municipalityRegionId: group?.regionId ?? null,
      municipalityCityIds: group ? Array.from(group.cityIds) : [],
    } satisfies MunicipalityCityIndexItem;
  });

  return items.filter((item): item is MunicipalityCityIndexItem => item !== null);
}
