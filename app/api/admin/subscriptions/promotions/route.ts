import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { validatePayload, jsonErrorResponse } from "@/lib/api/api-validation";

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

const applicableTierSchema = z.enum(["verified", "signature"]);
const applicableBillingSchema = z.enum(["monthly", "annual", "yearly", "period", "promo"]);

const promotionBaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required").max(50),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().finite().positive("Discount value must be greater than 0"),
  applicable_tiers: z.array(applicableTierSchema).min(1, "At least one tier is required"),
  applicable_billing: z.array(applicableBillingSchema).min(1, "At least one billing period is required"),
  start_date: z.string().trim().min(1, "Start date is required"),
  end_date: z.string().trim().min(1, "End date is required"),
  is_active: z.boolean().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  period_length: z.number().int().positive().nullable().optional(),
  period_unit: z.enum(["days", "months"]).nullable().optional(),
});

function validatePromotionShape(
  payload: {
    discount_type?: "percentage" | "fixed";
    discount_value?: number;
    start_date?: string;
    end_date?: string;
    applicable_billing?: string[];
    period_length?: number | null;
    period_unit?: "days" | "months" | null;
  },
  ctx: z.RefinementCtx,
) {
  if (payload.discount_type === "percentage" && typeof payload.discount_value === "number" && payload.discount_value > 100) {
    ctx.addIssue({
      code: "custom",
      path: ["discount_value"],
      message: "Percentage discount cannot exceed 100.",
    });
  }

  if (payload.start_date && payload.end_date) {
    const start = new Date(payload.start_date);
    const end = new Date(payload.end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "Promotion dates must be valid dates.",
      });
    } else if (start > end) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "End date must be after start date.",
      });
    }
  }

  if (
    payload.applicable_billing?.some((period) => period === "period" || period === "promo") &&
    (!payload.period_length || !payload.period_unit)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["period_length"],
      message: "Period promotions require a period length and unit.",
    });
  }
}

const promotionCreateSchema = promotionBaseSchema.superRefine(validatePromotionShape);
const promotionPatchSchema = promotionBaseSchema
  .partial()
  .extend({ id: z.string().trim().min(1, "Promotion id is required") })
  .superRefine(validatePromotionShape);

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

  const validation = validatePayload(promotionCreateSchema, body, "PROMOTION");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
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

  const validation = validatePayload(promotionPatchSchema, body, "PROMOTION");
  if (!validation.success) {
    return jsonErrorResponse(400, validation.error.code, validation.error.message);
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
