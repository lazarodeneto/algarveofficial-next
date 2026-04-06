import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n/config";

export interface LegalSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

type LegalSettingsRow = {
  id: string;
  sections: unknown;
};

function normalizeLocale(locale?: string | null) {
  if (!locale) return null;
  return locale.trim().toLowerCase().replace("_", "-");
}

/**
 * Legal settings fallback contract:
 * 1) Try exact locale row (`fr`, `pt-pt`, etc.)
 * 2) Try language-only row when locale has region (`pt` from `pt-pt`)
 * 3) Fall back to global `default`
 *
 * Tables currently use `default` in production. Locale rows are optional
 * and can be introduced without frontend changes.
 */
export function buildLegalSettingsCandidateIds(locale?: string | null): string[] {
  const normalized = normalizeLocale(locale);
  if (!normalized || normalized === DEFAULT_LOCALE) {
    return ["default"];
  }

  const ids: string[] = [];

  if (isValidLocale(normalized)) {
    ids.push(normalized);
    if (normalized.includes("-")) {
      const baseLanguage = normalized.split("-")[0];
      if (baseLanguage && baseLanguage !== DEFAULT_LOCALE) {
        ids.push(baseLanguage);
      }
    }
  }

  ids.push("default");

  return Array.from(new Set(ids));
}

export function parseLegalSections(rawSections: unknown, fallbackIcon: string): LegalSection[] {
  if (!Array.isArray(rawSections)) {
    return [];
  }

  return rawSections.map((item) => {
    const obj = item as Record<string, unknown>;
    return {
      id: String(obj.id || ""),
      title: String(obj.title || ""),
      icon: String(obj.icon || fallbackIcon),
      content: String(obj.content || ""),
    };
  });
}

export function pickLegalSettingsRowByLocale<Row extends LegalSettingsRow>(
  rows: Row[],
  locale?: string | null,
): Row | null {
  if (!rows.length) return null;

  const candidates = buildLegalSettingsCandidateIds(locale);
  const byId = new Map(rows.map((row) => [row.id, row]));

  for (const candidate of candidates) {
    const match = byId.get(candidate);
    if (match) return match;
  }

  return rows.find((row) => row.id === "default") ?? rows[0] ?? null;
}
