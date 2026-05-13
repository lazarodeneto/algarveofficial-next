import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunctionWithAuthRetry } from "@/lib/supabaseFunctionInvoke";
import { fetchAdmin } from "@/lib/api/fetchAdmin";
import {
  getSupabaseFunctionErrorMessage,
  isSupabaseFunctionAuthError,
  isSupabaseFunctionTransportError,
} from "@/lib/supabaseFunctionError";
import {
  enforcePremiumInLocaleData,
  enforcePremiumInTranslation,
  flattenI18nData,
  protectPremiumInSourceText,
  unflattenI18nData,
} from "@/lib/i18n/premiumGuard";
import {
  calculateAllLocaleCoverage,
  calculateLocaleCoverage,
  flattenTranslationKeys,
  hashTranslationSource,
  type LocaleCoverageResult,
  type TranslationKeyMetadata,
  type UiTranslationKeyStatus,
  type UiTranslationStoredStatus,
} from "@/lib/i18n/translationCoverage";
import {
  LISTING_TRANSLATION_TARGET_LANGS,
  normalizeListingTranslationLanguageCode,
  queueListingTranslationJobs,
} from "@/lib/listingTranslationQueue";
import {
  ATTENTION_STATUSES,
  DONE_STATUSES,
  STATUS_LABELS,
  type AttentionCounts,
  type ListingJobGroup,
  type StatusCounts,
  type TranslationStatus,
} from "@/lib/admin/translations/types";
import { toast } from "sonner";
import {
  Languages,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Database,
  FileWarning,
  Globe2,
  ListChecks,
  PlayCircle,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { loadLocale } from "@/i18n/locale-loader";

// ── Locale configuration ──────────────────────────────────────────────────────
const LOCALES: { code: string; localeCode: string; name: string; flag: string }[] = [
  { code: "pt", localeCode: "pt-pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "de", localeCode: "de", name: "German", flag: "🇩🇪" },
  { code: "fr", localeCode: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", localeCode: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "it", localeCode: "it", name: "Italian", flag: "🇮🇹" },
  { code: "nl", localeCode: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "sv", localeCode: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "no", localeCode: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "da", localeCode: "da", name: "Danish", flag: "🇩🇰" },
];
const TARGET_LANGS = [...LISTING_TRANSLATION_TARGET_LANGS];
const TARGET_LANGS_SET = new Set<string>(TARGET_LANGS);
const LISTINGS_PAGE_SIZE = 100;
const MAX_INCOMPLETE_LISTINGS = 200;
const EMPTY_STATUS_COUNTS: StatusCounts = {
  missing: 0,
  queued: 0,
  auto: 0,
  reviewed: 0,
  edited: 0,
  failed: 0,
};
const EMPTY_ATTENTION_COUNTS: AttentionCounts = {
  total: 0,
  missing: 0,
  queued: 0,
  failed: 0,
  slaRiskCount: 0,
  signatureCount: 0,
  outdatedCount: 0,
};
const JOB_FILTERS: Array<"attention" | "all" | TranslationStatus> = [
  "attention",
  "all",
  "missing",
  "queued",
  "auto",
  "failed",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function mergeLocaleFlat(
  bundledLocaleData: Record<string, unknown>,
  dbLocaleData?: Record<string, unknown>,
) {
  return {
    ...flattenI18nData(bundledLocaleData),
    ...(dbLocaleData ? flattenI18nData(dbLocaleData) : {}),
  };
}

function calculateMergedLocaleCoverage(
  sourceFlat: Record<string, string>,
  bundledLocaleData: Record<string, unknown>,
  dbLocaleData?: Record<string, unknown>,
  metadata?: Record<string, TranslationKeyMetadata>,
) {
  const bundledInvalid = flattenTranslationKeys(bundledLocaleData).invalidKeys;
  const patchInvalid = dbLocaleData ? flattenTranslationKeys(dbLocaleData).invalidKeys : [];
  return calculateLocaleCoverage(
    sourceFlat,
    mergeLocaleFlat(bundledLocaleData, dbLocaleData),
    metadata,
    [...bundledInvalid, ...patchInvalid],
  );
}

function coverageStatus(coverage: LocaleCoverageResult): LocaleStatus {
  return coverage.isFullySynced ? "synced" : "missing";
}

// ── Types ─────────────────────────────────────────────────────────────────────
type LocaleStatus = "synced" | "missing" | "syncing" | "error";

interface LocaleState {
  code: string;
  localeCode: string;
  name: string;
  flag: string;
  missingCount: number;
  staleCount: number;
  obsoleteCount: number;
  emptyValueCount: number;
  invalidCount: number;
  pendingManualCount: number;
  translatedCount: number;
  totalKeys: number;
  coverageLabel: string;
  status: LocaleStatus;
  lastSynced?: string;
  lastRefreshed?: string;
  lastError?: string;
}

interface LocalePatchState {
  data: Record<string, unknown>;
  updatedAt: string;
}

interface LocaleKeyStatusRow {
  locale: string;
  key_path: string;
  source_hash: string;
  status: UiTranslationStoredStatus;
  reviewed_at?: string | null;
  updated_at?: string | null;
}

interface TranslationSchemaHealth {
  ready: boolean;
  checks: Array<{
    key: string;
    label: string;
    ready: boolean;
    message: string;
  }>;
}

interface IncompleteListing {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: string;
  missingLangs: string[];
  pendingLangs: string[];
  failedLangs: string[];
  staleLangs: string[];
  emptyFieldLangs: string[];
  fieldGaps: Record<string, string[]>;
}

interface TranslationReviewData {
  job: {
    id: string;
    listing_id: string;
    target_lang: string;
    source_lang: string;
    status: TranslationStatus;
    attempts?: number | null;
    last_error?: string | null;
    updated_at?: string;
  };
  listing: {
    id: string;
    name: string | null;
    slug?: string | null;
    short_description?: string | null;
    description?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    tier?: string | null;
    status?: string | null;
  } | null;
  translation: {
    id?: string;
    title?: string | null;
    short_description?: string | null;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    translation_status?: TranslationStatus;
    updated_at?: string;
  } | null;
}

interface TranslationDraft {
  title: string;
  short_description: string;
  description: string;
  seo_title: string;
  seo_description: string;
}

function isCompletedTranslationStatus(status: unknown): boolean {
  if (typeof status !== "string") return false;
  const normalized = status.toLowerCase();
  // Keep "translated" as a legacy-safe fallback in case older rows still exist.
  return (
    normalized === "auto" ||
    normalized === "reviewed" ||
    normalized === "edited" ||
    normalized === "translated"
  );
}

function chunkArray<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function formatJobFilterLabel(filter: "attention" | "all" | TranslationStatus): string {
  if (filter === "attention") return "Needs Attention";
  if (filter === "all") return "All Jobs";
  return STATUS_LABELS[filter];
}

function countJobs(groups: ListingJobGroup[]): number {
  return groups.reduce((total, group) => total + group.jobs.length, 0);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminTranslations() {
  const [englishData, setEnglishData] = useState<Record<string, unknown> | null>(null);
  const [localeDataByCode, setLocaleDataByCode] = useState<Record<string, Record<string, unknown>>>({});
  const enFlat = useMemo(() => flattenI18nData(englishData ?? {}), [englishData]);
  const enKeys = useMemo(() => Object.keys(enFlat), [enFlat]);
  const i18nClient = useMemo(
    () => supabase as unknown as { from: (table: string) => any },
    [],
  );

  useEffect(() => {
    let active = true;

    const loadBundledLocales = async () => {
      const [english, localeEntries] = await Promise.all([
        loadLocale("en"),
        Promise.all(
          LOCALES.map(async (locale) => [
            locale.code,
            await loadLocale(locale.localeCode),
          ] as const),
        ),
      ]);

      if (!active) return;
      setEnglishData(english);
      setLocaleDataByCode(Object.fromEntries(localeEntries));
    };

    void loadBundledLocales();
    return () => {
      active = false;
    };
  }, []);

  // Compute initial state from bundled locale files
  const initialLocaleStates: LocaleState[] = LOCALES.map((loc) => {
    const coverage = calculateMergedLocaleCoverage(
      enFlat,
      localeDataByCode[loc.code] ?? {},
    );
    return {
      code: loc.code,
      localeCode: loc.localeCode,
      name: loc.name,
      flag: loc.flag,
      missingCount: coverage.missingKeyCount,
      staleCount: coverage.staleKeyCount,
      obsoleteCount: coverage.obsoleteKeyCount,
      emptyValueCount: coverage.emptyValueKeyCount,
      invalidCount: coverage.invalidKeyCount,
      pendingManualCount: coverage.pendingManualKeyCount,
      translatedCount: coverage.translatedKeyCount,
      totalKeys: enKeys.length,
      coverageLabel: coverage.coverageLabel,
      status: coverageStatus(coverage),
    };
  });

  const [localeStates, setLocaleStates] = useState<LocaleState[]>(initialLocaleStates);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentLocale, setCurrentLocale] = useState<string | null>(null);
  const [selectedLocaleCode, setSelectedLocaleCode] = useState(LOCALES[0]?.code ?? "pt");
  const [localePatchDataByCode, setLocalePatchDataByCode] = useState<Record<string, LocalePatchState>>({});
  const [localeKeyMetadataByCode, setLocaleKeyMetadataByCode] = useState<
    Record<string, Record<string, TranslationKeyMetadata>>
  >({});
  const [uiKeyStatusFilter, setUiKeyStatusFilter] = useState<"all" | UiTranslationKeyStatus>("missing");
  const [coverageRefreshing, setCoverageRefreshing] = useState(false);
  const [lastCoverageRefresh, setLastCoverageRefresh] = useState<string | null>(null);
  const [processorConfigured, setProcessorConfigured] = useState(false);
  const [processorMessage, setProcessorMessage] = useState<string>(
    "Translation processor capability is loading.",
  );
  const [schemaHealth, setSchemaHealth] = useState<TranslationSchemaHealth | null>(null);
  const [schemaHealthError, setSchemaHealthError] = useState<string | null>(null);
  const [uiKeySearchQuery, setUiKeySearchQuery] = useState("");
  const [selectedUiKey, setSelectedUiKey] = useState<string | null>(null);
  const [uiKeyDraft, setUiKeyDraft] = useState("");
  const [isSavingUiKey, setIsSavingUiKey] = useState(false);
  const [translateBatch, setTranslateBatch] = useState(10);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState<any>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [missingTranslations, setMissingTranslations] = useState<IncompleteListing[]>([]);
  const [listingSearchQuery, setListingSearchQuery] = useState("");
  const [missingLoading, setMissingLoading] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [jobStatusFilter, setJobStatusFilter] = useState<"attention" | "all" | TranslationStatus>("attention");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobConsoleLoading, setJobConsoleLoading] = useState(false);
  const [jobConsoleError, setJobConsoleError] = useState<string | null>(null);
  const [jobCounts, setJobCounts] = useState<StatusCounts>(EMPTY_STATUS_COUNTS);
  const [attentionCounts, setAttentionCounts] = useState<AttentionCounts>(EMPTY_ATTENTION_COUNTS);
  const [jobGroups, setJobGroups] = useState<ListingJobGroup[]>([]);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobActionLoadingId, setJobActionLoadingId] = useState<string | null>(null);
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<TranslationReviewData | null>(null);
  const [reviewDraft, setReviewDraft] = useState<TranslationDraft>({
    title: "",
    short_description: "",
    description: "",
    seo_title: "",
    seo_description: "",
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const buildListingCoverageMaps = useCallback(async (listingIds: readonly string[]) => {
    const translatedMap = new Map<string, Set<string>>();
    const pendingMap = new Map<string, Set<string>>();
    const failedMap = new Map<string, Set<string>>();
    const staleMap = new Map<string, Set<string>>();
    const fieldGapMap = new Map<string, Map<string, string[]>>();
    const ids = Array.from(new Set(listingIds.filter(Boolean)));

    if (ids.length === 0) {
      return { translatedMap, pendingMap, failedMap, staleMap, fieldGapMap };
    }

    // Keep each chunk comfortably below Supabase's default 1000-row response cap.
    const idChunks = chunkArray(ids, 50);

    for (const chunk of idChunks) {
      const [{ data: translated, error: translatedError }, { data: jobs, error: jobsError }] =
        await Promise.all([
          supabase
            .from("listing_translations")
            .select("listing_id, language_code, translation_status, title, short_description, description, seo_title, seo_description, source_hash")
            .in("listing_id", chunk),
          supabase
            .from("translation_jobs")
            .select("listing_id, target_lang, status, source_updated_at, listing:listings!inner(content_updated_at)")
            .in("listing_id", chunk)
        ]);

      if (translatedError) throw translatedError;
      if (jobsError) throw jobsError;

      for (const translation of (translated || []) as any[]) {
        if (!translation?.listing_id || !translation?.language_code) continue;

        const normalizedLang = normalizeListingTranslationLanguageCode(translation.language_code);
        if (!TARGET_LANGS_SET.has(normalizedLang)) continue;
        const missingFields = ["title", "short_description", "description"].filter((field) => {
          const value = translation[field];
          return typeof value !== "string" || value.trim().length === 0;
        });

        if (translation.translation_status === "failed") {
          if (!failedMap.has(translation.listing_id)) failedMap.set(translation.listing_id, new Set());
          failedMap.get(translation.listing_id)!.add(normalizedLang);
          continue;
        }

        if (!isCompletedTranslationStatus(translation.translation_status) || missingFields.length > 0) {
          if (!fieldGapMap.has(translation.listing_id)) fieldGapMap.set(translation.listing_id, new Map());
          fieldGapMap.get(translation.listing_id)!.set(normalizedLang, missingFields);
          continue;
        }

        if (!translatedMap.has(translation.listing_id)) {
          translatedMap.set(translation.listing_id, new Set());
        }
        translatedMap.get(translation.listing_id)!.add(normalizedLang);
      }

      for (const job of (jobs || []) as any[]) {
        if (!job?.listing_id || !job?.target_lang) continue;

        const normalizedLang = normalizeListingTranslationLanguageCode(job.target_lang);
        if (!TARGET_LANGS_SET.has(normalizedLang)) continue;

        if (job.status === "queued") {
          if (!pendingMap.has(job.listing_id)) {
            pendingMap.set(job.listing_id, new Set());
          }
          pendingMap.get(job.listing_id)!.add(normalizedLang);
          continue;
        }
        if (job.status === "failed") {
          if (!failedMap.has(job.listing_id)) {
            failedMap.set(job.listing_id, new Set());
          }
          failedMap.get(job.listing_id)!.add(normalizedLang);
          continue;
        }
        const listing = Array.isArray(job.listing) ? job.listing[0] : job.listing;
        if (
          isCompletedTranslationStatus(job.status) &&
          job.source_updated_at &&
          listing?.content_updated_at &&
          new Date(job.source_updated_at).getTime() < new Date(listing.content_updated_at).getTime()
        ) {
          if (!staleMap.has(job.listing_id)) {
            staleMap.set(job.listing_id, new Set());
          }
          staleMap.get(job.listing_id)!.add(normalizedLang);
        }
      }
    }

    return { translatedMap, pendingMap, failedMap, staleMap, fieldGapMap };
  }, []);

  const collectMissingPublishedListings = useCallback(async (limit: number) => {
    const missing: IncompleteListing[] = [];
    let offset = 0;

    while (missing.length < limit) {
      const { data, error } = await supabase
        .from("listings")
        .select("id, name, slug, status, content_updated_at, cities(name)")
        .eq("status", "published")
        .order("name", { ascending: true })
        .range(offset, offset + LISTINGS_PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      const listingIds = data.map((listing: any) => String(listing.id));
      const { translatedMap, pendingMap, failedMap, staleMap, fieldGapMap } = await buildListingCoverageMaps(listingIds);

      for (const listing of data as any[]) {
        const translatedLangs = translatedMap.get(listing.id) ?? new Set<string>();
        const pendingLangsSet = pendingMap.get(listing.id) ?? new Set<string>();
        const failedLangsSet = failedMap.get(listing.id) ?? new Set<string>();
        const staleLangsSet = staleMap.get(listing.id) ?? new Set<string>();
        const fieldGapLangs = fieldGapMap.get(listing.id) ?? new Map<string, string[]>();
        const missingLangs = TARGET_LANGS.filter(
          (lang) =>
            !translatedLangs.has(lang) &&
            !pendingLangsSet.has(lang) &&
            !failedLangsSet.has(lang) &&
            !fieldGapLangs.has(lang),
        );
        const pendingLangs = TARGET_LANGS.filter((lang) => pendingLangsSet.has(lang));
        const failedLangs = TARGET_LANGS.filter((lang) => failedLangsSet.has(lang));
        const staleLangs = TARGET_LANGS.filter((lang) => staleLangsSet.has(lang));
        const emptyFieldLangs = TARGET_LANGS.filter((lang) => fieldGapLangs.has(lang));

        if (
          missingLangs.length > 0 ||
          pendingLangs.length > 0 ||
          failedLangs.length > 0 ||
          staleLangs.length > 0 ||
          emptyFieldLangs.length > 0
        ) {
          missing.push({
            id: listing.id,
            name: listing.name,
            slug: listing.slug,
            city: listing.cities?.name || "—",
            status: listing.status,
            missingLangs,
            pendingLangs,
            failedLangs,
            staleLangs,
            emptyFieldLangs,
            fieldGaps: Object.fromEntries(fieldGapLangs.entries()),
          });
        }

        if (missing.length >= limit) break;
      }

      if (data.length < LISTINGS_PAGE_SIZE) break;
      offset += LISTINGS_PAGE_SIZE;
    }

    return missing.slice(0, limit);
  }, [buildListingCoverageMaps]);

  useEffect(() => {
    let active = true;

    const hydrateLocaleStates = async () => {
      if (enKeys.length === 0) return;

      const [{ data, error }, { data: statusRows, error: statusError }] = await Promise.all([
        i18nClient
          .from("i18n_locale_data" as never)
          .select("locale,data,updated_at")
          .in("locale", LOCALES.map((locale) => locale.code)),
        i18nClient
          .from("i18n_locale_key_status" as never)
          .select("locale,key_path,source_hash,status,reviewed_at,updated_at")
          .in("locale", LOCALES.map((locale) => locale.code)),
      ]);

      if (error || !active) return;

      type LocalePatchRow = {
        locale: string;
        data: Record<string, unknown>;
        updated_at: string;
      };

      const patchRows = ((data ?? []) as unknown) as LocalePatchRow[];
      const patchByLocale = new Map(patchRows.map((row) => [row.locale, row]));
      const metadataRows = statusError ? [] : (((statusRows ?? []) as unknown) as LocaleKeyStatusRow[]);
      const metadataByLocale: Record<string, Record<string, TranslationKeyMetadata>> = {};
      for (const row of metadataRows) {
        metadataByLocale[row.locale] = metadataByLocale[row.locale] ?? {};
        metadataByLocale[row.locale][row.key_path] = {
          sourceHash: row.source_hash,
          status: row.status,
          reviewedAt: row.reviewed_at ?? null,
          updatedAt: row.updated_at ?? null,
        };
      }
      setLocalePatchDataByCode(
        Object.fromEntries(
          patchRows.map((row) => [
            row.locale,
            {
              data: row.data,
              updatedAt: row.updated_at,
            },
          ]),
        ),
      );
      setLocaleKeyMetadataByCode(metadataByLocale);

      setLocaleStates(
        LOCALES.map((locale) => {
          const patchRow = patchByLocale.get(locale.code);
          const coverage = calculateMergedLocaleCoverage(
            enFlat,
            localeDataByCode[locale.code] ?? {},
            patchRow?.data,
            metadataByLocale[locale.code],
          );

          return {
            code: locale.code,
            localeCode: locale.localeCode,
            name: locale.name,
            flag: locale.flag,
            totalKeys: enKeys.length,
            translatedCount: coverage.translatedKeyCount,
            missingCount: coverage.missingKeyCount,
            staleCount: coverage.staleKeyCount,
            obsoleteCount: coverage.obsoleteKeyCount,
            emptyValueCount: coverage.emptyValueKeyCount,
            invalidCount: coverage.invalidKeyCount,
            pendingManualCount: coverage.pendingManualKeyCount,
            coverageLabel: coverage.coverageLabel,
            status: coverageStatus(coverage),
            lastSynced: patchRow?.updated_at,
            lastRefreshed: lastCoverageRefresh ?? undefined,
          };
        }),
      );
    };

    void hydrateLocaleStates();
    return () => {
      active = false;
    };
  }, [enFlat, enKeys, i18nClient, lastCoverageRefresh, localeDataByCode]);

  useEffect(() => {
    let active = true;

    const fetchProcessorCapabilities = async () => {
      try {
        const json = await fetchAdmin("/api/admin/translations/capabilities");
        const data = json.data as { configured?: boolean; message?: string };
        if (!active) return;
        setProcessorConfigured(Boolean(data.configured));
        setProcessorMessage(data.message ?? "Translation processor capability is unknown.");
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : String(err);
        setProcessorConfigured(false);
        setProcessorMessage(`Translation processor capability unavailable: ${message}`);
      }
    };

    void fetchProcessorCapabilities();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchSchemaHealth = async () => {
      try {
        const json = await fetchAdmin("/api/admin/translations/schema");
        const data = json.data as TranslationSchemaHealth;
        if (!active) return;
        setSchemaHealth(data);
        setSchemaHealthError(null);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : String(err);
        setSchemaHealth(null);
        setSchemaHealthError(message);
      }
    };

    void fetchSchemaHealth();
    return () => {
      active = false;
    };
  }, []);

  const updateLocale = useCallback((code: string, patch: Partial<LocaleState>) => {
    setLocaleStates((prev) =>
      prev.map((l) => (l.code === code ? { ...l, ...patch } : l))
    );
  }, []);

  const persistLocaleData = useCallback(
    async (
      localeCode: string,
      data: Record<string, unknown>,
      keyCount: number,
      keyStatuses?: Array<{
        keyPath: string;
        sourceHash: string;
        status: UiTranslationStoredStatus;
        reviewedAt?: string | null;
      }>,
    ) => {
      try {
        await fetchAdmin("/api/admin/i18n/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: localeCode,
            data,
            keyCount,
            keyStatuses,
          }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to persist locale ${localeCode}`;
        throw new Error(message);
      }
    },
    [],
  );

  // ── Sync a single locale ────────────────────────────────────────────────────
  const syncLocale = useCallback(
    async (localeCode: string) => {
      const localeConfig = LOCALES.find((l) => l.code === localeCode);
      if (!localeConfig) return false;
      const bundledLocaleData = localeDataByCode[localeCode];
      if (!bundledLocaleData || !englishData) {
        toast.error("Bundled locale data is still loading.");
        return false;
      }

      updateLocale(localeCode, { status: "syncing", lastError: undefined });
      setCurrentLocale(localeCode);

      try {
        const { data: existingLocalePatch, error: existingLocalePatchError } = await i18nClient
          .from("i18n_locale_data" as never)
          .select("data")
          .eq("locale", localeCode)
          .maybeSingle();

        if (existingLocalePatchError) {
          throw new Error(existingLocalePatchError.message);
        }

        const existingFlat = {
          ...flattenI18nData(bundledLocaleData),
          ...(existingLocalePatch?.data && typeof existingLocalePatch.data === "object"
            ? flattenI18nData(existingLocalePatch.data as Record<string, unknown>)
            : {}),
        };
        const existingMetadata = localeKeyMetadataByCode[localeCode] ?? {};
        const beforeCoverage = calculateLocaleCoverage(enFlat, existingFlat, existingMetadata);
        const missingKeys = beforeCoverage.missingKeys;
        const staleKeys = beforeCoverage.staleKeys;
        const obsoleteKeys = beforeCoverage.obsoleteKeys;
        let failedKeyCount = 0;
        let failureReason: string | null = null;

        if (beforeCoverage.isFullySynced) {
          updateLocale(localeCode, {
            status: "synced",
            missingCount: 0,
            staleCount: 0,
            obsoleteCount: beforeCoverage.obsoleteKeyCount,
            emptyValueCount: beforeCoverage.emptyValueKeyCount,
            invalidCount: beforeCoverage.invalidKeyCount,
            pendingManualCount: beforeCoverage.pendingManualKeyCount,
            translatedCount: beforeCoverage.translatedKeyCount,
            coverageLabel: beforeCoverage.coverageLabel,
            lastSynced: new Date().toISOString(),
            lastError: undefined,
          });
          return true;
        }

        // Build missing key-value map from en.json
        const keysToTranslate: Record<string, string> = {};
        for (const key of missingKeys) {
          keysToTranslate[key] = enFlat[key];
        }

        const translated: Record<string, string> = {};
        const statusUpdates: Array<{
          keyPath: string;
          sourceHash: string;
          status: UiTranslationStoredStatus;
          reviewedAt?: string | null;
        }> = [];
        const nowIso = new Date().toISOString();

        if (!processorConfigured) {
          for (const key of missingKeys) {
            translated[key] = enFlat[key];
            statusUpdates.push({
              keyPath: key,
              sourceHash: hashTranslationSource(enFlat[key] ?? ""),
              status: "pending_manual",
            });
          }
          for (const key of staleKeys) {
            statusUpdates.push({
              keyPath: key,
              sourceHash: hashTranslationSource(enFlat[key] ?? ""),
              status: "stale",
            });
          }
          for (const key of obsoleteKeys) {
            statusUpdates.push({
              keyPath: key,
              sourceHash: hashTranslationSource(existingFlat[key] ?? ""),
              status: "obsolete",
            });
          }
          if (missingKeys.length > 0) {
            failureReason = "translation processor is not configured; missing keys were synced as pending manual fallback";
          }
        } else {
          // Call existing translate-i18n edge function (batches of 80 keys)
          const BATCH_SIZE = 80;
          const batchKeys = Object.keys(keysToTranslate);

          for (let i = 0; i < batchKeys.length; i += BATCH_SIZE) {
            const batch = batchKeys.slice(i, i + BATCH_SIZE);
            const batchObj: Record<string, string> = {};
            const batchForTranslation: Record<string, string> = {};
            for (const k of batch) {
              batchObj[k] = keysToTranslate[k];
              batchForTranslation[k] = protectPremiumInSourceText(keysToTranslate[k]);
            }

            const { data, error } = await invokeFunctionWithAuthRetry<{
              translated?: Record<string, string>;
              error?: string;
            }>("translate-i18n", {
              body: { lang: localeCode, langName: localeConfig.name, keys: batchForTranslation },
            });

            if (error) {
              const message = await getSupabaseFunctionErrorMessage(error, "Translation request failed");
              const isAuthError = await isSupabaseFunctionAuthError(error);

              failedKeyCount += batch.length;
              if (!failureReason) {
                failureReason = isAuthError
                  ? "translation endpoint auth unavailable"
                  : message;
              }
              continue;
            }

            if (data?.error) {
              failedKeyCount += batch.length;
              failureReason = failureReason ?? data.error;
              continue;
            }

            const translatedBatch = data?.translated ?? {};
            for (const key of batch) {
              const translatedValue = translatedBatch[key];
              if (typeof translatedValue !== "string" || translatedValue.trim().length === 0) {
                failedKeyCount += 1;
                continue;
              }
              translated[key] = enforcePremiumInTranslation(
                batchObj[key],
                translatedValue,
              );
              statusUpdates.push({
                keyPath: key,
                sourceHash: hashTranslationSource(batchObj[key] ?? ""),
                status: "translated",
              });
            }
          }

          for (const key of staleKeys) {
            statusUpdates.push({
              keyPath: key,
              sourceHash: hashTranslationSource(enFlat[key] ?? ""),
              status: "stale",
            });
          }
          for (const key of obsoleteKeys) {
            statusUpdates.push({
              keyPath: key,
              sourceHash: hashTranslationSource(existingFlat[key] ?? ""),
              status: "obsolete",
            });
          }
        }

        const mergedFlat = { ...existingFlat, ...translated };
        const mergedNested = enforcePremiumInLocaleData(
          unflattenI18nData(mergedFlat),
          englishData,
        );
        const mergedNestedFlat = flattenI18nData(mergedNested);
        const nextMetadata = {
          ...existingMetadata,
          ...Object.fromEntries(
            statusUpdates.map((row) => [
              row.keyPath,
              {
                sourceHash: row.sourceHash,
                status: row.status,
                reviewedAt: row.reviewedAt ?? null,
                updatedAt: nowIso,
              } satisfies TranslationKeyMetadata,
            ]),
          ),
        };
        const afterCoverage = calculateLocaleCoverage(enFlat, mergedNestedFlat, nextMetadata);

        if (Object.keys(translated).length > 0 || statusUpdates.length > 0) {
          await persistLocaleData(
            localeCode,
            mergedNested,
            Object.keys(mergedNestedFlat).length,
            statusUpdates,
          );
          setLocalePatchDataByCode((prev) => ({
            ...prev,
            [localeCode]: {
              data: mergedNested,
              updatedAt: nowIso,
            },
          }));
          setLocaleKeyMetadataByCode((prev) => ({
            ...prev,
            [localeCode]: nextMetadata,
          }));
        }

        const translatedCount = Object.keys(translated).length;
        const nextStatus: LocaleStatus = coverageStatus(afterCoverage);
        const nextError =
          afterCoverage.missingKeyCount + afterCoverage.pendingManualKeyCount + afterCoverage.staleKeyCount > 0
            ? `${afterCoverage.missingKeyCount.toLocaleString()} missing, ${afterCoverage.pendingManualKeyCount.toLocaleString()} pending manual, ${afterCoverage.staleKeyCount.toLocaleString()} stale${failureReason ? ` (${failureReason})` : ""}.`
            : undefined;

        updateLocale(localeCode, {
          status: nextStatus,
          missingCount: afterCoverage.missingKeyCount,
          staleCount: afterCoverage.staleKeyCount,
          obsoleteCount: afterCoverage.obsoleteKeyCount,
          emptyValueCount: afterCoverage.emptyValueKeyCount,
          invalidCount: afterCoverage.invalidKeyCount,
          pendingManualCount: afterCoverage.pendingManualKeyCount,
          translatedCount: afterCoverage.translatedKeyCount,
          coverageLabel: afterCoverage.coverageLabel,
          ...(translatedCount > 0 || statusUpdates.length > 0 ? { lastSynced: nowIso } : {}),
          lastError: nextError,
        });

        if (!processorConfigured && missingKeys.length > 0) {
          toast.warning(
            "Translation processor is not configured. Missing keys were synced as pending/manual translation.",
          );
        } else if (failedKeyCount > 0 || afterCoverage.missingKeyCount > 0) {
          toast.warning(
            `${localeConfig.flag} ${localeConfig.name} sync incomplete: ${translatedCount.toLocaleString()} translated, ${afterCoverage.missingKeyCount.toLocaleString()} still missing${failureReason ? ` (${failureReason})` : ""}.`,
          );
        } else {
          toast.success(`${localeConfig.flag} ${localeConfig.name} synced — ${translatedCount.toLocaleString()} key${translatedCount !== 1 ? "s" : ""} updated`);
        }
        return afterCoverage.isFullySynced;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        updateLocale(localeCode, { status: "error", lastError: msg });
        toast.error(`Failed to sync ${localeCode}: ${msg}`);
        return false;
      } finally {
        setCurrentLocale(null);
      }
    },
    [
      enFlat,
      englishData,
      i18nClient,
      localeDataByCode,
      localeKeyMetadataByCode,
      persistLocaleData,
      processorConfigured,
      updateLocale,
    ]
  );

  // ── Sync all locales sequentially ──────────────────────────────────────────
  const syncAll = useCallback(async () => {
    const toSync = localeStates.filter(
      (l) =>
        l.missingCount +
          l.staleCount +
          l.emptyValueCount +
          l.invalidCount +
          l.pendingManualCount +
          l.obsoleteCount >
        0,
    );
    if (toSync.length === 0) {
      toast.info("All locales are already fully synced!");
      return;
    }
    const totalAffectedKeys = toSync.reduce(
      (sum, locale) =>
        sum +
        locale.missingCount +
        locale.staleCount +
        locale.emptyValueCount +
        locale.invalidCount +
        locale.pendingManualCount +
        locale.obsoleteCount,
      0,
    );
    const confirmed = window.confirm(
      `Sync UI keys for ${toSync.length} locale${toSync.length !== 1 ? "s" : ""}? This will inspect ${totalAffectedKeys.toLocaleString()} open key issue${totalAffectedKeys !== 1 ? "s" : ""} and preserve existing translations.`,
    );
    if (!confirmed) return;

    setIsSyncingAll(true);
    setSyncProgress(0);
    let successful = 0;

    for (let i = 0; i < toSync.length; i++) {
      const ok = await syncLocale(toSync[i].code);
      if (ok || !processorConfigured) successful += 1;
      setSyncProgress(Math.round(((i + 1) / toSync.length) * 100));
    }

    setIsSyncingAll(false);
    setSyncProgress(100);
    const failed = toSync.length - successful;
    if (failed === 0) {
      toast.success(processorConfigured ? "All locales synced successfully!" : "All locales synced for manual translation review.");
    } else {
      toast.warning(`${successful} locale${successful !== 1 ? "s" : ""} processed, ${failed} failed.`);
    }
  }, [localeStates, processorConfigured, syncLocale]);

  const fetchMissingTranslations = useCallback(async () => {
    setMissingLoading(true);
    try {
      const computedMissing = await collectMissingPublishedListings(MAX_INCOMPLETE_LISTINGS);
      setMissingTranslations(computedMissing);
      return computedMissing;
    } catch (e: any) {
      toast.error("Failed to load missing translations: " + e.message);
      return [];
    } finally {
      setMissingLoading(false);
    }
  }, [collectMissingPublishedListings]);

  const fetchTranslationJobConsole = useCallback(async () => {
    setJobConsoleLoading(true);
    setJobConsoleError(null);

    try {
      const json = await fetchAdmin(
        `/api/admin/translations/jobs?filter=${encodeURIComponent(jobStatusFilter)}`,
      );
      const data = json.data as {
        counts: StatusCounts;
        attention: AttentionCounts;
        groups: ListingJobGroup[];
        total: number;
      };

      setJobCounts(data.counts);
      setAttentionCounts(data.attention);
      setJobGroups(data.groups);
      setJobTotal(data.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setJobConsoleError(msg);
    } finally {
      setJobConsoleLoading(false);
    }
  }, [jobStatusFilter]);

  const refreshCoverage = useCallback(async () => {
    setCoverageRefreshing(true);
    try {
      const nowIso = new Date().toISOString();
      const [english, localeEntries] = await Promise.all([
        loadLocale("en"),
        Promise.all(
          LOCALES.map(async (locale) => [
            locale.code,
            await loadLocale(locale.localeCode),
          ] as const),
        ),
      ]);
      const nextLocaleDataByCode = Object.fromEntries(localeEntries);
      const nextEnFlat = flattenI18nData(english);

      const [{ data: patchRowsRaw, error: patchError }, { data: statusRowsRaw, error: statusError }] =
        await Promise.all([
          i18nClient
            .from("i18n_locale_data" as never)
            .select("locale,data,updated_at")
            .in("locale", LOCALES.map((locale) => locale.code)),
          i18nClient
            .from("i18n_locale_key_status" as never)
            .select("locale,key_path,source_hash,status,reviewed_at,updated_at")
            .in("locale", LOCALES.map((locale) => locale.code)),
        ]);

      if (patchError) throw new Error(patchError.message);

      type LocalePatchRow = {
        locale: string;
        data: Record<string, unknown>;
        updated_at: string;
      };
      const patchRows = ((patchRowsRaw ?? []) as unknown) as LocalePatchRow[];
      const patchByLocale = new Map(patchRows.map((row) => [row.locale, row]));
      const metadataRows = statusError ? [] : (((statusRowsRaw ?? []) as unknown) as LocaleKeyStatusRow[]);
      const metadataByLocale: Record<string, Record<string, TranslationKeyMetadata>> = {};
      for (const row of metadataRows) {
        metadataByLocale[row.locale] = metadataByLocale[row.locale] ?? {};
        metadataByLocale[row.locale][row.key_path] = {
          sourceHash: row.source_hash,
          status: row.status,
          reviewedAt: row.reviewed_at ?? null,
          updatedAt: row.updated_at ?? null,
        };
      }

      const localeTargets = Object.fromEntries(
        LOCALES.map((locale) => [
          locale.code,
          mergeLocaleFlat(nextLocaleDataByCode[locale.code] ?? {}, patchByLocale.get(locale.code)?.data),
        ]),
      );
      const allCoverage = calculateAllLocaleCoverage(nextEnFlat, localeTargets, metadataByLocale);
      const computedMissingListings = await collectMissingPublishedListings(MAX_INCOMPLETE_LISTINGS);

      setEnglishData(english);
      setLocaleDataByCode(nextLocaleDataByCode);
      setLocalePatchDataByCode(
        Object.fromEntries(
          patchRows.map((row) => [
            row.locale,
            {
              data: row.data,
              updatedAt: row.updated_at,
            },
          ]),
        ),
      );
      setLocaleKeyMetadataByCode(metadataByLocale);
      setLastCoverageRefresh(nowIso);
      setMissingTranslations(computedMissingListings);
      setLocaleStates(
        LOCALES.map((locale) => {
          const coverage = allCoverage.locales[locale.code];
          const patchRow = patchByLocale.get(locale.code);
          return {
            code: locale.code,
            localeCode: locale.localeCode,
            name: locale.name,
            flag: locale.flag,
            totalKeys: coverage.sourceKeyCount,
            translatedCount: coverage.translatedKeyCount,
            missingCount: coverage.missingKeyCount,
            staleCount: coverage.staleKeyCount,
            obsoleteCount: coverage.obsoleteKeyCount,
            emptyValueCount: coverage.emptyValueKeyCount,
            invalidCount: coverage.invalidKeyCount,
            pendingManualCount: coverage.pendingManualKeyCount,
            coverageLabel: coverage.coverageLabel,
            status: coverageStatus(coverage),
            lastSynced: patchRow?.updated_at,
            lastRefreshed: nowIso,
          };
        }),
      );
      await fetchTranslationJobConsole();
      toast.success(
        `Coverage refreshed: ${allCoverage.sourceKeyCount.toLocaleString()} source keys, ${allCoverage.fullySyncedLocaleCount}/${LOCALES.length} locales fully synced, ${allCoverage.totalMissingAcrossLocales.toLocaleString()} missing keys, ${allCoverage.totalStaleAcrossLocales.toLocaleString()} stale keys, ${allCoverage.totalObsoleteAcrossLocales.toLocaleString()} obsolete keys, ${computedMissingListings.length.toLocaleString()} incomplete listings.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to refresh coverage: ${msg}`);
    } finally {
      setCoverageRefreshing(false);
    }
  }, [collectMissingPublishedListings, fetchTranslationJobConsole, i18nClient]);

  const runTranslationJobAction = useCallback(
    async (
      loadingId: string,
      body: Record<string, unknown>,
      successMessage: string,
    ) => {
      setJobActionLoadingId(loadingId);
      try {
        await fetchAdmin("/api/admin/translations/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success(successMessage);
        await Promise.all([
          fetchTranslationJobConsole(),
          fetchMissingTranslations(),
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Translation job action failed: ${msg}`);
      } finally {
        setJobActionLoadingId(null);
      }
    },
    [fetchMissingTranslations, fetchTranslationJobConsole],
  );

  const handleQueueTranslationJobs = useCallback(
    async (jobIds: string[], label: string) => {
      if (jobIds.length === 0) return;
      if (!processorConfigured) {
        toast.warning("Translation processor is not configured. Jobs were not queued for machine translation.");
        return;
      }
      await runTranslationJobAction(
        `queue:${jobIds.join(",")}`,
        { action: "queue", jobIds },
        `${label} queued.`,
      );
    },
    [processorConfigured, runTranslationJobAction],
  );

  const handleReviewTranslationJobs = useCallback(
    async (jobIds: string[], label: string) => {
      if (jobIds.length === 0) return;
      const confirmed = window.confirm(`Mark ${label} as reviewed?`);
      if (!confirmed) return;
      await runTranslationJobAction(
        `review:${jobIds.join(",")}`,
        { action: "review", jobIds },
        `${label} marked reviewed.`,
      );
    },
    [runTranslationJobAction],
  );

  const handleRequeueOutdatedListing = useCallback(
    async (listingId: string, listingName: string) => {
      if (!listingId) return;
      if (!processorConfigured) {
        toast.warning("Translation processor is not configured. Outdated jobs were not re-queued.");
        return;
      }
      await runTranslationJobAction(
        `requeue_outdated:${listingId}`,
        { action: "requeue_outdated", listingId },
        `${listingName} outdated jobs re-queued.`,
      );
    },
    [processorConfigured, runTranslationJobAction],
  );

  const openTranslationReview = useCallback(async (jobId: string) => {
    setReviewJobId(jobId);
    setReviewData(null);
    setReviewError(null);
    setReviewLoading(true);

    try {
      const json = await fetchAdmin(`/api/admin/translations/jobs?jobId=${encodeURIComponent(jobId)}`);
      const data = json.data as TranslationReviewData;
      setReviewData(data);
      setReviewDraft({
        title: data.translation?.title ?? data.listing?.name ?? "",
        short_description: data.translation?.short_description ?? data.listing?.short_description ?? "",
        description: data.translation?.description ?? data.listing?.description ?? "",
        seo_title: data.translation?.seo_title ?? data.listing?.meta_title ?? data.listing?.name ?? "",
        seo_description: data.translation?.seo_description ?? data.listing?.meta_description ?? "",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setReviewError(msg);
      toast.error(`Failed to load translation review: ${msg}`);
    } finally {
      setReviewLoading(false);
    }
  }, []);

  const closeTranslationReview = useCallback(() => {
    if (reviewSaving) return;
    setReviewJobId(null);
    setReviewData(null);
    setReviewError(null);
  }, [reviewSaving]);

  const saveTranslationReview = useCallback(async () => {
    if (!reviewData?.job.listing_id || !reviewData.job.target_lang) return;
    if (!reviewDraft.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setReviewSaving(true);
    try {
      await fetchAdmin("/api/admin/translations/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_edit",
          listingId: reviewData.job.listing_id,
          targetLang: reviewData.job.target_lang,
          translation: reviewDraft,
        }),
      });
      toast.success("Translation edit saved.");
      await Promise.all([
        fetchTranslationJobConsole(),
        fetchMissingTranslations(),
      ]);
      closeTranslationReview();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save translation: ${msg}`);
    } finally {
      setReviewSaving(false);
    }
  }, [
    closeTranslationReview,
    fetchMissingTranslations,
    fetchTranslationJobConsole,
    reviewData,
    reviewDraft,
  ]);

  const translateSingle = useCallback(
    async (listingId: string) => {
      if (!processorConfigured) {
        toast.warning("Translation processor is not configured. Use manual review/editing instead of queueing machine translation.");
        return;
      }
      setTranslatingId(listingId);
      try {
        const { data, error } = await invokeFunctionWithAuthRetry<{ ok?: boolean; error?: string }>(
          "translate-listing",
          { body: { listing_id: listingId } },
        );

        if (error) {
          const isAuthError = await isSupabaseFunctionAuthError(error);
          const isTransportError = await isSupabaseFunctionTransportError(error);

          if (isAuthError || isTransportError) {
            const queueResult = await queueListingTranslationJobs(listingId, TARGET_LANGS);
            if (queueResult.queued > 0) {
              toast.warning(
                `Direct translation endpoint unavailable. Queued ${queueResult.queued} language job${queueResult.queued !== 1 ? "s" : ""} for background processing.`,
              );
            } else if (queueResult.alreadyQueued > 0) {
              toast.info("Translation is already queued and processing in the background.");
            } else if (queueResult.alreadyTranslated >= TARGET_LANGS.length) {
              toast.success("This listing is already translated for all target languages.");
            } else {
              toast.info("No additional translation work is required for this listing.");
            }
            await fetchMissingTranslations();
            await fetchTranslationJobConsole();
            return;
          }
          throw new Error(await getSupabaseFunctionErrorMessage(error, "Translation request failed"));
        }

        if (data?.ok === false) throw new Error(data.error || "Translation request failed");
        toast.success("Translation queued successfully.");
        await fetchMissingTranslations();
        await fetchTranslationJobConsole();
      } catch (e: any) {
        toast.error("Translation failed: " + e.message);
      } finally {
        setTranslatingId(null);
      }
    },
    [fetchMissingTranslations, fetchTranslationJobConsole, processorConfigured],
  );

  const runTranslationsNow = useCallback(async () => {
    if (!processorConfigured) {
      setTranslateResult({
        processed: 0,
        succeeded: 0,
        queued: 0,
        failed: 0,
        skipped: translateBatch,
        message: "Translation processor is not configured. No machine translation jobs were queued.",
      });
      toast.warning("Translation processor is not configured. No machine translation jobs were queued.");
      return;
    }
    setTranslateLoading(true);
    setTranslateError(null);
    setTranslateResult(null);

    try {
      const listings = await collectMissingPublishedListings(translateBatch);

      if (!listings.length) {
        setTranslateResult({ message: "No listings require translation", processed: 0 });
        toast.success("All listings are already translated.");
        await fetchMissingTranslations();
        await fetchTranslationJobConsole();
        return;
      }

      const results: { id: string; name: string; status: string; error?: string }[] = [];
      for (const listing of listings) {
        try {
          const { data, error } = await invokeFunctionWithAuthRetry<{ ok?: boolean; error?: string }>(
            "translate-listing",
            { body: { listing_id: listing.id } },
          );
          if (error) {
            const isAuthError = await isSupabaseFunctionAuthError(error);
            const isTransportError = await isSupabaseFunctionTransportError(error);

            if (isAuthError || isTransportError) {
              const queueResult = await queueListingTranslationJobs(listing.id, TARGET_LANGS);
              if (queueResult.queued > 0) {
                results.push({
                  id: listing.id,
                  name: listing.name,
                  status: "queued",
                  error: `Queued ${queueResult.queued} language jobs.`,
                });
              } else {
                results.push({ id: listing.id, name: listing.name, status: "ok" });
              }
              continue;
            }

            results.push({
              id: listing.id,
              name: listing.name,
              status: "failed",
              error: await getSupabaseFunctionErrorMessage(error, "Translation request failed"),
            });
            continue;
          }

          if (data?.ok === false) {
            results.push({
              id: listing.id,
              name: listing.name,
              status: "failed",
              error: data.error || "Translation request failed",
            });
            continue;
          }

          results.push({ id: listing.id, name: listing.name, status: "ok" });
        } catch (err: any) {
          results.push({ id: listing.id, name: listing.name, status: "failed", error: err?.message });
        }
      }

      const succeeded = results.filter((r) => r.status === "ok").length;
      const queued = results.filter((r) => r.status === "queued").length;
      const failed = results.filter((r) => r.status === "failed").length;
      setTranslateResult({ processed: results.length, succeeded, queued, failed, results });

      if (failed === 0 && queued === 0) {
        toast.success(`Translation batch complete: ${succeeded} listing(s) translated.`);
      } else if (failed === 0) {
        toast.warning(`Batch done: ${succeeded} translated, ${queued} queued for background processing.`);
      } else {
        toast.warning(`Batch done: ${succeeded} translated, ${queued} queued, ${failed} failed.`);
      }
      await fetchMissingTranslations();
      await fetchTranslationJobConsole();
    } catch (e: any) {
      const msg = e?.message || String(e);
      setTranslateError(msg);
      toast.error(`Translation failed: ${msg}`);
    } finally {
      setTranslateLoading(false);
    }
  }, [
    collectMissingPublishedListings,
    fetchMissingTranslations,
    fetchTranslationJobConsole,
    processorConfigured,
    translateBatch,
  ]);

  const handleRunTranslationsNow = useCallback(async () => {
    const confirmed = window.confirm(
      `Queue translations for up to ${translateBatch} published listing${translateBatch !== 1 ? "s" : ""}?`,
    );
    if (!confirmed) return;
    await runTranslationsNow();
  }, [runTranslationsNow, translateBatch]);

  useEffect(() => {
    void fetchMissingTranslations();
  }, [fetchMissingTranslations]);

  useEffect(() => {
    void fetchTranslationJobConsole();
  }, [fetchTranslationJobConsole]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalMissing = localeStates.reduce((s, l) => s + l.missingCount, 0);
  const totalStale = localeStates.reduce((s, l) => s + l.staleCount, 0);
  const totalObsolete = localeStates.reduce((s, l) => s + l.obsoleteCount, 0);
  const totalEmptyValues = localeStates.reduce((s, l) => s + l.emptyValueCount, 0);
  const totalPendingManual = localeStates.reduce((s, l) => s + l.pendingManualCount, 0);
  const totalOpenUiIssues =
    totalMissing + totalStale + totalObsolete + totalEmptyValues + totalPendingManual;
  const syncedCount = localeStates.filter(
    (l) =>
      l.missingCount +
        l.staleCount +
        l.obsoleteCount +
        l.emptyValueCount +
        l.invalidCount +
        l.pendingManualCount ===
      0,
  ).length;
  const erroredLocaleCount = localeStates.filter((l) => l.status === "error").length;
  const syncingLocale = currentLocale
    ? LOCALES.find((locale) => locale.code === currentLocale)
    : null;
  const isLocaleBundleLoading = !englishData || enKeys.length === 0;
  const totalLocaleKeySlots = enKeys.length * LOCALES.length;
  const localeCompletionLabel = totalLocaleKeySlots > 0
    ? calculateAllLocaleCoverage(
        enFlat,
        Object.fromEntries(
          LOCALES.map((locale) => [
            locale.code,
            mergeLocaleFlat(
              localeDataByCode[locale.code] ?? {},
              localePatchDataByCode[locale.code]?.data,
            ),
          ]),
        ),
        localeKeyMetadataByCode,
      ).overallCoverageLabel
    : "0%";
  const uniqueMissingSourceKeyCount = useMemo(() => {
    const keys = new Set<string>();
    for (const locale of LOCALES) {
      const coverage = calculateMergedLocaleCoverage(
        enFlat,
        localeDataByCode[locale.code] ?? {},
        localePatchDataByCode[locale.code]?.data,
        localeKeyMetadataByCode[locale.code],
      );
      for (const key of coverage.missingKeys) keys.add(key);
    }
    return keys.size;
  }, [enFlat, localeDataByCode, localeKeyMetadataByCode, localePatchDataByCode]);
  const selectedLocaleState =
    localeStates.find((locale) => locale.code === selectedLocaleCode) ?? localeStates[0];
  const selectedLocaleConfig =
    LOCALES.find((locale) => locale.code === selectedLocaleCode) ?? LOCALES[0];
  const selectedLocalePatch = localePatchDataByCode[selectedLocaleCode];
  const selectedLocaleMetadata = useMemo(
    () => localeKeyMetadataByCode[selectedLocaleCode] ?? {},
    [localeKeyMetadataByCode, selectedLocaleCode],
  );
  const selectedLocaleBundledFlat = useMemo(
    () => flattenI18nData(localeDataByCode[selectedLocaleCode] ?? {}),
    [localeDataByCode, selectedLocaleCode],
  );
  const selectedLocalePatchFlat = useMemo(
    () => flattenI18nData(selectedLocalePatch?.data ?? {}),
    [selectedLocalePatch?.data],
  );
  const selectedLocaleMergedFlat = useMemo(
    () => ({ ...selectedLocaleBundledFlat, ...selectedLocalePatchFlat }),
    [selectedLocaleBundledFlat, selectedLocalePatchFlat],
  );
  const selectedLocaleCoverageResult = useMemo(
    () => calculateLocaleCoverage(enFlat, selectedLocaleMergedFlat, selectedLocaleMetadata),
    [enFlat, selectedLocaleMergedFlat, selectedLocaleMetadata],
  );
  const selectedLocaleMissingKeys = selectedLocaleCoverageResult.missingKeys;
  const visibleSelectedLocaleUiKeys = useMemo(() => {
    const query = uiKeySearchQuery.trim().toLowerCase();
    const candidateKeys =
      uiKeyStatusFilter === "all"
        ? Array.from(
            new Set([
              ...selectedLocaleCoverageResult.sourceKeys,
              ...selectedLocaleCoverageResult.obsoleteKeys,
            ]),
          )
        : Object.entries(selectedLocaleCoverageResult.statusByKey)
            .filter(([, status]) => status === uiKeyStatusFilter)
            .map(([key]) => key);
    return candidateKeys.filter((key) => {
      const status = selectedLocaleCoverageResult.statusByKey[key] ?? "complete";
      return (
        key.toLowerCase().includes(query) ||
        (enFlat[key] ?? "").toLowerCase().includes(query) ||
        (selectedLocaleMergedFlat[key] ?? "").toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    });
  }, [
    enFlat,
    selectedLocaleCoverageResult,
    selectedLocaleMergedFlat,
    uiKeySearchQuery,
    uiKeyStatusFilter,
  ]);
  const selectedUiKeyIsMissing = selectedUiKey ? !(selectedUiKey in selectedLocaleMergedFlat) : false;
  const selectedUiKeySource = selectedUiKey ? enFlat[selectedUiKey] ?? "" : "";
  const selectedUiKeyCurrentValue = selectedUiKey ? selectedLocaleMergedFlat[selectedUiKey] ?? "" : "";

  useEffect(() => {
    if (visibleSelectedLocaleUiKeys.length === 0) {
      setSelectedUiKey(null);
      return;
    }

    if (!selectedUiKey || !visibleSelectedLocaleUiKeys.includes(selectedUiKey)) {
      setSelectedUiKey(visibleSelectedLocaleUiKeys[0]);
    }
  }, [selectedUiKey, visibleSelectedLocaleUiKeys]);

  useEffect(() => {
    setUiKeyDraft(selectedUiKeyCurrentValue);
  }, [selectedLocaleCode, selectedUiKey, selectedUiKeyCurrentValue]);

  const saveSelectedUiKey = useCallback(async () => {
    if (!englishData || !selectedUiKey || !selectedLocaleState) return;

    const nextValue = uiKeyDraft.trim();
    if (nextValue.length === 0) {
      toast.error("Translation text is required.");
      return;
    }

    setIsSavingUiKey(true);
    try {
      const mergedFlat = {
        ...selectedLocaleBundledFlat,
        ...selectedLocalePatchFlat,
        [selectedUiKey]: enforcePremiumInTranslation(selectedUiKeySource, nextValue),
      };
      const mergedNested = enforcePremiumInLocaleData(
        unflattenI18nData(mergedFlat),
        englishData,
      );
      const mergedNestedFlat = flattenI18nData(mergedNested);
      const nowIso = new Date().toISOString();
      const keyStatus = {
        keyPath: selectedUiKey,
        sourceHash: hashTranslationSource(selectedUiKeySource),
        status: "reviewed" as const,
        reviewedAt: nowIso,
      };

      await persistLocaleData(
        selectedLocaleState.code,
        mergedNested,
        Object.keys(mergedNestedFlat).length,
        [keyStatus],
      );

      setLocalePatchDataByCode((prev) => ({
        ...prev,
        [selectedLocaleState.code]: {
          data: mergedNested,
          updatedAt: nowIso,
        },
      }));
      const nextMetadata = {
        ...(localeKeyMetadataByCode[selectedLocaleState.code] ?? {}),
        [selectedUiKey]: {
          sourceHash: keyStatus.sourceHash,
          status: keyStatus.status,
          reviewedAt: nowIso,
          updatedAt: nowIso,
        } satisfies TranslationKeyMetadata,
      };
      setLocaleKeyMetadataByCode((prev) => ({
        ...prev,
        [selectedLocaleState.code]: nextMetadata,
      }));

      const nextCoverage = calculateLocaleCoverage(enFlat, mergedNestedFlat, nextMetadata);
      updateLocale(selectedLocaleState.code, {
        status: coverageStatus(nextCoverage),
        missingCount: nextCoverage.missingKeyCount,
        staleCount: nextCoverage.staleKeyCount,
        obsoleteCount: nextCoverage.obsoleteKeyCount,
        emptyValueCount: nextCoverage.emptyValueKeyCount,
        invalidCount: nextCoverage.invalidKeyCount,
        pendingManualCount: nextCoverage.pendingManualKeyCount,
        translatedCount: nextCoverage.translatedKeyCount,
        coverageLabel: nextCoverage.coverageLabel,
        lastSynced: nowIso,
        lastError: undefined,
      });

      toast.success(`${selectedLocaleState.name} UI key saved.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save UI key: ${msg}`);
    } finally {
      setIsSavingUiKey(false);
    }
  }, [
    enFlat,
    englishData,
    localeKeyMetadataByCode,
    persistLocaleData,
    selectedLocaleBundledFlat,
    selectedLocalePatchFlat,
    selectedLocaleState,
    selectedUiKey,
    selectedUiKeySource,
    uiKeyDraft,
    updateLocale,
  ]);

  const selectedLocaleCoverage = selectedLocaleState && selectedLocaleState.totalKeys > 0
    ? selectedLocaleCoverageResult.coveragePercent
    : 0;
  const visibleMissingTranslations = useMemo(() => {
    const query = listingSearchQuery.trim().toLowerCase();
    if (!query) return missingTranslations;
    return missingTranslations.filter((listing) =>
      listing.name.toLowerCase().includes(query) ||
      listing.city.toLowerCase().includes(query) ||
      listing.missingLangs.some((lang) => lang.toLowerCase().includes(query)) ||
      listing.pendingLangs.some((lang) => lang.toLowerCase().includes(query)) ||
      listing.failedLangs.some((lang) => lang.toLowerCase().includes(query)) ||
      listing.staleLangs.some((lang) => lang.toLowerCase().includes(query)) ||
      listing.emptyFieldLangs.some((lang) => lang.toLowerCase().includes(query)),
    );
  }, [listingSearchQuery, missingTranslations]);
  const lastRunRows = Array.isArray(translateResult?.results)
    ? translateResult.results.slice(0, 6)
    : [];
  const totalJobCount = Object.values(jobCounts).reduce((sum, count) => sum + count, 0);
  const doneJobCount = DONE_STATUSES.reduce((sum, status) => sum + (jobCounts[status] ?? 0), 0);
  const jobCompletionPct = totalJobCount > 0
    ? Math.round((doneJobCount / totalJobCount) * 100)
    : 0;
  const attentionJobCount = ATTENTION_STATUSES.reduce((sum, status) => sum + (jobCounts[status] ?? 0), 0);
  const visibleJobGroups = useMemo(() => {
    const query = jobSearchQuery.trim().toLowerCase();
    if (!query) return jobGroups;
    return jobGroups.filter((group) =>
      group.listing.name.toLowerCase().includes(query) ||
      group.listing.city.toLowerCase().includes(query) ||
      group.listing.category.toLowerCase().includes(query) ||
      group.jobs.some((job) =>
        job.target_lang.toLowerCase().includes(query) ||
        job.status.toLowerCase().includes(query) ||
        (job.last_error ?? "").toLowerCase().includes(query),
      ),
    );
  }, [jobGroups, jobSearchQuery]);
  const visibleJobCount = countJobs(visibleJobGroups);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-[1600px] space-y-6 p-3 sm:p-6">
        <div className="rounded-lg border border-border bg-card/85 p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Languages className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-serif font-semibold text-foreground">
                    Translation Studio
                  </h1>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-700">
                    Admin
                  </Badge>
                  {erroredLocaleCount > 0 ? (
                    <Badge variant="destructive">
                      {erroredLocaleCount} locale{erroredLocaleCount !== 1 ? "s" : ""} blocked
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  UI locale coverage and listing content translation operations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={refreshCoverage}
                disabled={coverageRefreshing || missingLoading}
                className="gap-2"
              >
                {coverageRefreshing || missingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh Coverage
              </Button>
              <Button
                onClick={syncAll}
                disabled={isLocaleBundleLoading || isSyncingAll || totalOpenUiIssues === 0}
                className="gap-2"
              >
                {isSyncingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isSyncingAll
                  ? `Syncing ${syncProgress}%`
                  : totalOpenUiIssues === 0 && !isLocaleBundleLoading
                    ? "UI Keys Synced"
                    : `Sync UI Keys (${totalOpenUiIssues})`}
              </Button>
            </div>
          </div>

          {isSyncingAll ? (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{syncingLocale ? `Syncing ${syncingLocale.name}` : "Syncing locales"}</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Database className="h-4 w-4" />}
            label="English Source Keys"
            value={isLocaleBundleLoading ? "Loading" : enKeys.length.toLocaleString()}
            detail="Bundled UI strings"
          />
          <MetricCard
            icon={<Globe2 className="h-4 w-4" />}
            label="Locale Coverage"
            value={localeCompletionLabel}
            detail={`${syncedCount}/${LOCALES.length} locales fully synced`}
            tone={totalOpenUiIssues > 0 ? "amber" : "emerald"}
          />
          <MetricCard
            icon={<FileWarning className="h-4 w-4" />}
            label="Missing UI Keys"
            value={totalMissing.toLocaleString()}
            detail={`${uniqueMissingSourceKeyCount.toLocaleString()} unique source key${uniqueMissingSourceKeyCount !== 1 ? "s" : ""}`}
            tone={totalMissing > 0 ? "amber" : "emerald"}
          />
          <MetricCard
            icon={<ListChecks className="h-4 w-4" />}
            label="Incomplete Listings"
            value={missingLoading ? "Loading" : missingTranslations.length.toLocaleString()}
            detail="Published listings with locale gaps"
            tone={missingTranslations.length > 0 ? "amber" : "emerald"}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_24rem]">
          <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
            <Card className="border-border bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Workstreams
                </CardTitle>
                <CardDescription>Translation surfaces in this admin module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <WorkstreamItem
                  icon={<Globe2 className="h-4 w-4" />}
                  title="UI Locale Keys"
                  detail={`${totalOpenUiIssues.toLocaleString()} open issues`}
                  active
                />
                <WorkstreamItem
                  icon={<ListChecks className="h-4 w-4" />}
                  title="Listing Content"
                  detail={`${missingTranslations.length.toLocaleString()} incomplete`}
                />
                <WorkstreamItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Safety"
                  detail="Admin route, server sync"
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Locale Targets</CardTitle>
                <CardDescription>Supported non-English locales.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {LOCALES.map((locale) => (
                  <Badge key={locale.code} variant="outline" className="bg-background">
                    {locale.localeCode}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </aside>

          <main className="min-w-0 space-y-5">
            <Card className="border-border bg-card/80">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe2 className="h-5 w-5 text-primary" />
                      UI Locale Sync
                    </CardTitle>
                    <CardDescription>
                      {isLocaleBundleLoading
                        ? "Loading bundled locale keys."
                        : `${enKeys.length.toLocaleString()} English source keys across ${LOCALES.length} locales.`}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={totalOpenUiIssues > 0 ? "border-amber-500/40 bg-amber-50 text-amber-700" : "border-emerald-500/40 bg-emerald-50 text-emerald-700"}>
                    {totalOpenUiIssues > 0 ? `${totalOpenUiIssues.toLocaleString()} open issues` : "Synced"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3">
                  {localeStates.map((locale) => {
                    const coverage = locale.totalKeys > 0
                      ? (locale.translatedCount / locale.totalKeys) * 100
                      : 0;
                    const isSyncing = locale.status === "syncing";
                    const isSelected = selectedLocaleCode === locale.code;

                    return (
                      <div
                        key={locale.code}
                        className={[
                          "rounded-lg border bg-background p-4 transition",
                          isSelected ? "border-primary/50 ring-2 ring-primary/10" : "border-border",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{locale.flag}</span>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{locale.name}</p>
                                <p className="text-xs text-muted-foreground">{locale.localeCode}</p>
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={locale.status} />
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{locale.translatedCount} / {locale.totalKeys} complete</span>
                            <span>{locale.coverageLabel}</span>
                          </div>
                          <Progress value={coverage} className="h-1.5" />
                        </div>

                        <div className="mt-3 min-h-5">
                          {locale.lastError ? (
                            <p
                              className={[
                                "truncate text-xs",
                                locale.status === "error" ? "text-destructive" : "text-amber-700",
                              ].join(" ")}
                              title={locale.lastError}
                            >
                              {locale.lastError}
                            </p>
                          ) : locale.lastSynced ? (
                            <p className="text-xs text-muted-foreground">
                              Updated {new Date(locale.lastSynced).toLocaleString()}
                            </p>
                          ) : locale.missingCount > 0 ? (
                            <p className="text-xs text-amber-700">
                              {locale.missingCount.toLocaleString()} key{locale.missingCount !== 1 ? "s" : ""} missing
                            </p>
                          ) : locale.pendingManualCount > 0 || locale.staleCount > 0 ? (
                            <p className="text-xs text-amber-700">
                              {locale.pendingManualCount.toLocaleString()} pending · {locale.staleCount.toLocaleString()} stale
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Ready</p>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 min-[1500px]:grid-cols-2">
                          <Button
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => setSelectedLocaleCode(locale.code)}
                            className="min-w-0 whitespace-nowrap px-2"
                          >
                            Inspect
                          </Button>
                          <Button
                            size="sm"
                            variant={locale.missingCount === 0 ? "outline" : "default"}
                            className="min-w-0 gap-2 whitespace-nowrap px-2"
                            disabled={isLocaleBundleLoading || isSyncing || isSyncingAll}
                            onClick={() => syncLocale(locale.code)}
                          >
                            {isSyncing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : locale.missingCount === 0 ? (
                              <RefreshCw className="h-3.5 w-3.5" />
                            ) : (
                              <Zap className="h-3.5 w-3.5" />
                            )}
                            {isSyncing ? "Syncing" : locale.missingCount === 0 ? "Inspect Sync" : "Sync"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Translation Job Console
                    </CardTitle>
                    <CardDescription>
                      Queue health, review workload, and priority listing jobs.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTranslationJobConsole}
                    disabled={jobConsoleLoading}
                  >
                    {jobConsoleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">{jobConsoleLoading ? "Loading" : "Refresh"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.75rem),1fr))] gap-3">
                  <JobMetric label="Completion" value={`${jobCompletionPct}%`} detail={`${doneJobCount.toLocaleString()} done`} tone={jobCompletionPct < 80 ? "amber" : "emerald"} />
                  <JobMetric label="Attention" value={attentionJobCount.toLocaleString()} detail={`${attentionCounts.total.toLocaleString()} listings`} tone={attentionJobCount > 0 ? "amber" : "emerald"} />
                  <JobMetric label="Failed" value={(jobCounts.failed ?? 0).toLocaleString()} detail="Needs retry" tone={(jobCounts.failed ?? 0) > 0 ? "red" : "emerald"} />
                  <JobMetric label="Outdated" value={attentionCounts.outdatedCount.toLocaleString()} detail="Source changed" tone={attentionCounts.outdatedCount > 0 ? "amber" : "emerald"} />
                </div>

                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {JOB_FILTERS.map((filter) => {
                      const isActive = jobStatusFilter === filter;
                      const count =
                        filter === "attention"
                          ? attentionJobCount
                          : filter === "all"
                            ? totalJobCount
                            : jobCounts[filter] ?? 0;

                      return (
                        <Button
                          key={filter}
                          type="button"
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => setJobStatusFilter(filter)}
                          className="h-8 gap-2"
                        >
                          {formatJobFilterLabel(filter)}
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            {count.toLocaleString()}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="relative w-full xl:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={jobSearchQuery}
                      onChange={(event) => setJobSearchQuery(event.target.value)}
                      className="bg-background pl-9"
                      placeholder="Search jobs"
                    />
                  </div>
                </div>

                {jobConsoleError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {jobConsoleError}
                  </div>
                ) : jobConsoleLoading && jobGroups.length === 0 ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-background py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading translation jobs
                  </div>
                ) : visibleJobGroups.length === 0 ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-background py-10 text-sm text-muted-foreground">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                    No translation jobs match this view.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {visibleJobGroups.length.toLocaleString()} listing group{visibleJobGroups.length !== 1 ? "s" : ""} · {visibleJobCount.toLocaleString()} visible job{visibleJobCount !== 1 ? "s" : ""}
                      </span>
                      <span>{jobTotal.toLocaleString()} total jobs in filter</span>
                    </div>
                    {visibleJobGroups.map((group) => (
                      <TranslationJobGroupPreview
                        key={group.listing.id}
                        group={group}
                        loadingActionId={jobActionLoadingId}
                        processorConfigured={processorConfigured}
                        onQueueJobs={handleQueueTranslationJobs}
                        onReviewJobs={handleReviewTranslationJobs}
                        onRequeueOutdated={handleRequeueOutdatedListing}
                        onOpenReview={openTranslationReview}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Listing Translation Coverage
                    </CardTitle>
                    <CardDescription>
                      Published listings missing one or more target languages.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchMissingTranslations} disabled={missingLoading}>
                    {missingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">{missingLoading ? "Loading" : "Refresh"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {missingTranslations.length > 0 ? (
                  <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={listingSearchQuery}
                      onChange={(event) => setListingSearchQuery(event.target.value)}
                      className="bg-background pl-9"
                      placeholder="Search listing, city, or locale"
                    />
                  </div>
                ) : null}

                {missingLoading ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-background py-10 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading listing coverage
                  </div>
                ) : missingTranslations.length === 0 ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-background py-10 text-sm text-muted-foreground">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                    All published listings are covered for the configured content locales.
                  </div>
                ) : (
                  <div className="min-w-0 overflow-hidden rounded-lg border border-border">
                    <div className="flex flex-col gap-2 border-b border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <Badge variant="outline" className="border-amber-500/40 bg-amber-50 text-amber-700">
                        {visibleMissingTranslations.length} shown
                      </Badge>
                      <span className="text-xs text-muted-foreground sm:text-right">
                        {missingTranslations.length} total · showing up to {MAX_INCOMPLETE_LISTINGS}
                      </span>
                    </div>
                    {visibleMissingTranslations.length === 0 ? (
                      <div className="bg-background px-4 py-10 text-center text-sm text-muted-foreground">
                        No incomplete listings match the current search.
                      </div>
                    ) : (
                      <>
                      <div className="space-y-3 bg-background p-3 min-[1500px]:hidden">
                        {visibleMissingTranslations.map((listing) => (
                          <div key={listing.id} className="rounded-lg border border-border bg-card p-3 sm:p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 space-y-1">
                                <p className="break-words text-sm font-semibold leading-snug text-foreground">{listing.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{listing.city}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={translatingId === listing.id || !processorConfigured}
                                onClick={() => translateSingle(listing.id)}
                                className="w-full shrink-0 gap-1.5 px-2 sm:w-auto"
                              >
                                {translatingId === listing.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                Translate
                              </Button>
                            </div>
                            <div className="mt-3">
                              <ListingLocaleBadges listing={listing} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden min-[1500px]:block">
                        <table className="w-full table-fixed text-sm">
                          <thead className="bg-background">
                            <tr>
                              <th className="w-[34%] px-4 py-2 text-left font-medium text-muted-foreground">Listing</th>
                              <th className="w-[18%] px-4 py-2 text-left font-medium text-muted-foreground">City</th>
                              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Missing</th>
                              <th className="w-[8.5rem] px-4 py-2 text-right font-medium text-muted-foreground">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleMissingTranslations.map((listing, index) => (
                              <tr key={listing.id} className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                                <td className="truncate px-4 py-3 font-medium text-foreground">
                                  {listing.name}
                                </td>
                                <td className="truncate px-4 py-3 text-muted-foreground">{listing.city}</td>
                                <td className="px-4 py-3">
                                  <ListingLocaleBadges listing={listing} />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={translatingId === listing.id || !processorConfigured}
                                    onClick={() => translateSingle(listing.id)}
                                  >
                                    {translatingId === listing.id ? (
                                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="mr-1 h-3.5 w-3.5" />
                                    )}
                                    Translate
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>

          <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
            <Card className="border-border bg-card/80">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe2 className="h-5 w-5 text-primary" />
                      Locale Inspector
                    </CardTitle>
                    <CardDescription>
                      {selectedLocaleConfig
                        ? `${selectedLocaleConfig.flag} ${selectedLocaleConfig.name} · ${selectedLocaleConfig.localeCode}`
                        : "Select a locale"}
                    </CardDescription>
                  </div>
                  {selectedLocaleState ? <StatusBadge status={selectedLocaleState.status} /> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{selectedLocaleState ? `${selectedLocaleCoverageResult.translatedKeyCount} / ${selectedLocaleCoverageResult.sourceKeyCount} complete` : "No locale selected"}</span>
                    <span>{selectedLocaleCoverageResult.coverageLabel}</span>
                  </div>
                  <Progress value={selectedLocaleCoverage} className="h-1.5" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleCoverageResult.sourceKeyCount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Source</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleCoverageResult.translatedKeyCount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Complete</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleMissingKeys.length.toLocaleString()}</p>
                    <p className="text-muted-foreground">Missing</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleCoverageResult.staleKeyCount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Stale</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleCoverageResult.emptyValueKeyCount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Empty</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleCoverageResult.obsoleteKeyCount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Obsolete</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">
                      {selectedLocalePatch?.updatedAt ? new Date(selectedLocalePatch.updatedAt).toLocaleDateString() : "Bundled"}
                    </p>
                    <p className="text-muted-foreground">Last Sync</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">
                      {lastCoverageRefresh ? new Date(lastCoverageRefresh).toLocaleTimeString() : "Not run"}
                    </p>
                    <p className="text-muted-foreground">Refresh</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background px-2 py-2">
                    <p className="font-semibold text-foreground">{selectedLocaleCoverageResult.pendingManualKeyCount.toLocaleString()}</p>
                    <p className="text-muted-foreground">Manual</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(["all", "missing", "stale", "obsolete", "empty", "pending_manual", "complete"] as const).map((filter) => (
                    <Button
                      key={filter}
                      type="button"
                      size="sm"
                      variant={uiKeyStatusFilter === filter ? "default" : "outline"}
                      className="h-7 px-2 text-xs capitalize"
                      onClick={() => setUiKeyStatusFilter(filter)}
                    >
                      {filter.replace("_", " ")}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={uiKeySearchQuery}
                    onChange={(event) => setUiKeySearchQuery(event.target.value)}
                    className="bg-background pl-9"
                    placeholder="Search UI keys"
                  />
                </div>

                {visibleSelectedLocaleUiKeys.length === 0 && selectedLocaleMissingKeys.length === 0 && !uiKeySearchQuery.trim() ? (
                  <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="mx-auto mb-2 h-4 w-4 text-emerald-500" />
                    Locale complete for bundled UI keys.
                  </div>
                ) : visibleSelectedLocaleUiKeys.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
                    No UI keys match this search.
                  </div>
                ) : (
                  <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                    {visibleSelectedLocaleUiKeys.slice(0, 12).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedUiKey(key)}
                        className={[
                          "w-full rounded-lg border bg-background p-3 text-left transition hover:border-primary/40",
                          selectedUiKey === key ? "border-primary/50 ring-2 ring-primary/10" : "border-border",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="break-all font-mono text-[11px] text-foreground">{key}</p>
                          <Badge
                            variant="outline"
                            className={uiKeyStatusBadgeClass(selectedLocaleCoverageResult.statusByKey[key] ?? "complete")}
                          >
                            {uiKeyStatusLabel(selectedLocaleCoverageResult.statusByKey[key] ?? "complete")}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {enFlat[key] || selectedLocaleMergedFlat[key] || "No English source text available."}
                        </p>
                        {key in selectedLocaleMergedFlat ? (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">
                            {selectedLocaleMergedFlat[key]}
                          </p>
                        ) : null}
                      </button>
                    ))}
                    {visibleSelectedLocaleUiKeys.length > 12 ? (
                      <p className="text-center text-xs text-muted-foreground">
                        {visibleSelectedLocaleUiKeys.length - 12} more matching keys hidden.
                      </p>
                    ) : null}
                  </div>
                )}

                {selectedUiKey ? (
                  <div className="space-y-3 rounded-lg border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                          UI Key Editor
                        </p>
                        <p className="mt-1 break-all font-mono text-[11px] text-foreground">
                          {selectedUiKey}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={selectedUiKeyIsMissing
                          ? "border-amber-500/40 bg-amber-50 text-amber-700"
                          : "border-emerald-500/40 bg-emerald-50 text-emerald-700"}
                      >
                        {selectedUiKeyIsMissing ? "Missing" : "Editable"}
                      </Badge>
                    </div>

                    <div className="rounded-md border border-border bg-muted/30 p-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">English source</p>
                      <p className="mt-1 text-xs text-foreground">{selectedUiKeySource}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ui_key_translation">Locale text</Label>
                      <Textarea
                        id="ui_key_translation"
                        value={uiKeyDraft}
                        onChange={(event) => setUiKeyDraft(event.target.value)}
                        className="min-h-24 resize-y bg-card text-sm"
                        placeholder="Enter translated text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUiKeyDraft(selectedUiKeySource)}
                        disabled={isSavingUiKey}
                      >
                        Copy English
                      </Button>
                      <Button
                        type="button"
                        onClick={saveSelectedUiKey}
                        disabled={isSavingUiKey || !selectedLocaleState || !selectedUiKey || uiKeyDraft.trim() === selectedUiKeyCurrentValue.trim()}
                        className="gap-2"
                      >
                        {isSavingUiKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Save Key
                      </Button>
                    </div>
                  </div>
                ) : null}

                <Button
                  type="button"
                  className="w-full gap-2"
                  disabled={!selectedLocaleState || isLocaleBundleLoading || selectedLocaleState.status === "syncing" || isSyncingAll}
                  onClick={() => selectedLocaleState && syncLocale(selectedLocaleState.code)}
                >
                  {selectedLocaleState?.status === "syncing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedLocaleMissingKeys.length === 0 ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  {selectedLocaleMissingKeys.length === 0 ? "Re-sync Locale" : `Sync ${selectedLocaleMissingKeys.length.toLocaleString()} Keys`}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Translation Batch
                </CardTitle>
                <CardDescription>Queue listing content translations.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="translate_batch">Batch size</Label>
                  <Input
                    id="translate_batch"
                    type="number"
                    min={1}
                    max={200}
                    value={translateBatch}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10);
                      setTranslateBatch(Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 200) : 1);
                    }}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Recommended range: 10-50.</p>
                </div>

                <div className="grid gap-2">
                  <Button onClick={handleRunTranslationsNow} disabled={translateLoading || !processorConfigured} className="w-full">
                    {translateLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    {translateLoading ? "Running Batch" : "Run Batch"}
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setTranslateResult(null);
                      setTranslateError(null);
                    }}
                    disabled={translateLoading || (!translateResult && !translateError)}
                    className="w-full"
                  >
                    Clear Result
                  </Button>
                </div>

                {translateError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="flex items-start gap-2 text-sm font-medium text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {translateError}
                    </p>
                  </div>
                ) : null}

                {translateResult ? (
                  <div className="space-y-3 rounded-lg border border-border bg-background p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{translateResult.succeeded ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Done</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-amber-700">{translateResult.queued ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Queued</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-destructive">{translateResult.failed ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Failed</p>
                      </div>
                    </div>

                    {lastRunRows.length > 0 ? (
                      <div className="space-y-1 border-t border-border pt-2">
                        {lastRunRows.map((row: { id: string; name: string; status: string; error?: string }) => (
                          <div key={row.id} className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate text-muted-foreground">{row.name}</span>
                            <Badge
                              variant="outline"
                              className={
                                row.status === "failed"
                                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                                  : row.status === "queued"
                                    ? "border-amber-500/40 bg-amber-50 text-amber-700"
                                    : "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                              }
                            >
                              {row.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Guardrails
                </CardTitle>
                <CardDescription>Operational constraints for this workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <GuardrailRow label="Locale source" value="URL route" />
                <GuardrailRow label="UI sync writes" value="Server route" />
                <GuardrailRow
                  label="Schema"
                  value={
                    schemaHealth?.ready
                      ? "Ready"
                      : schemaHealthError
                        ? "Health check failed"
                        : "Needs migration"
                  }
                />
                {schemaHealth && !schemaHealth.ready ? (
                  <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-800">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      Database migration required
                    </div>
                    {schemaHealth.checks.filter((check) => !check.ready).map((check) => (
                      <p key={check.key}>{check.message}</p>
                    ))}
                  </div>
                ) : null}
                {schemaHealthError ? (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                    Schema health check failed: {schemaHealthError}
                  </p>
                ) : null}
                <GuardrailRow
                  label="Processor"
                  value={processorConfigured ? "Configured" : "Manual mode"}
                />
                <p className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground">
                  {processorMessage}
                </p>
                <GuardrailRow label="Listing batches" value={processorConfigured ? "Queued safely" : "Disabled"} />
                <GuardrailRow label="Public routing" value="Unchanged" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
      <TranslationReviewSheet
        open={Boolean(reviewJobId)}
        loading={reviewLoading}
        saving={reviewSaving}
        error={reviewError}
        data={reviewData}
        draft={reviewDraft}
        onDraftChange={(field, value) =>
          setReviewDraft((prev) => ({ ...prev, [field]: value }))
        }
        onClose={closeTranslationReview}
        onSave={saveTranslationReview}
      />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
        : "border-border bg-muted text-muted-foreground";

  return (
    <Card className="border-border bg-card/80">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${toneClass}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkstreamItem({
  icon,
  title,
  detail,
  active = false,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border px-3 py-2",
        active ? "border-primary/40 bg-primary/10" : "border-border bg-background",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function GuardrailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function TranslationReviewSheet({
  open,
  loading,
  saving,
  error,
  data,
  draft,
  onDraftChange,
  onClose,
  onSave,
}: {
  open: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  data: TranslationReviewData | null;
  draft: TranslationDraft;
  onDraftChange: (field: keyof TranslationDraft, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const source = data?.listing;
  const targetLang = data?.job.target_lang?.toUpperCase() ?? "";
  const status = data?.translation?.translation_status ?? data?.job.status;

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex w-[min(100vw,58rem)] max-w-[58rem] flex-col gap-0 p-0 sm:max-w-[58rem]"
      >
        <SheetHeader className="border-b border-border px-4 py-4 pr-14 text-left sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="font-serif text-xl">
                Translation Review
              </SheetTitle>
              <SheetDescription>
                {source?.name ?? "Loading listing"}{targetLang ? ` · ${targetLang}` : ""}
              </SheetDescription>
            </div>
            {status ? (
              <Badge variant="outline" className="shrink-0 bg-background">
                {STATUS_LABELS[status]}
              </Badge>
            ) : null}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loading ? (
            <div className="flex min-h-[22rem] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading translation
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ReviewMeta label="Listing" value={source?.name ?? "Untitled"} />
                <ReviewMeta label="Locale" value={data.job.target_lang} />
                <ReviewMeta label="Updated" value={data.translation?.updated_at ? new Date(data.translation.updated_at).toLocaleString() : "Not saved"} />
              </div>

              <ReviewField
                label="Title"
                sourceValue={source?.name}
                value={draft.title}
                onChange={(value) => onDraftChange("title", value)}
              />
              <ReviewField
                label="Short Description"
                sourceValue={source?.short_description}
                value={draft.short_description}
                onChange={(value) => onDraftChange("short_description", value)}
                multiline
              />
              <ReviewField
                label="Description"
                sourceValue={source?.description}
                value={draft.description}
                onChange={(value) => onDraftChange("description", value)}
                multiline
                tall
              />
              <ReviewField
                label="SEO Title"
                sourceValue={source?.meta_title}
                value={draft.seo_title}
                onChange={(value) => onDraftChange("seo_title", value)}
              />
              <ReviewField
                label="SEO Description"
                sourceValue={source?.meta_description}
                value={draft.seo_description}
                onChange={(value) => onDraftChange("seo_description", value)}
                multiline
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-background px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={saving || loading || !data} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Edit
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ReviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ReviewField({
  label,
  sourceValue,
  value,
  onChange,
  multiline = false,
  tall = false,
}: {
  label: string;
  sourceValue?: string | null;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  tall?: boolean;
}) {
  const fieldId = `translation-review-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <Label htmlFor={fieldId} className="text-sm font-semibold">{label}</Label>
      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">English source</p>
          <p className={tall ? "mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap text-sm text-foreground" : "mt-2 whitespace-pre-wrap text-sm text-foreground"}>
            {sourceValue || "No English source text."}
          </p>
        </div>
        <div>
          {multiline ? (
            <Textarea
              id={fieldId}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className={tall ? "min-h-56 resize-y bg-background" : "min-h-28 resize-y bg-background"}
            />
          ) : (
            <Input
              id={fieldId}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="bg-background"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function JobMetric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "amber" | "emerald" | "red";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
        : tone === "red"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-background text-muted-foreground";

  return (
    <div className={`rounded-lg border px-3 py-3 ${toneClass}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs opacity-80">{detail}</p>
    </div>
  );
}

function ListingLocaleBadges({ listing }: { listing: IncompleteListing }) {
  const groups = [
    { label: "Missing", langs: listing.missingLangs, className: "border-amber-400/60 bg-amber-50 text-amber-700" },
    { label: "Pending", langs: listing.pendingLangs, className: "border-blue-400/60 bg-blue-50 text-blue-700" },
    { label: "Failed", langs: listing.failedLangs, className: "border-destructive/40 bg-destructive/10 text-destructive" },
    { label: "Stale", langs: listing.staleLangs, className: "border-violet-400/60 bg-violet-50 text-violet-700" },
    { label: "Fields", langs: listing.emptyFieldLangs, className: "border-orange-400/60 bg-orange-50 text-orange-700" },
  ].filter((group) => group.langs.length > 0);

  return (
    <div className="flex min-w-0 flex-wrap gap-1">
      {groups.map((group) =>
        group.langs.map((lang) => (
          <Badge
            key={`${group.label}:${lang}`}
            variant="outline"
            className={`max-w-full px-1.5 py-0 text-[10px] ${group.className}`}
            title={
              group.label === "Fields" && listing.fieldGaps[lang]?.length
                ? `Missing fields: ${listing.fieldGaps[lang].join(", ")}`
                : group.label
            }
          >
            {lang} · {group.label}
          </Badge>
        )),
      )}
    </div>
  );
}

function TranslationJobGroupPreview({
  group,
  loadingActionId,
  processorConfigured,
  onQueueJobs,
  onReviewJobs,
  onRequeueOutdated,
  onOpenReview,
}: {
  group: ListingJobGroup;
  loadingActionId: string | null;
  processorConfigured: boolean;
  onQueueJobs: (jobIds: string[], label: string) => Promise<void>;
  onReviewJobs: (jobIds: string[], label: string) => Promise<void>;
  onRequeueOutdated: (listingId: string, listingName: string) => Promise<void>;
  onOpenReview: (jobId: string) => void;
}) {
  const attentionCount = group.jobs.filter((job) =>
    ATTENTION_STATUSES.includes(job.status),
  ).length;
  const doneCount = group.jobs.filter((job) => DONE_STATUSES.includes(job.status)).length;
  const failedCount = group.jobs.filter((job) => job.status === "failed").length;
  const queuedCount = group.jobs.filter((job) => job.status === "queued").length;
  const missingJobs = group.jobs.filter((job) => job.status === "missing");
  const failedJobs = group.jobs.filter((job) => job.status === "failed");
  const autoJobs = group.jobs.filter((job) => job.status === "auto");
  const outdatedJobs = group.jobs.filter((job) =>
    DONE_STATUSES.includes(job.status) &&
    Boolean(job.source_updated_at) &&
    Boolean(group.listing.content_updated_at) &&
    new Date(job.source_updated_at ?? "").getTime() < new Date(group.listing.content_updated_at).getTime(),
  );
  const latestUpdated = group.jobs
    .map((job) => new Date(job.updated_at).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  const missingActionId = `queue:${missingJobs.map((job) => job.id).join(",")}`;
  const failedActionId = `queue:${failedJobs.map((job) => job.id).join(",")}`;
  const reviewActionId = `review:${autoJobs.map((job) => job.id).join(",")}`;
  const outdatedActionId = `requeue_outdated:${group.listing.id}`;

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{group.listing.name}</p>
            <Badge
              variant="outline"
              className={
                group.listing.tier === "signature"
                  ? "border-amber-500/40 bg-amber-50 text-amber-700"
                  : "bg-muted text-muted-foreground"
              }
            >
              {group.listing.tier}
            </Badge>
            {attentionCount > 0 ? (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-50 text-amber-700">
                {attentionCount} attention
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {group.listing.city || "No city"}{group.listing.category ? ` · ${group.listing.category}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs md:min-w-[220px]">
          <div className="rounded-md border border-border bg-card px-2 py-2">
            <p className="font-semibold text-foreground">{group.seoCoverage}%</p>
            <p className="text-muted-foreground">SEO</p>
          </div>
          <div className="rounded-md border border-border bg-card px-2 py-2">
            <p className="font-semibold text-foreground">{doneCount}/{group.jobs.length}</p>
            <p className="text-muted-foreground">Done</p>
          </div>
          <div className="rounded-md border border-border bg-card px-2 py-2">
            <p className="font-semibold text-foreground">{group.priorityScore}</p>
            <p className="text-muted-foreground">Priority</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {group.jobs.slice(0, 10).map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onOpenReview(job.id)}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Badge
              variant="outline"
              className={
                job.status === "failed"
                  ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
                  : job.status === "queued"
                    ? "border-blue-500/30 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : job.status === "missing"
                      ? "border-amber-500/40 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : DONE_STATUSES.includes(job.status)
                        ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            >
              {job.target_lang.toUpperCase()} · {STATUS_LABELS[job.status]}
            </Badge>
          </button>
        ))}
        {group.jobs.length > 10 ? (
          <span className="text-xs text-muted-foreground">+{group.jobs.length - 10} more</span>
        ) : null}
      </div>

      {(missingJobs.length > 0 || failedJobs.length > 0 || autoJobs.length > 0 || outdatedJobs.length > 0) ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {missingJobs.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={Boolean(loadingActionId)}
              onClick={() => onQueueJobs(
                missingJobs.map((job) => job.id),
                `${missingJobs.length} missing job${missingJobs.length !== 1 ? "s" : ""}`,
              )}
              className="h-8 gap-2 border-blue-500/30 text-blue-700"
            >
              {loadingActionId === missingActionId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
              Queue Missing
            </Button>
          ) : null}

          {failedJobs.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={Boolean(loadingActionId) || !processorConfigured}
              onClick={() => onQueueJobs(
                failedJobs.map((job) => job.id),
                `${failedJobs.length} failed job${failedJobs.length !== 1 ? "s" : ""}`,
              )}
              className="h-8 gap-2 border-orange-500/30 text-orange-700"
            >
              {loadingActionId === failedActionId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Retry Failed
            </Button>
          ) : null}

          {autoJobs.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={Boolean(loadingActionId) || !processorConfigured}
              onClick={() => onReviewJobs(
                autoJobs.map((job) => job.id),
                `${autoJobs.length} AI job${autoJobs.length !== 1 ? "s" : ""}`,
              )}
              className="h-8 gap-2 border-emerald-500/30 text-emerald-700"
            >
              {loadingActionId === reviewActionId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              Mark AI Reviewed
            </Button>
          ) : null}

          {outdatedJobs.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={Boolean(loadingActionId) || !processorConfigured}
              onClick={() => onRequeueOutdated(group.listing.id, group.listing.name)}
              className="h-8 gap-2 border-violet-500/30 text-violet-700"
            >
              {loadingActionId === outdatedActionId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Requeue Outdated
            </Button>
          ) : null}
        </div>
      ) : null}

      {(failedCount > 0 || queuedCount > 0 || latestUpdated) ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            {failedCount > 0 ? `${failedCount} failed · ` : ""}
            {queuedCount > 0 ? `${queuedCount} queued` : "No queued jobs"}
          </span>
          {latestUpdated ? (
            <span>Updated {new Date(latestUpdated).toLocaleString()}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── Status Badge helper ───────────────────────────────────────────────────────
function uiKeyStatusLabel(status: UiTranslationKeyStatus) {
  return status.replace("_", " ");
}

function uiKeyStatusBadgeClass(status: UiTranslationKeyStatus) {
  switch (status) {
    case "complete":
      return "shrink-0 border-emerald-500/30 bg-emerald-50 px-1.5 py-0 text-[10px] text-emerald-700";
    case "missing":
      return "shrink-0 border-amber-500/40 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-700";
    case "pending_manual":
      return "shrink-0 border-blue-500/30 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-700";
    case "stale":
      return "shrink-0 border-violet-500/30 bg-violet-50 px-1.5 py-0 text-[10px] text-violet-700";
    case "obsolete":
      return "shrink-0 border-zinc-400/40 bg-zinc-50 px-1.5 py-0 text-[10px] text-zinc-700";
    case "empty":
    case "invalid":
      return "shrink-0 border-destructive/40 bg-destructive/10 px-1.5 py-0 text-[10px] text-destructive";
  }
}

function StatusBadge({ status }: { status: LocaleStatus }) {
  switch (status) {
    case "synced":
      return (
        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950 gap-1 text-xs">
          <CheckCircle2 className="w-3 h-3" /> Synced
        </Badge>
      );
    case "missing":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950 gap-1 text-xs">
          <AlertCircle className="w-3 h-3" /> Missing
        </Badge>
      );
    case "syncing":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950 gap-1 text-xs">
          <Loader2 className="w-3 h-3 animate-spin" /> Syncing
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <AlertCircle className="w-3 h-3" /> Error
        </Badge>
      );
  }
}
