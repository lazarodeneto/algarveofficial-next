export type CmsCityBlockMode = "all" | "curated";
export type CmsCityRankingMode = "manual" | "algorithmic";
export type CmsFeaturedCitySource = "manual" | "sponsored";

interface HasCityId {
  id: string;
}

function failFastConfig(message: string) {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(message);
  }
  console.error(message);
}

export function normalizeSelectedCityIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const deduped = new Set<string>();

  input.forEach((value) => {
    if (typeof value !== "string") return;
    const id = value.trim();
    if (!id) return;
    deduped.add(id);
  });

  return Array.from(deduped);
}

export function normalizeCityBlockMode(input: unknown): CmsCityBlockMode {
  return input === "curated" ? "curated" : "all";
}

export function normalizeCityRankingMode(input: unknown): CmsCityRankingMode {
  return input === "algorithmic" ? "algorithmic" : "manual";
}

export function normalizeFeaturedCitySource(input: unknown): CmsFeaturedCitySource {
  return input === "sponsored" ? "sponsored" : "manual";
}

export function normalizePriority(input: unknown): number | undefined {
  if (typeof input !== "number" || !Number.isFinite(input)) return undefined;
  return Math.max(1, Math.floor(input));
}

export function normalizeCityWeights(input: unknown): { sponsored: number; popularity: number } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { sponsored: 2, popularity: 1 };
  }

  const raw = input as Record<string, unknown>;
  const sponsored =
    typeof raw.sponsored === "number" && Number.isFinite(raw.sponsored)
      ? raw.sponsored
      : 2;
  const popularity =
    typeof raw.popularity === "number" && Number.isFinite(raw.popularity)
      ? raw.popularity
      : 1;

  return {
    sponsored,
    popularity,
  };
}

export function validateSelectedCityIds<TCity extends HasCityId>(
  blockId: string,
  selectedCityIds: string[],
  cities: TCity[],
): { validCityIds: string[]; invalidCityIds: string[] } {
  if (!selectedCityIds.length) {
    return { validCityIds: [], invalidCityIds: [] };
  }

  const cityIdSet = new Set(cities.map((city) => city.id));
  const validCityIds: string[] = [];
  const invalidCityIds: string[] = [];

  selectedCityIds.forEach((cityId) => {
    if (cityIdSet.has(cityId)) {
      validCityIds.push(cityId);
      return;
    }
    invalidCityIds.push(cityId);
  });

  if (invalidCityIds.length) {
    failFastConfig(
      `[cms-page-builder] Invalid city ids in "${blockId}" block config: ${invalidCityIds.join(", ")}`,
    );
  }

  return { validCityIds, invalidCityIds };
}
