import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  LISTING_TRANSLATION_TARGET_LANGS,
  normalizeListingTranslationLanguageCode,
  queueListingTranslationJobs,
} from "@/lib/listingTranslationQueue";
import { toast } from "sonner";
import {
  Languages,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Zap,
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeMissingKeys(
  englishKeys: string[],
  bundledLocaleData: Record<string, unknown>,
  dbLocaleData?: Record<string, unknown>,
) {
  const bundledFlat = flattenI18nData(bundledLocaleData);
  const mergedFlat = dbLocaleData
    ? { ...bundledFlat, ...flattenI18nData(dbLocaleData) }
    : bundledFlat;

  return englishKeys.filter((key) => !(key in mergedFlat));
}

// ── Types ─────────────────────────────────────────────────────────────────────
type LocaleStatus = "synced" | "missing" | "syncing" | "error";

interface LocaleState {
  code: string;
  name: string;
  flag: string;
  missingCount: number;
  totalKeys: number;
  status: LocaleStatus;
  lastSynced?: string;
  lastError?: string;
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
    const missing = computeMissingKeys(enKeys, localeDataByCode[loc.code] ?? {});
    return {
      code: loc.code,
      name: loc.name,
      flag: loc.flag,
      missingCount: missing.length,
      totalKeys: enKeys.length,
      status: missing.length === 0 ? "synced" : "missing",
    };
  });

  const [localeStates, setLocaleStates] = useState<LocaleState[]>(initialLocaleStates);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentLocale, setCurrentLocale] = useState<string | null>(null);
  const [translateBatch, setTranslateBatch] = useState(10);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState<any>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [missingTranslations, setMissingTranslations] = useState<
    { id: string; name: string; slug: string; city: string; status: string; missingLangs: string[] }[]
  >([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const buildListingCoverageMaps = useCallback(async (listingIds: readonly string[]) => {
    const translatedMap = new Map<string, Set<string>>();
    const queuedMap = new Map<string, Set<string>>();
    const ids = Array.from(new Set(listingIds.filter(Boolean)));

    if (ids.length === 0) {
      return { translatedMap, queuedMap };
    }

    // Keep each chunk comfortably below Supabase's default 1000-row response cap.
    const idChunks = chunkArray(ids, 50);

    for (const chunk of idChunks) {
      const [{ data: translated, error: translatedError }, { data: jobs, error: jobsError }] =
        await Promise.all([
          supabase
            .from("listing_translations")
            .select("listing_id, language_code, translation_status")
            .in("listing_id", chunk),
          supabase
            .from("translation_jobs")
            .select("listing_id, target_lang, status")
            .in("listing_id", chunk)
            .in("status", ["queued"]),
        ]);

      if (translatedError) throw translatedError;
      if (jobsError) throw jobsError;

      for (const translation of (translated || []) as any[]) {
        if (!translation?.listing_id || !translation?.language_code) continue;
        if (!isCompletedTranslationStatus(translation.translation_status)) continue;

        const normalizedLang = normalizeListingTranslationLanguageCode(translation.language_code);
        if (!TARGET_LANGS_SET.has(normalizedLang)) continue;

        if (!translatedMap.has(translation.listing_id)) {
          translatedMap.set(translation.listing_id, new Set());
        }
        translatedMap.get(translation.listing_id)!.add(normalizedLang);
      }

      for (const job of (jobs || []) as any[]) {
        if (!job?.listing_id || !job?.target_lang) continue;

        const normalizedLang = normalizeListingTranslationLanguageCode(job.target_lang);
        if (!TARGET_LANGS_SET.has(normalizedLang)) continue;

        if (!queuedMap.has(job.listing_id)) {
          queuedMap.set(job.listing_id, new Set());
        }
        queuedMap.get(job.listing_id)!.add(normalizedLang);
      }
    }

    return { translatedMap, queuedMap };
  }, []);

  const collectMissingPublishedListings = useCallback(async (limit: number) => {
    const missing: { id: string; name: string; slug: string; city: string; status: string; missingLangs: string[] }[] = [];
    let offset = 0;

    while (missing.length < limit) {
      const { data, error } = await supabase
        .from("listings")
        .select("id, name, slug, status, cities(name)")
        .eq("status", "published")
        .order("name", { ascending: true })
        .range(offset, offset + LISTINGS_PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      const listingIds = data.map((listing: any) => String(listing.id));
      const { translatedMap, queuedMap } = await buildListingCoverageMaps(listingIds);

      for (const listing of data as any[]) {
        const translatedLangs = translatedMap.get(listing.id) ?? new Set<string>();
        const queuedLangs = queuedMap.get(listing.id) ?? new Set<string>();
        const missingLangs = TARGET_LANGS.filter(
          (lang) => !translatedLangs.has(lang) && !queuedLangs.has(lang),
        );

        if (missingLangs.length > 0) {
          missing.push({
            id: listing.id,
            name: listing.name,
            slug: listing.slug,
            city: listing.cities?.name || "—",
            status: listing.status,
            missingLangs,
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

      const { data, error } = await i18nClient
        .from("i18n_locale_data" as never)
        .select("locale,data,updated_at")
        .in("locale", LOCALES.map((locale) => locale.code));

      if (error || !active) return;

      type LocalePatchRow = {
        locale: string;
        data: Record<string, unknown>;
        updated_at: string;
      };

      const patchRows = ((data ?? []) as unknown) as LocalePatchRow[];
      const patchByLocale = new Map(patchRows.map((row) => [row.locale, row]));

      setLocaleStates(
        LOCALES.map((locale) => {
          const patchRow = patchByLocale.get(locale.code);
          const missingKeys = computeMissingKeys(
            enKeys,
            localeDataByCode[locale.code] ?? {},
            patchRow?.data,
          );

          return {
            code: locale.code,
            name: locale.name,
            flag: locale.flag,
            totalKeys: enKeys.length,
            missingCount: missingKeys.length,
            status: missingKeys.length === 0 ? "synced" : "missing",
            lastSynced: patchRow?.updated_at,
          };
        }),
      );
    };

    void hydrateLocaleStates();
    return () => {
      active = false;
    };
  }, [enKeys, i18nClient, localeDataByCode]);

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
    ) => {
      try {
        await fetchAdmin("/api/admin/i18n/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: localeCode,
            data,
            keyCount,
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
        const missingKeys = enKeys.filter((key) => !(key in existingFlat));
        let usedEnglishFallback = false;
        let fallbackReason: string | null = null;

        if (missingKeys.length === 0) {
          updateLocale(localeCode, {
            status: "synced",
            missingCount: 0,
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

        // Call existing translate-i18n edge function (batches of 80 keys)
        const BATCH_SIZE = 80;
        const translated: Record<string, string> = {};
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

            // Keep locale complete even when the translation endpoint is unavailable.
            // This prevents hard failures and preserves UX with English fallback values.
            Object.assign(translated, batchObj);
            usedEnglishFallback = true;
            if (!fallbackReason) {
              fallbackReason = isAuthError
                ? "translation endpoint auth unavailable"
                : message;
            }
            continue;
          }

          if (data?.error) {
            Object.assign(translated, batchObj);
            usedEnglishFallback = true;
            fallbackReason = fallbackReason ?? data.error;
            continue;
          }

          const translatedBatch = data?.translated ?? {};
          for (const key of batch) {
            const translatedValue = translatedBatch[key] ?? batchObj[key];
            translated[key] = enforcePremiumInTranslation(
              batchObj[key],
              translatedValue,
            );
          }
        }

        // Merge translated keys into the full locale data
        const mergedFlat = { ...existingFlat, ...translated };
        const mergedNested = enforcePremiumInLocaleData(
          unflattenI18nData(mergedFlat),
          englishData,
        );
        const mergedNestedFlat = flattenI18nData(mergedNested);
        const nowIso = new Date().toISOString();

        await persistLocaleData(
          localeCode,
          mergedNested,
          Object.keys(mergedNestedFlat).length,
        );

        updateLocale(localeCode, {
          status: "synced",
          missingCount: 0,
          lastSynced: nowIso,
          lastError: undefined,
        });

        if (usedEnglishFallback) {
          toast.warning(
            `${localeConfig.flag} ${localeConfig.name} synced with English fallback for ${missingKeys.length} key${missingKeys.length !== 1 ? "s" : ""}${fallbackReason ? ` (${fallbackReason})` : ""}.`,
          );
        } else {
          toast.success(`${localeConfig.flag} ${localeConfig.name} synced — ${missingKeys.length} keys translated`);
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        updateLocale(localeCode, { status: "error", lastError: msg });
        toast.error(`Failed to sync ${localeCode}: ${msg}`);
        return false;
      } finally {
        setCurrentLocale(null);
      }
    },
    [enFlat, enKeys, englishData, i18nClient, localeDataByCode, persistLocaleData, updateLocale]
  );

  // ── Sync all locales sequentially ──────────────────────────────────────────
  const syncAll = useCallback(async () => {
    const toSync = localeStates.filter((l) => l.missingCount > 0);
    if (toSync.length === 0) {
      toast.info("All locales are already fully synced!");
      return;
    }

    setIsSyncingAll(true);
    setSyncProgress(0);
    let successful = 0;

    for (let i = 0; i < toSync.length; i++) {
      const ok = await syncLocale(toSync[i].code);
      if (ok) successful += 1;
      setSyncProgress(Math.round(((i + 1) / toSync.length) * 100));
    }

    setIsSyncingAll(false);
    setSyncProgress(100);
    const failed = toSync.length - successful;
    if (failed === 0) {
      toast.success("All locales synced successfully!");
    } else {
      toast.warning(`${successful} locale${successful !== 1 ? "s" : ""} synced, ${failed} failed.`);
    }
  }, [localeStates, syncLocale]);

  const fetchMissingTranslations = useCallback(async () => {
    setMissingLoading(true);
    try {
      const computedMissing = await collectMissingPublishedListings(MAX_INCOMPLETE_LISTINGS);
      setMissingTranslations(computedMissing);
    } catch (e: any) {
      toast.error("Failed to load missing translations: " + e.message);
    } finally {
      setMissingLoading(false);
    }
  }, [collectMissingPublishedListings]);

  const translateSingle = useCallback(
    async (listingId: string) => {
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
            return;
          }
          throw new Error(await getSupabaseFunctionErrorMessage(error, "Translation request failed"));
        }

        if (data?.ok === false) throw new Error(data.error || "Translation request failed");
        toast.success("Translation queued successfully.");
        await fetchMissingTranslations();
      } catch (e: any) {
        toast.error("Translation failed: " + e.message);
      } finally {
        setTranslatingId(null);
      }
    },
    [fetchMissingTranslations],
  );

  const runTranslationsNow = useCallback(async () => {
    setTranslateLoading(true);
    setTranslateError(null);
    setTranslateResult(null);

    try {
      const listings = await collectMissingPublishedListings(translateBatch);

      if (!listings.length) {
        setTranslateResult({ message: "No listings require translation", processed: 0 });
        toast.success("All listings are already translated.");
        await fetchMissingTranslations();
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
    } catch (e: any) {
      const msg = e?.message || String(e);
      setTranslateError(msg);
      toast.error(`Translation failed: ${msg}`);
    } finally {
      setTranslateLoading(false);
    }
  }, [collectMissingPublishedListings, fetchMissingTranslations, translateBatch]);

  useEffect(() => {
    void fetchMissingTranslations();
  }, [fetchMissingTranslations]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalMissing = localeStates.reduce((s, l) => s + l.missingCount, 0);
  const syncedCount = localeStates.filter((l) => l.status === "synced").length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Languages className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground">
                UI Locale Sync
              </h1>
              <p className="text-sm text-muted-foreground">
                {enKeys.length} bundled UI keys in English · {syncedCount}/{LOCALES.length} locales fully synced
              </p>
            </div>
          </div>

          <Button
            onClick={syncAll}
            disabled={isSyncingAll || totalMissing === 0}
            className="gap-2"
          >
            {isSyncingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isSyncingAll
              ? `Syncing… ${syncProgress}%`
              : totalMissing === 0
              ? "All Synced"
              : `Sync All (${totalMissing} missing)`}
          </Button>
        </div>

        {/* Sync-all progress bar */}
        {isSyncingAll && (
          <div className="space-y-1">
            <Progress value={syncProgress} className="h-2" />
            {currentLocale && (
              <p className="text-xs text-muted-foreground">
                Translating {LOCALES.find((l) => l.code === currentLocale)?.flag}{" "}
                {LOCALES.find((l) => l.code === currentLocale)?.name}…
              </p>
            )}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">English keys</p>
              <p className="text-3xl font-semibold mt-1">{enKeys.length.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Locales synced</p>
              <p className="text-3xl font-semibold mt-1">
                {syncedCount}
                <span className="text-muted-foreground text-lg">/{LOCALES.length}</span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Keys missing</p>
              <p className={`text-3xl font-semibold mt-1 ${totalMissing > 0 ? "text-amber-500" : "text-green-500"}`}>
                {totalMissing}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Per-locale grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {localeStates.map((locale) => {
            const coverage = Math.round(
              ((locale.totalKeys - locale.missingCount) / locale.totalKeys) * 100
            );
            const isSyncing = locale.status === "syncing";

            return (
              <Card key={locale.code} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{locale.flag}</span>
                      <div>
                        <CardTitle className="text-base">{locale.name}</CardTitle>
                        <CardDescription className="text-xs">{locale.code.toUpperCase()}</CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={locale.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{locale.totalKeys - locale.missingCount} / {locale.totalKeys} keys</span>
                      <span>{coverage}%</span>
                    </div>
                    <Progress value={coverage} className="h-1.5" />
                  </div>

                  {locale.missingCount > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {locale.missingCount} key{locale.missingCount !== 1 ? "s" : ""} missing
                    </p>
                  )}

                  {locale.lastSynced && (
                    <p className="text-xs text-muted-foreground">
                      Last synced {new Date(locale.lastSynced).toLocaleTimeString()}
                    </p>
                  )}

                  {locale.status === "error" && locale.lastError && (
                    <p className="text-xs text-destructive" title={locale.lastError}>
                      {locale.lastError}
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant={locale.missingCount === 0 ? "outline" : "default"}
                    className="w-full gap-2"
                    disabled={isSyncing || isSyncingAll}
                    onClick={() => syncLocale(locale.code)}
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Translating…
                      </>
                    ) : locale.missingCount === 0 ? (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Re-sync
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        Sync {locale.missingCount} keys
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info note */}
        <Card className="bg-muted/40 border-dashed">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">How it works:</strong> The top section syncs bundled UI locale keys (`i18n_locale_data`) against English source keys. The section below manages listing content translation jobs stored in <code>listing_translations</code> and <code>translation_jobs</code>.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 text-primary" />
              Content Translation Jobs
            </CardTitle>
            <CardDescription>
              Process listing content translations stored in Supabase.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="translate_batch">Batch size (n)</Label>
                <Input
                  id="translate_batch"
                  type="number"
                  min={1}
                  max={200}
                  value={translateBatch}
                  onChange={(e) => setTranslateBatch(Number(e.target.value))}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">Recommended: 10-50 per run (cost-controlled).</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={runTranslationsNow} disabled={translateLoading}>
                  {translateLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {translateLoading ? "Translating..." : "Translate now"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setTranslateResult(null);
                    setTranslateError(null);
                  }}
                  disabled={translateLoading}
                >
                  Clear
                </Button>
              </div>
            </div>

            {translateError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {translateError}
                </p>
              </div>
            )}

            {translateResult && (
              <div className="space-y-2">
                <Label>Last run result</Label>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto border border-border">
                  {JSON.stringify(translateResult, null, 2)}
                </pre>
              </div>
            )}

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <Info className="h-4 w-4 inline-block mr-2 text-primary" />
                After running, validate results in <code>listing_translations</code> and check remaining jobs in{" "}
                <code>translation_jobs</code> where status = <code>queued</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Listings Missing Content Translations
                </CardTitle>
                <CardDescription>
                  Published listings missing one or more of: pt-pt · fr · de · es · it · nl · sv · no · da
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchMissingTranslations} disabled={missingLoading}>
                {missingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">{missingLoading ? "Loading..." : "Refresh"}</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {missingTranslations.length === 0 && !missingLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                All published listings are currently translated for the supported content locales.
              </div>
            ) : missingLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="destructive">
                    {missingTranslations.length} listing{missingTranslations.length !== 1 ? "s" : ""} incomplete
                  </Badge>
                </div>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">City</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">Missing</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingTranslations.map((listing, i) => (
                        <tr key={listing.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-4 py-2 font-medium truncate max-w-[200px]">{listing.name}</td>
                          <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{listing.city}</td>
                          <td className="px-4 py-2 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {listing.missingLangs.map((lang) => (
                                <Badge
                                  key={lang}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600"
                                >
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={translatingId === listing.id}
                              onClick={() => translateSingle(listing.id)}
                            >
                              {translatingId === listing.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Status Badge helper ───────────────────────────────────────────────────────
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
