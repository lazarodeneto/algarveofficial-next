import { NextRequest, NextResponse } from "next/server";

import { requireAdminWriteClient } from "@/lib/server/admin-auth";

interface PromotionPayload {
  id?: string;
  name?: string;
  code?: string;
  discount_type?: "percentage" | "fixed";
  discount_value?: number;
  applicable_tiers?: string[];
  applicable_billing?: string[];
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  max_uses?: number | null;
  period_length?: number | null;
  period_unit?: "days" | "months" | null;
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function normalizePayload(raw: unknown): PromotionPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;

  const payload: PromotionPayload = {};
  if (typeof body.id === "string") payload.id = body.id.trim();
  if (typeof body.name === "string") payload.name = body.name.trim();
  if (typeof body.code === "string") payload.code = body.code.trim().toUpperCase();
  if (body.discount_type === "percentage" || body.discount_type === "fixed") {
    payload.discount_type = body.discount_type;
  }
  if (typeof body.discount_value === "number" && Number.isFinite(body.discount_value)) {
    payload.discount_value = body.discount_value;
  }
  if (Array.isArray(body.applicable_tiers)) {
    payload.applicable_tiers = body.applicable_tiers.filter(
      (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
    );
  }
  if (Array.isArray(body.applicable_billing)) {
    payload.applicable_billing = body.applicable_billing.filter(
      (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
    );
  }
  if (typeof body.start_date === "string") payload.start_date = body.start_date;
  if (typeof body.end_date === "string") payload.end_date = body.end_date;
  if (typeof body.is_active === "boolean") payload.is_active = body.is_active;
  if (body.max_uses === null || (typeof body.max_uses === "number" && Number.isFinite(body.max_uses))) {
    payload.max_uses = body.max_uses as number | null;
  }
  if (
    body.period_length === null ||
    (typeof body.period_length === "number" && Number.isFinite(body.period_length))
  ) {
    payload.period_length = body.period_length as number | null;
  }
  if (body.period_unit === "days" || body.period_unit === "months" || body.period_unit === null) {
    payload.period_unit = body.period_unit;
  }

  return payload;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can create promotional codes.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin promotion writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = normalizePayload(body);
  if (!payload) {
    return errorResponse(400, "INVALID_PAYLOAD", "Invalid promotion payload.");
  }

  if (
    !payload.name ||
    !payload.code ||
    !payload.discount_type ||
    payload.discount_value === undefined ||
    !payload.applicable_tiers?.length ||
    !payload.applicable_billing?.length ||
    !payload.start_date ||
    !payload.end_date
  ) {
    return errorResponse(400, "INVALID_PROMOTION", "Missing required promotion fields.");
  }

  const { error } = await auth.writeClient.from("promotional_codes").insert({
    name: payload.name,
    code: payload.code,
    discount_type: payload.discount_type,
    discount_value: payload.discount_value,
    applicable_tiers: payload.applicable_tiers,
    applicable_billing: payload.applicable_billing,
    start_date: payload.start_date,
    end_date: payload.end_date,
    is_active: payload.is_active ?? true,
    max_uses: payload.max_uses ?? null,
    period_length: payload.period_length ?? null,
    period_unit: payload.period_unit ?? null,
  });

  if (error) {
    return errorResponse(
      500,
      "PROMOTION_CREATE_FAILED",
      error.message || "Failed to create promotional code.",
    );
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update promotional codes.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin promotion writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const payload = normalizePayload(body);
  if (!payload?.id) {
    return errorResponse(400, "INVALID_PROMOTION_ID", "Promotion id is required.");
  }

  const { id, ...updates } = payload;
  const { error } = await auth.writeClient
    .from("promotional_codes")
    .update(updates)
    .eq("id", id);

  if (error) {
    return errorResponse(
      500,
      "PROMOTION_UPDATE_FAILED",
      error.message || "Failed to update promotional code.",
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can delete promotional codes.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin promotion writes.",
    },
  );
  if ("error" in auth) return auth.error;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const id = typeof (body as { id?: unknown })?.id === "string"
    ? ((body as { id: string }).id.trim())
    : "";

  if (!id) {
    return errorResponse(400, "INVALID_PROMOTION_ID", "Promotion id is required.");
  }

  const { error } = await auth.writeClient
    .from("promotional_codes")
    .delete()
    .eq("id", id);

  if (error) {
    return errorResponse(
      500,
      "PROMOTION_DELETE_FAILED",
      error.message || "Failed to delete promotional code.",
    );
  }

  return NextResponse.json({ ok: true });
}
