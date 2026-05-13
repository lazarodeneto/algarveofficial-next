import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/server/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

interface SchemaCheck {
  key: string;
  label: string;
  ready: boolean;
  message: string;
}

function errorMessage(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return null;
  return [error.code, error.message].filter(Boolean).join(": ");
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request, ["admin", "editor"]);
  if ("error" in auth) return auth.error;

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return NextResponse.json({
      ok: true,
      data: {
        ready: false,
        checks: [
          {
            key: "service-role",
            label: "Supabase service-role client",
            ready: false,
            message: "SUPABASE_SERVICE_ROLE_KEY is required for schema health checks.",
          },
        ] satisfies SchemaCheck[],
      },
    });
  }

  const [keyStatus, inboxStatus] = await Promise.all([
    serviceClient
      .from("i18n_locale_key_status" as never)
      .select("locale,key_path,source_hash,status,reviewed_at,updated_at")
      .limit(1),
    serviceClient
      .from("admin_inbox_archives" as never)
      .select("source,source_row_id,status,item_snapshot,updated_at,resolved_at,dismissed_at")
      .limit(1),
  ]);

  const checks: SchemaCheck[] = [
    {
      key: "i18n-locale-key-status",
      label: "UI key status metadata table",
      ready: !keyStatus.error,
      message: keyStatus.error
        ? `Apply migration 20260513120000_add_i18n_locale_key_status.sql. ${errorMessage(keyStatus.error)}`
        : "Ready.",
    },
    {
      key: "admin-inbox-status-history",
      label: "Admin Inbox status history columns",
      ready: !inboxStatus.error,
      message: inboxStatus.error
        ? `Apply migration 20260513133000_add_admin_inbox_status_history.sql. ${errorMessage(inboxStatus.error)}`
        : "Ready.",
    },
  ];

  return NextResponse.json({
    ok: true,
    data: {
      ready: checks.every((check) => check.ready),
      checks,
    },
  });
}
