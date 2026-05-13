import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import { loadLocale } from "@/i18n/locale-loader";
import { enforcePremiumInLocaleData } from "@/lib/i18n/premiumGuard";
import type { UiTranslationStoredStatus } from "@/lib/i18n/translationCoverage";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

const ALLOWED_LOCALES = new Set(["pt", "de", "fr", "es", "it", "nl", "sv", "no", "da"]);
const ALLOWED_KEY_STATUSES = new Set<UiTranslationStoredStatus>([
  "translated",
  "reviewed",
  "edited",
  "pending_manual",
  "missing",
  "stale",
  "obsolete",
  "failed",
]);

// Role guard is centralized in requireAdminWriteClient via get_user_role;
// this endpoint intentionally remains open to admin and editor.
// Legacy contract equivalent: role !== "admin" && role !== "editor".
interface SyncLocaleBody {
  locale?: unknown;
  data?: unknown;
  keyCount?: unknown;
  keyStatuses?: unknown;
}

interface SyncLocaleKeyStatus {
  keyPath: string;
  sourceHash: string;
  status: UiTranslationStoredStatus;
  reviewedAt?: string | null;
}

function parseKeyStatuses(raw: unknown): SyncLocaleKeyStatus[] {
  if (!Array.isArray(raw)) return [];
  const rows: SyncLocaleKeyStatus[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const keyPath = typeof row.keyPath === "string" ? row.keyPath.trim() : "";
    const sourceHash = typeof row.sourceHash === "string" ? row.sourceHash.trim() : "";
    const status = typeof row.status === "string" ? row.status.trim() : "";

    if (!keyPath || keyPath.length > 500 || !sourceHash || !ALLOWED_KEY_STATUSES.has(status as UiTranslationStoredStatus)) {
      continue;
    }

    rows.push({
      keyPath,
      sourceHash,
      status: status as UiTranslationStoredStatus,
      reviewedAt: typeof row.reviewedAt === "string" ? row.reviewedAt : null,
    });
  }

  return rows.slice(0, 5_000);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins or editors can sync locale data.");
  if ("error" in auth) return auth.error;

  let body: SyncLocaleBody;
  try {
    body = await request.json() as SyncLocaleBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const locale = typeof body.locale === "string" ? body.locale.trim().toLowerCase() : "";
  if (!ALLOWED_LOCALES.has(locale)) {
    return NextResponse.json({ ok: false, error: "Invalid locale." }, { status: 400 });
  }

  if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return NextResponse.json({ ok: false, error: "Invalid locale data payload." }, { status: 400 });
  }

  const keyCount =
    typeof body.keyCount === "number" && Number.isFinite(body.keyCount)
      ? Math.max(0, Math.floor(body.keyCount))
      : 0;

  const payload: Database["public"]["Tables"]["i18n_locale_data"]["Insert"] = {
    locale,
    data: enforcePremiumInLocaleData(
      body.data as Record<string, unknown>,
      await loadLocale("en"),
    ) as Database["public"]["Tables"]["i18n_locale_data"]["Insert"]["data"],
    key_count: keyCount,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await auth.writeClient
    .from("i18n_locale_data")
    .upsert(payload, { onConflict: "locale" });

  if (upsertError) {
    const isPermissionError = /row-level security|permission denied|42501/i.test(upsertError.message);
    return adminErrorResponse(
      isPermissionError ? 403 : 500,
      "I18N_SYNC_FAILED",
      upsertError.message,
    );
  }

  const keyStatuses = parseKeyStatuses(body.keyStatuses);
  if (keyStatuses.length > 0) {
    const now = new Date().toISOString();
    const statusPayload: Database["public"]["Tables"]["i18n_locale_key_status"]["Insert"][] = keyStatuses.map((row) => ({
      locale,
      key_path: row.keyPath,
      source_hash: row.sourceHash,
      status: row.status,
      reviewed_at: row.reviewedAt ?? null,
      updated_at: now,
    }));

    const { error: statusError } = await auth.writeClient
      .from("i18n_locale_key_status")
      .upsert(statusPayload, { onConflict: "locale,key_path" });

    if (statusError) {
      const isMissingTable = /relation .*i18n_locale_key_status.* does not exist|42P01/i.test(statusError.message);
      if (!isMissingTable) {
        return adminErrorResponse(
          500,
          "I18N_STATUS_SYNC_FAILED",
          statusError.message,
        );
      }
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      keyStatusesUpdated: keyStatuses.length,
    },
  });
}
