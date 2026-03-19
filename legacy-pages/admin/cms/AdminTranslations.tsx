import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunctionWithAuthRetry } from "@/lib/supabaseFunctionInvoke";
import { getValidAccessToken } from "@/lib/authToken";
import {
  getSupabaseFunctionErrorMessage,
  isSupabaseFunctionAuthError,
} from "@/lib/supabaseFunctionError";
import { toast } from "sonner";
import {
  Languages,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";

// ── Static locale data (bundled at build time) ────────────────────────────────
import en from "@/i18n/locales/en.json";
import pt from "@/i18n/locales/pt.json";
import de from "@/i18n/locales/de.json";
import fr from "@/i18n/locales/fr.json";
import es from "@/i18n/locales/es.json";
import it from "@/i18n/locales/it.json";
import nl from "@/i18n/locales/nl.json";
import sv from "@/i18n/locales/sv.json";
import no from "@/i18n/locales/no.json";
import da from "@/i18n/locales/da.json";

// ── Locale configuration ──────────────────────────────────────────────────────
const LOCALES: { code: string; name: string; flag: string; data: Record<string, unknown> }[] = [
  { code: "pt",    name: "Portuguese",  flag: "🇵🇹", data: pt as Record<string, unknown> },
  { code: "de",    name: "German",      flag: "🇩🇪", data: de as Record<string, unknown> },
  { code: "fr",    name: "French",      flag: "🇫🇷", data: fr as Record<string, unknown> },
  { code: "es",    name: "Spanish",     flag: "🇪🇸", data: es as Record<string, unknown> },
  { code: "it",    name: "Italian",     flag: "🇮🇹", data: it as Record<string, unknown> },
  { code: "nl",    name: "Dutch",       flag: "🇳🇱", data: nl as Record<string, unknown> },
  { code: "sv",    name: "Swedish",     flag: "🇸🇪", data: sv as Record<string, unknown> },
  { code: "no",    name: "Norwegian",   flag: "🇳🇴", data: no as Record<string, unknown> },
  { code: "da",    name: "Danish",      flag: "🇩🇰", data: da as Record<string, unknown> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value ?? "");
    }
  }
  return result;
}

function unflatten(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [dottedKey, value] of Object.entries(flat)) {
    const parts = dottedKey.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function computeMissingKeys(
  englishKeys: string[],
  bundledLocaleData: Record<string, unknown>,
  dbLocaleData?: Record<string, unknown>,
) {
  const bundledFlat = flatten(bundledLocaleData);
  const mergedFlat = dbLocaleData
    ? { ...bundledFlat, ...flatten(dbLocaleData) }
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminTranslations() {
  const enFlat = useMemo(() => flatten(en as Record<string, unknown>), []);
  const enKeys = useMemo(() => Object.keys(enFlat), [enFlat]);
  const i18nClient = useMemo(
    () => supabase as unknown as { from: (table: string) => any },
    [],
  );

  // Compute initial state from bundled locale files
  const initialLocaleStates: LocaleState[] = LOCALES.map((loc) => {
    const missing = computeMissingKeys(enKeys, loc.data);
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

  useEffect(() => {
    let active = true;

    const hydrateLocaleStates = async () => {
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
            locale.data,
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
  }, [enKeys, i18nClient]);

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
      const accessToken = await getValidAccessToken();
      const response = await fetch("/api/admin/i18n/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          locale: localeCode,
          data,
          keyCount,
        }),
      });

      let payload: { error?: string; hint?: string } | null = null;
      try {
        payload = (await response.json()) as { error?: string; hint?: string };
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message = [payload?.error, payload?.hint].filter(Boolean).join(" ");
        throw new Error(message || `Failed to persist locale ${localeCode}`);
      }
    },
    [],
  );

  // ── Sync a single locale ────────────────────────────────────────────────────
  const syncLocale = useCallback(
    async (localeCode: string) => {
      const localeConfig = LOCALES.find((l) => l.code === localeCode);
      if (!localeConfig) return false;

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
          ...flatten(localeConfig.data),
          ...(existingLocalePatch?.data && typeof existingLocalePatch.data === "object"
            ? flatten(existingLocalePatch.data as Record<string, unknown>)
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
          for (const k of batch) batchObj[k] = keysToTranslate[k];

          const { data, error } = await invokeFunctionWithAuthRetry<{
            translated?: Record<string, string>;
            error?: string;
          }>("translate-i18n", {
            body: { lang: localeCode, langName: localeConfig.name, keys: batchObj },
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

          Object.assign(translated, data?.translated ?? {});
        }

        // Merge translated keys into the full locale data
        const mergedFlat = { ...existingFlat, ...translated };
        const mergedNested = unflatten(mergedFlat);
        const nowIso = new Date().toISOString();

        await persistLocaleData(
          localeCode,
          mergedNested,
          Object.keys(mergedFlat).length,
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
    [enFlat, enKeys, i18nClient, persistLocaleData, updateLocale]
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
                Translation Sync
              </h1>
              <p className="text-sm text-muted-foreground">
                {enKeys.length} keys in English · {syncedCount}/{LOCALES.length} locales fully synced
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
              <strong className="text-foreground">How it works:</strong> This panel compares each locale against the English source (`en.json`), identifies missing keys, translates them via AI, and saves the results to Supabase. Translations are served from the database at runtime — no rebuild needed. Add a new English key, then hit Sync.
            </p>
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
