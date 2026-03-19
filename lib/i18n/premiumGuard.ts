const PREMIUM_TOKEN = "__AO_PREMIUM_TOKEN__";

const PREMIUM_REPLACEMENT_PATTERNS: RegExp[] = [
  /\bde\s+\p{L}*luj\p{L}*\b/giu,
  /\bde\s+\p{L}*lux\p{L}*\b/giu,
  /\bdi\s+\p{L}*luss\p{L}*\b/giu,
  /\bvan\s+\p{L}*lux\p{L}*\b/giu,
  /\b\p{L}*lux\p{L}*\b/giu,
  /\b\p{L}*luks\p{L}*\b/giu,
  /\b\p{L}*lyx\p{L}*\b/giu,
  /\b\p{L}*luj\p{L}*\b/giu,
  /\b\p{L}*luss\p{L}*\b/giu,
  /\b\p{L}*førsteklass\p{L}*\b/giu,
  /\b\p{L}*ersteklas\p{L}*\b/giu,
  /\b\p{L}*hochwert\p{L}*\b/giu,
  /\b\p{L}*pr[æa]mi\p{L}*\b/giu,
];

function hasPremium(value: string) {
  return /premium/i.test(value);
}

export function flattenI18nData(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenI18nData(value as Record<string, unknown>, fullKey));
      continue;
    }

    result[fullKey] = String(value ?? "");
  }

  return result;
}

export function unflattenI18nData(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [dottedKey, value] of Object.entries(flat)) {
    const parts = dottedKey.split(".");
    let current = result;

    for (let i = 0; i < parts.length - 1; i += 1) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

export function protectPremiumInSourceText(value: string) {
  if (!hasPremium(value)) return value;
  return value.replace(/premium/gi, PREMIUM_TOKEN);
}

export function enforcePremiumInTranslation(
  sourceEnglishValue: string,
  translatedValue: string,
): string {
  if (!hasPremium(sourceEnglishValue)) return translatedValue;

  let normalized = translatedValue.split(PREMIUM_TOKEN).join("Premium");

  for (const pattern of PREMIUM_REPLACEMENT_PATTERNS) {
    normalized = normalized.replace(pattern, "Premium");
  }

  normalized = normalized.replace(/premium/gi, "Premium");
  normalized = normalized.replace(/\bPremium\s+Premium\b/g, "Premium");

  if (!hasPremium(normalized)) {
    return sourceEnglishValue.replace(/premium/gi, "Premium");
  }

  return normalized;
}

export function enforcePremiumInLocaleData(
  localeData: Record<string, unknown>,
  englishData: Record<string, unknown>,
): Record<string, unknown> {
  const englishFlat = flattenI18nData(englishData);
  const localeFlat = flattenI18nData(localeData);
  const premiumSafeFlat = { ...localeFlat };

  for (const [key, englishValue] of Object.entries(englishFlat)) {
    if (!hasPremium(englishValue)) continue;
    const localeValue = localeFlat[key] ?? englishValue;
    premiumSafeFlat[key] = enforcePremiumInTranslation(englishValue, localeValue);
  }

  return unflattenI18nData(premiumSafeFlat);
}
