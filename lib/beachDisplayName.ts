const ENGLISH_BEACH_NAME_OVERRIDES: Record<string, string> = {
  "praia da rocha": "Rock Beach",
  "praia da falesia": "Falesia Beach",
  "praia da marinha": "Marinha Beach",
  "praia do camilo": "Camilo Beach",
  "praia do barril": "Barril Beach",
  "praia de benagil": "Benagil Beach",
  "praia dos tres irmaos": "Three Brothers Beach",
};

const PORTUGUESE_BEACH_PREFIX_RE = /^praia\s+(?:da|do|de|das|dos)\s+(.+)$/i;

function normalizeBeachName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function isEnglishLocale(locale: string): boolean {
  const normalized = locale.toLowerCase().replaceAll("_", "-");
  return normalized === "en" || normalized.startsWith("en-");
}

function isBeachCategorySlug(categorySlug?: string | null): boolean {
  if (!categorySlug) return false;
  const normalized = categorySlug.trim().toLowerCase();
  return normalized === "beaches" || normalized.includes("beach");
}

function buildGenericEnglishBeachAlias(portugueseName: string): string | null {
  const match = portugueseName.trim().match(PORTUGUESE_BEACH_PREFIX_RE);
  if (!match?.[1]) return null;
  return `${match[1].trim()} Beach`;
}

export function getEnglishBeachDisplayName(
  portugueseName: string,
  locale: string,
  categorySlug?: string | null,
): string {
  if (!portugueseName?.trim()) return portugueseName;
  if (!isEnglishLocale(locale)) return portugueseName;
  if (!isBeachCategorySlug(categorySlug)) return portugueseName;

  const normalizedBeachName = normalizeBeachName(portugueseName);
  const englishName =
    ENGLISH_BEACH_NAME_OVERRIDES[normalizedBeachName] ??
    buildGenericEnglishBeachAlias(portugueseName);

  if (!englishName) return portugueseName;
  return `${englishName} - ${portugueseName}`;
}
