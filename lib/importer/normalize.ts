export type NormalizedJson =
  | string
  | number
  | boolean
  | null
  | NormalizedJson[]
  | { [key: string]: NormalizedJson };

export function normalizeImportValue(value: unknown): NormalizedJson {
  if (value === undefined || value === null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeImportValue(item))
      .filter((item) => item !== null);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([key, entryValue]) => [key, normalizeImportValue(entryValue)] as const)
        .filter(([, entryValue]) => entryValue !== null),
    );
  }

  return null;
}

export function normalizeImportObject(value: unknown): Record<string, NormalizedJson> {
  const normalized = normalizeImportValue(value);
  return normalized && typeof normalized === "object" && !Array.isArray(normalized)
    ? normalized
    : {};
}
