import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import en from "@/i18n/locales/en.json";
import { enforcePremiumInLocaleData } from "@/lib/i18n/premiumGuard";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

const ALLOWED_LOCALES = new Set(["pt", "de", "fr", "es", "it", "nl", "sv", "no", "da"]);

interface SyncLocaleBody {
  locale?: unknown;
  data?: unknown;
  keyCount?: unknown;
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
  }

  let body: SyncLocaleBody;
  try {
    body = (await request.json()) as SyncLocaleBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const locale = typeof body.locale === "string" ? body.locale.trim().toLowerCase() : "";
  if (!ALLOWED_LOCALES.has(locale)) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  if (!isObject(body.data)) {
    return NextResponse.json({ error: "Invalid locale data payload." }, { status: 400 });
  }

  const keyCount = typeof body.keyCount === "number" && Number.isFinite(body.keyCount)
    ? Math.max(0, Math.floor(body.keyCount))
    : null;

  const { url, anonKey } = getSupabasePublicEnv();
  const userClient = createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: role, error: roleError } = await userClient.rpc("get_user_role", {
    _user_id: userData.user.id,
  });

  if (roleError) {
    return NextResponse.json(
      { error: roleError.message ?? "Failed to verify user role." },
      { status: 403 },
    );
  }

  if (role !== "admin" && role !== "editor") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const serviceClient = createServiceRoleClient();
  const writer = serviceClient ?? userClient;
  const sanitizedLocaleData = enforcePremiumInLocaleData(
    body.data as Record<string, unknown>,
    en as Record<string, unknown>,
  );
  const payload: Database["public"]["Tables"]["i18n_locale_data"]["Insert"] = {
    locale,
    data: sanitizedLocaleData as Database["public"]["Tables"]["i18n_locale_data"]["Insert"]["data"],
    key_count: keyCount ?? 0,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await writer
    .from("i18n_locale_data")
    .upsert(payload, { onConflict: "locale" });

  if (upsertError) {
    const isPermissionError = /row-level security|permission denied|42501/i.test(upsertError.message);
    return NextResponse.json(
      {
        error: upsertError.message,
        hint: serviceClient
          ? undefined
          : "Set SUPABASE_SERVICE_ROLE_KEY in server env, or add admin/editor upsert policy on i18n_locale_data.",
      },
      { status: isPermissionError ? 403 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
