import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/integrations/supabase/types";
import en from "@/i18n/locales/en.json";
import { enforcePremiumInLocaleData } from "@/lib/i18n/premiumGuard";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";

const ALLOWED_LOCALES = new Set(["pt", "de", "fr", "es", "it", "nl", "sv", "no", "da"]);

interface SyncLocaleBody {
  locale?: unknown;
  data?: unknown;
  keyCount?: unknown;
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
      en as Record<string, unknown>,
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

  return NextResponse.json({ ok: true });
}
