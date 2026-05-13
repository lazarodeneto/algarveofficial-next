export type UiTranslationStoredStatus =
  | "translated"
  | "reviewed"
  | "edited"
  | "pending_manual"
  | "missing"
  | "stale"
  | "obsolete"
  | "failed";

export type UiTranslationKeyStatus =
  | "complete"
  | "missing"
  | "stale"
  | "obsolete"
  | "empty"
  | "invalid"
  | "pending_manual";

export interface TranslationKeyMetadata {
  sourceHash?: string | null;
  status?: UiTranslationStoredStatus | null;
  updatedAt?: string | null;
  reviewedAt?: string | null;
}

export interface FlattenTranslationResult {
  values: Record<string, string>;
  duplicateKeys: string[];
  invalidKeys: string[];
}

export interface TranslationKeyClassification {
  sourceKeys: string[];
  targetKeys: string[];
  completeKeys: string[];
  missingKeys: string[];
  staleKeys: string[];
  obsoleteKeys: string[];
  emptyValueKeys: string[];
  invalidKeys: string[];
  pendingManualKeys: string[];
  statusByKey: Record<string, UiTranslationKeyStatus>;
}

export interface LocaleCoverageResult extends TranslationKeyClassification {
  sourceKeyCount: number;
  translatedKeyCount: number;
  presentKeyCount: number;
  missingKeyCount: number;
  staleKeyCount: number;
  obsoleteKeyCount: number;
  emptyValueKeyCount: number;
  invalidKeyCount: number;
  pendingManualKeyCount: number;
  coveragePercent: number;
  coverageLabel: string;
  isFullySynced: boolean;
}

export interface AllLocaleCoverageResult {
  locales: Record<string, LocaleCoverageResult>;
  sourceKeyCount: number;
  localeCount: number;
  fullySyncedLocaleCount: number;
  totalMissingAcrossLocales: number;
  totalStaleAcrossLocales: number;
  totalObsoleteAcrossLocales: number;
  totalEmptyAcrossLocales: number;
  totalPendingManualAcrossLocales: number;
  uniqueMissingSourceKeys: string[];
  overallCoveragePercent: number;
  overallCoverageLabel: string;
}

function valueToTranslationString(value: unknown): string {
  return String(value ?? "");
}

function flattenInto(
  input: Record<string, unknown>,
  prefix: string,
  result: FlattenTranslationResult,
) {
  for (const [key, value] of Object.entries(input)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (!key.trim()) {
      result.invalidKeys.push(path);
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenInto(value as Record<string, unknown>, path, result);
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(result.values, path)) {
      result.duplicateKeys.push(path);
    }
    result.values[path] = valueToTranslationString(value);
  }
}

export function flattenTranslationKeys(input: Record<string, unknown>): FlattenTranslationResult {
  const result: FlattenTranslationResult = {
    values: {},
    duplicateKeys: [],
    invalidKeys: [],
  };
  flattenInto(input, "", result);
  return result;
}

