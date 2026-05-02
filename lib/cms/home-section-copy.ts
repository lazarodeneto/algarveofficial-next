export type HomeSectionCopy = {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaHref?: string | null;
};

export type HomeSectionCopyMap = Record<string, HomeSectionCopy>;

export function cmsText(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : fallback;
}

export function normalizeCmsTextInput(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = typeof value === "string" ? value : String(value);
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeHomeSectionCopy(value: unknown): HomeSectionCopy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;

  return {
    eyebrow: normalizeCmsTextInput(record.eyebrow),
    title: normalizeCmsTextInput(record.title),
    subtitle: normalizeCmsTextInput(record.subtitle),
    description: normalizeCmsTextInput(record.description),
    ctaLabel: normalizeCmsTextInput(record.ctaLabel),
    ctaHref: normalizeCmsTextInput(record.ctaHref),
    secondaryCtaLabel: normalizeCmsTextInput(record.secondaryCtaLabel),
    secondaryCtaHref: normalizeCmsTextInput(record.secondaryCtaHref),
  };
}

export function normalizeHomeSectionCopyMap(value: unknown): HomeSectionCopyMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const normalized: HomeSectionCopyMap = {};

  Object.entries(record).forEach(([sectionId, copy]) => {
    normalized[sectionId] = normalizeHomeSectionCopy(copy);
  });

  return normalized;
}

export function mergeHomeSectionCopyMaps(
  fallback: unknown,
  override: unknown,
): HomeSectionCopyMap {
  const fallbackMap = normalizeHomeSectionCopyMap(fallback);
  const overrideMap = normalizeHomeSectionCopyMap(override);
  const sectionIds = new Set([...Object.keys(fallbackMap), ...Object.keys(overrideMap)]);
  const merged: HomeSectionCopyMap = {};

  sectionIds.forEach((sectionId) => {
    const overrideCopy = overrideMap[sectionId] ?? {};
    const nonEmptyOverride = Object.fromEntries(
      Object.entries(overrideCopy).filter(([, value]) => value !== null && value !== undefined),
    ) as HomeSectionCopy;
    merged[sectionId] = {
      ...(fallbackMap[sectionId] ?? {}),
      ...nonEmptyOverride,
    };
  });

  return merged;
}

export function isSafeHomeCtaHref(value: string | null | undefined): boolean {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return true;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
  return /^(#|\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(trimmed);
}

export function getHomeSectionCopy(
  copyMap: HomeSectionCopyMap | null | undefined,
  sectionId: string,
): HomeSectionCopy {
  return copyMap?.[sectionId] ?? {};
}
