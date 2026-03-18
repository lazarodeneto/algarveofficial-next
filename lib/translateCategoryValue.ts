import { TFunction } from "i18next";

function normalizeCategoryValueKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatFallbackCategoryValue(value: string): string {
  const clean = value.replace(/_/g, " ").trim().replace(/\s+/g, " ");
  if (!clean) return "";

  return clean
    .split(" ")
    .map((word) => {
      const chars = Array.from(word);
      if (chars.length === 0) return word;
      const [first, ...rest] = chars;
      return `${first.toLocaleUpperCase()}${rest.join("")}`;
    })
    .join(" ");
}

/**
 * Translates a category_data enum value using i18n keys.
 * Falls back to formatting the raw value if no translation key exists.
 */
export function translateCategoryValue(
  t: TFunction,
  value?: string | null
): string {
  if (!value) return "";
  const candidates = [value, normalizeCategoryValueKey(value)].filter(Boolean);

  for (const candidate of candidates) {
    const key = `categoryDataValues.${candidate}`;
    const translated = t(key);
    // If translation key not found, i18next returns the key itself.
    if (translated !== key) return translated;
  }

  // Fallback: Unicode-safe title case and underscore normalization.
  return formatFallbackCategoryValue(value);
}

/**
 * Translates an array of category_data enum values.
 */
export function translateCategoryValues(
  t: TFunction,
  values?: string[] | null
): string[] {
  if (!values || values.length === 0) return [];
  return values.map((v) => translateCategoryValue(t, v));
}