export function hashTranslationSource(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function sortKeys(keys: Iterable<string>): string[] {
  return Array.from(keys).sort((a, b) => a.localeCompare(b));
}

export function formatCoveragePercent(percent: number, hasOpenIssues: boolean): string {
  if (!Number.isFinite(percent) || percent <= 0) return "0%";
  if (!hasOpenIssues && percent >= 100) return "100%";

  const rounded = Math.round(percent * 10) / 10;
  const safePercent = hasOpenIssues && rounded >= 100
    ? 99.9
    : rounded;
  return `${safePercent.toFixed(1)}%`;
}

export function classifyTranslationKeys(
  sourceValues: Record<string, string>,
  targetValues: Record<string, string>,
  metadata: Record<string, TranslationKeyMetadata> = {},
  extraInvalidKeys: readonly string[] = [],
): TranslationKeyClassification {
  const sourceKeys = sortKeys(Object.keys(sourceValues));
  const targetKeys = sortKeys(Object.keys(targetValues));
  const sourceKeySet = new Set(sourceKeys);
  const targetKeySet = new Set(targetKeys);

  const completeKeys: string[] = [];
  const missingKeys: string[] = [];
  const staleKeys: string[] = [];
  const emptyValueKeys: string[] = [];
  const pendingManualKeys: string[] = [];
  const invalidKeySet = new Set(extraInvalidKeys);
  const statusByKey: Record<string, UiTranslationKeyStatus> = {};

  for (const key of sourceKeys) {
    const meta = metadata[key];

    if (!targetKeySet.has(key)) {
      missingKeys.push(key);
      statusByKey[key] = "missing";
      continue;
    }

    const value = targetValues[key];
    if (typeof value !== "string") {
      invalidKeySet.add(key);
      statusByKey[key] = "invalid";
      continue;
    }

    if (value.trim().length === 0) {
      emptyValueKeys.push(key);
      statusByKey[key] = "empty";
      continue;
    }

    if (meta?.status === "stale") {
      staleKeys.push(key);
      statusByKey[key] = "stale";
      continue;
    }

    if (meta?.status === "failed") {
      invalidKeySet.add(key);
      statusByKey[key] = "invalid";
      continue;
    }

    const currentSourceHash = hashTranslationSource(sourceValues[key] ?? "");
    if (meta?.sourceHash && meta.sourceHash !== currentSourceHash) {
      staleKeys.push(key);
      statusByKey[key] = "stale";
      continue;
    }

    if (meta?.status === "pending_manual" || meta?.status === "missing") {
      pendingManualKeys.push(key);
      statusByKey[key] = "pending_manual";
      continue;
    }

    completeKeys.push(key);
    statusByKey[key] = "complete";
  }

  const obsoleteKeys = targetKeys.filter((key) => !sourceKeySet.has(key));
  for (const key of obsoleteKeys) {
    statusByKey[key] = "obsolete";
  }

  for (const key of invalidKeySet) {
    statusByKey[key] = statusByKey[key] ?? "invalid";
  }

  return {
    sourceKeys,
    targetKeys,
    completeKeys,
    missingKeys,
    staleKeys: sortKeys(staleKeys),
    obsoleteKeys,
    emptyValueKeys: sortKeys(emptyValueKeys),
    invalidKeys: sortKeys(invalidKeySet),
    pendingManualKeys: sortKeys(pendingManualKeys),
    statusByKey,
  };
}

export function calculateLocaleCoverage(
  sourceValues: Record<string, string>,
  targetValues: Record<string, string>,
  metadata: Record<string, TranslationKeyMetadata> = {},
  extraInvalidKeys: readonly string[] = [],
): LocaleCoverageResult {
  const classified = classifyTranslationKeys(sourceValues, targetValues, metadata, extraInvalidKeys);
  const sourceKeyCount = classified.sourceKeys.length;
  const openIssueCount =
    classified.missingKeys.length +
    classified.staleKeys.length +
    classified.obsoleteKeys.length +
    classified.emptyValueKeys.length +
    classified.invalidKeys.length +
    classified.pendingManualKeys.length;
  const coveragePercent =
    sourceKeyCount > 0 ? (classified.completeKeys.length / sourceKeyCount) * 100 : 0;

  return {
    ...classified,
    sourceKeyCount,
    translatedKeyCount: classified.completeKeys.length,
    presentKeyCount: sourceKeyCount - classified.missingKeys.length,
    missingKeyCount: classified.missingKeys.length,
    staleKeyCount: classified.staleKeys.length,
    obsoleteKeyCount: classified.obsoleteKeys.length,
    emptyValueKeyCount: classified.emptyValueKeys.length,
    invalidKeyCount: classified.invalidKeys.length,
    pendingManualKeyCount: classified.pendingManualKeys.length,
    coveragePercent,
    coverageLabel: formatCoveragePercent(coveragePercent, openIssueCount > 0),
    isFullySynced: openIssueCount === 0,
  };
}

export function calculateAllLocaleCoverage(
  sourceValues: Record<string, string>,
  localeTargets: Record<string, Record<string, string>>,
  localeMetadata: Record<string, Record<string, TranslationKeyMetadata>> = {},
): AllLocaleCoverageResult {
  const locales: Record<string, LocaleCoverageResult> = {};
  const uniqueMissing = new Set<string>();

  let translatedSlots = 0;
  let sourceSlots = 0;
  let totalMissingAcrossLocales = 0;
  let totalStaleAcrossLocales = 0;
  let totalObsoleteAcrossLocales = 0;
  let totalEmptyAcrossLocales = 0;
  let totalPendingManualAcrossLocales = 0;

  for (const [locale, targetValues] of Object.entries(localeTargets)) {
    const coverage = calculateLocaleCoverage(sourceValues, targetValues, localeMetadata[locale]);
    locales[locale] = coverage;
    translatedSlots += coverage.translatedKeyCount;
    sourceSlots += coverage.sourceKeyCount;
    totalMissingAcrossLocales += coverage.missingKeyCount;
    totalStaleAcrossLocales += coverage.staleKeyCount;
    totalObsoleteAcrossLocales += coverage.obsoleteKeyCount;
    totalEmptyAcrossLocales += coverage.emptyValueKeyCount;
    totalPendingManualAcrossLocales += coverage.pendingManualKeyCount;
    for (const key of coverage.missingKeys) uniqueMissing.add(key);
  }

  const hasOpenIssues =
    totalMissingAcrossLocales +
      totalStaleAcrossLocales +
      totalObsoleteAcrossLocales +
      totalEmptyAcrossLocales +
      totalPendingManualAcrossLocales >
    0;
  const overallCoveragePercent = sourceSlots > 0 ? (translatedSlots / sourceSlots) * 100 : 0;

  return {
    locales,
    sourceKeyCount: Object.keys(sourceValues).length,
    localeCount: Object.keys(localeTargets).length,
    fullySyncedLocaleCount: Object.values(locales).filter((coverage) => coverage.isFullySynced).length,
    totalMissingAcrossLocales,
    totalStaleAcrossLocales,
    totalObsoleteAcrossLocales,
    totalEmptyAcrossLocales,
    totalPendingManualAcrossLocales,
    uniqueMissingSourceKeys: sortKeys(uniqueMissing),
    overallCoveragePercent,
    overallCoverageLabel: formatCoveragePercent(overallCoveragePercent, hasOpenIssues),
  };
}
