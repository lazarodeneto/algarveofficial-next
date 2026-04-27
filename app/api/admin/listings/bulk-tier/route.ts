import { NextRequest, NextResponse } from "next/server";

import type { Database, TablesUpdate } from "@/integrations/supabase/types";
import { adminErrorResponse, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";
import { bulkTierUpdateSchema } from "@/lib/forms/admin-schemas";

const VALID_TIERS = new Set(["unverified", "verified", "signature"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface BulkTierBody {
  ids?: unknown;
  tier?: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(request, "Only admins can update listing tiers.");
  if ("error" in auth) return auth.error;

  let body: BulkTierBody;
  try {
    body = await request.json() as BulkTierBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validatePayload(bulkTierUpdateSchema, body, "BULK_TIER");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
  }

  const ids = Array.isArray(body.ids)
    ? body.ids.filter((value): value is string => typeof value === "string")
    : [];
  const tier = typeof body.tier === "string" ? body.tier : "";

  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "No listing ids provided." }, { status: 400 });
  }
  if (!ids.every((id) => UUID_PATTERN.test(id))) {
    return NextResponse.json({ ok: false, error: "Invalid listing ids." }, { status: 400 });
  }
  if (!VALID_TIERS.has(tier)) {
    return NextResponse.json({ ok: false, error: "Invalid tier value." }, { status: 400 });
  }

  const { error } = await auth.writeClient
    .from("listings")
    .update({ tier: tier as TablesUpdate<"listings">["tier"] })
    .in("id", ids);

  if (error) {
    return adminErrorResponse(400, "BULK_TIER_UPDATE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, updated: ids.length, tier });
}
