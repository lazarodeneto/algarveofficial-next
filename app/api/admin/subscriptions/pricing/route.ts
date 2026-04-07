import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import {
  normalizePricingBillingPeriod,
  normalizePricingTier,
  type PaidPricingTier,
  type PricingBillingPeriod,
} from "@/lib/pricing/pricing-resolver";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import {
  buildPricingApiErrorResponse,
  type PricingApiSuccessResponse,
} from "@/lib/subscriptions/pricing-api";

type PricingInsert = Database["public"]["Tables"]["subscription_pricing"]["Insert"];
type PricingUpdate = Database["public"]["Tables"]["subscription_pricing"]["Update"];

type PricingPayload = {
  price_cents?: number;
  display_price?: string;
  note?: string;
  stripe_price_id?: string | null;
  currency?: string;
  valid_from?: string | null;
  valid_to?: string | null;
  is_active?: boolean;
  monthly_equivalent?: string | null;
  savings?: number | null;
};

const VALID_TIERS = new Set(["verified", "signature"]);

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(buildPricingApiErrorResponse(code, message), { status });
}

function successResponse(id: string, action: PricingApiSuccessResponse["action"]) {
  return NextResponse.json<PricingApiSuccessResponse>({ ok: true, id, action });
}

function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  return value.trim();
}

function parseNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value.trim();
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return value;
}

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "boolean") return undefined;
  return value;
}

function parseCurrency(value: unknown): string | undefined {
  const raw = parseOptionalString(value);
  if (!raw) return undefined;
  return raw.toUpperCase();
}

function parseDateOnlyString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
}

function parseTier(value: unknown): PaidPricingTier | null {
  const normalized = normalizePricingTier(
    typeof value === "string" ? value.trim().toLowerCase() : null,
  );
  if (!normalized || normalized === "unverified") return null;
  return VALID_TIERS.has(normalized) ? normalized : null;
}

function parseBillingPeriod(value: unknown): PricingBillingPeriod | null {
  if (typeof value !== "string") return null;
  return normalizePricingBillingPeriod(value.trim().toLowerCase());
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    if (message) return message;
  }
  return fallback;
}

function toLegacyPriceMirror(priceCents: number) {
  return priceCents;
}

function buildPricingPayload(raw: Record<string, unknown>): PricingPayload {
  const priceCents = parseOptionalNumber(raw.price_cents) ?? parseOptionalNumber(raw.price);
  const payload: PricingPayload = {};

  if (priceCents !== undefined) payload.price_cents = priceCents;

  const displayPrice = parseOptionalString(raw.display_price);
  if (displayPrice !== undefined) payload.display_price = displayPrice;

  const note = parseOptionalString(raw.note);
  if (note !== undefined) payload.note = note;

  const stripePriceId = parseNullableString(raw.stripe_price_id);
  if (stripePriceId !== undefined) payload.stripe_price_id = stripePriceId || null;

  const currency = parseCurrency(raw.currency);
  if (currency !== undefined) payload.currency = currency;

  const validFrom = parseDateOnlyString(raw.valid_from) ?? parseDateOnlyString(raw.period_start_date);
  if (validFrom !== undefined) payload.valid_from = validFrom;

  const validTo = parseDateOnlyString(raw.valid_to) ?? parseDateOnlyString(raw.period_end_date);
  if (validTo !== undefined) payload.valid_to = validTo;

  const isActive = parseOptionalBoolean(raw.is_active);
  if (isActive !== undefined) payload.is_active = isActive;

  const monthlyEquivalent = parseNullableString(raw.monthly_equivalent);
  if (monthlyEquivalent !== undefined) payload.monthly_equivalent = monthlyEquivalent;

  const savings = parseOptionalNumber(raw.savings);
  if (savings !== undefined) payload.savings = savings;

  return payload;
}

function buildInsertPayload(
  raw: Record<string, unknown>,
  tier: PaidPricingTier,
  billingPeriod: PricingBillingPeriod,
): PricingInsert | null {
  const payload = buildPricingPayload(raw);
  if (
    payload.price_cents === undefined ||
    payload.display_price === undefined ||
    payload.note === undefined
  ) {
    return null;
  }

  return {
    id: randomUUID(),
    tier,
    billing_period: billingPeriod,
    price: toLegacyPriceMirror(payload.price_cents),
    price_cents: payload.price_cents,
    display_price: payload.display_price,
    note: payload.note,
    stripe_price_id: payload.stripe_price_id ?? null,
    currency: payload.currency ?? "EUR",
    valid_from: payload.valid_from ?? null,
    valid_to: payload.valid_to ?? null,
    is_active: payload.is_active ?? true,
    monthly_equivalent: payload.monthly_equivalent ?? null,
    savings: payload.savings ?? 0,
    period_length: null,
    period_unit: null,
    period_start_date: payload.valid_from ?? null,
    period_end_date: payload.valid_to ?? null,
  };
}

function buildDatabaseUpdatePayload(payload: PricingPayload): PricingUpdate {
  const nextPayload: PricingUpdate = {};

  if (payload.price_cents !== undefined) {
    nextPayload.price_cents = payload.price_cents;
    nextPayload.price = toLegacyPriceMirror(payload.price_cents);
  }
  if (payload.display_price !== undefined) nextPayload.display_price = payload.display_price;
  if (payload.note !== undefined) nextPayload.note = payload.note;
  if (payload.stripe_price_id !== undefined) nextPayload.stripe_price_id = payload.stripe_price_id;
  if (payload.currency !== undefined) nextPayload.currency = payload.currency;
  if (payload.valid_from !== undefined) {
    nextPayload.valid_from = payload.valid_from;
    nextPayload.period_start_date = payload.valid_from;
  }
  if (payload.valid_to !== undefined) {
    nextPayload.valid_to = payload.valid_to;
    nextPayload.period_end_date = payload.valid_to;
  }
  if (payload.is_active !== undefined) nextPayload.is_active = payload.is_active;
  if (payload.monthly_equivalent !== undefined) nextPayload.monthly_equivalent = payload.monthly_equivalent;
  if (payload.savings !== undefined) nextPayload.savings = payload.savings;

  return nextPayload;
}

function validatePayload(
  tier: PaidPricingTier,
  billingPeriod: PricingBillingPeriod,
  payload: PricingPayload,
) {
  if (payload.price_cents !== undefined && payload.price_cents <= 0) {
    return "Price must be greater than 0 for paid tiers.";
  }

  if (
    payload.stripe_price_id !== undefined &&
    payload.stripe_price_id !== null &&
    payload.stripe_price_id !== "" &&
    !/^price_[a-zA-Z0-9]+$/.test(payload.stripe_price_id)
  ) {
    return "stripe_price_id must start with 'price_'.";
  }

  if (payload.currency !== undefined && payload.currency !== "EUR") {
    return "Currency must be EUR.";
  }

  const validFrom = payload.valid_from;
  const validTo = payload.valid_to;

  if (billingPeriod === "promo") {
    if (!validFrom || !validTo) {
      return "Promo pricing requires valid_from and valid_to.";
    }
    if (validFrom > validTo) {
      return "valid_from must be earlier than valid_to.";
    }
  } else if (
    (validFrom !== undefined && validFrom !== null) ||
    (validTo !== undefined && validTo !== null)
  ) {
    return `${billingPeriod} pricing cannot define promo validity dates.`;
  }

  if (!VALID_TIERS.has(tier)) {
    return "Invalid tier.";
  }

  return null;
}

function overlaps(leftStart: string, leftEnd: string, rightStart: string, rightEnd: string) {
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

async function assertNoOverlappingPromo(
  writeClient: SupabaseClient<Database>,
  args: {
    tier: PaidPricingTier;
    validFrom: string;
    validTo: string;
    pricingId?: string;
  },
) {
  const { data, error } = await writeClient
    .from("subscription_pricing")
    .select("id, billing_period, valid_from, valid_to")
    .eq("tier", args.tier);

  if (error) throw error;

  const conflictingPromo = (data ?? []).find((row) => {
    if (row.id === args.pricingId) return false;
    if (normalizePricingBillingPeriod(row.billing_period) !== "promo") return false;
    if (!row.valid_from || !row.valid_to) return false;
    return overlaps(args.validFrom, args.validTo, row.valid_from, row.valid_to);
  });

  if (conflictingPromo) {
    throw new Error("Promo date range overlaps an existing promo period for this tier.");
  }
}

async function updatePricingById(
  writeClient: SupabaseClient<Database>,
  id: string,
  payload: PricingUpdate,
) {
  const { data, error } = await writeClient
    .from("subscription_pricing")
    .update(payload)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data?.id ?? null;
}

async function insertPricing(
  writeClient: SupabaseClient<Database>,
  payload: PricingInsert,
) {
  const { data, error } = await writeClient
    .from("subscription_pricing")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function findPricingIdByTierAndBilling(
  writeClient: SupabaseClient<Database>,
  tier: PaidPricingTier,
  billingPeriod: PricingBillingPeriod,
) {
  const { data, error } = await writeClient
    .from("subscription_pricing")
    .select("id")
    .eq("tier", tier)
    .eq("billing_period", billingPeriod)
    .order("created_at", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data?.id ?? null;
}

async function findPricingRowById(
  writeClient: SupabaseClient<Database>,
  id: string,
) {
  const { data, error } = await writeClient
    .from("subscription_pricing")
    .select("id, is_active, stripe_price_id")
    .eq("id", id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

async function resolveTargetId(
  writeClient: SupabaseClient<Database>,
  id: string,
  tier: PaidPricingTier | null,
  billingPeriod: PricingBillingPeriod | null,
) {
  if (id) return id;
  if (!tier || !billingPeriod) return null;
  return findPricingIdByTierAndBilling(writeClient, tier, billingPeriod);
}

async function parseRequestBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function handleSave(request: NextRequest, method: "POST" | "PATCH") {
  const auth = await requireAdminWriteClient(
    request,
    "Only admins can update subscription pricing.",
    {
      requireServiceRole: true,
      missingServiceRoleMessage:
        "Server is missing SUPABASE_SERVICE_ROLE_KEY for subscription pricing admin writes.",
    },
  );
  if ("error" in auth) return auth.error;

  const body = await parseRequestBody(request);
  if (!body) {
    return errorResponse(400, "INVALID_JSON", "Invalid JSON payload.");
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const tier = parseTier(body.tier);
  const billingPeriod = parseBillingPeriod(body.billing_period);

  if (!tier) {
    return errorResponse(400, "INVALID_TIER", "Invalid tier.");
  }

  if (!billingPeriod) {
    return errorResponse(400, "INVALID_BILLING_PERIOD", "Invalid billing period.");
  }

  const payload = buildPricingPayload(body);
  const validationError = validatePayload(tier, billingPeriod, payload);
  if (validationError) {
    return errorResponse(400, "INVALID_PRICING_PAYLOAD", validationError);
  }

  if (Object.keys(payload).length === 0) {
    return errorResponse(400, "EMPTY_UPDATE", "No pricing fields provided.");
  }

  if (billingPeriod === "promo" && payload.valid_from && payload.valid_to) {
    try {
      await assertNoOverlappingPromo(auth.writeClient, {
        tier,
        validFrom: payload.valid_from,
        validTo: payload.valid_to,
        pricingId: id || undefined,
      });
    } catch (validationFailure) {
      const message = getErrorMessage(validationFailure, "Promo period overlaps an existing promo.");
      return errorResponse(400, "PROMO_OVERLAP", message);
    }
  }

  try {
    const targetId = await resolveTargetId(auth.writeClient, id, tier, billingPeriod);
    const existingRow = targetId
      ? await findPricingRowById(auth.writeClient, targetId)
      : null;

    const effectiveStripePriceId =
      payload.stripe_price_id !== undefined
        ? payload.stripe_price_id
        : existingRow?.stripe_price_id ?? null;
    const effectiveIsActive =
      payload.is_active !== undefined
        ? payload.is_active
        : existingRow?.is_active ?? true;

    if (effectiveIsActive && !effectiveStripePriceId) {
      return errorResponse(
        400,
        "STRIPE_MAPPING_REQUIRED",
        "Active paid pricing requires stripe_price_id.",
      );
    }

    const databasePayload = buildDatabaseUpdatePayload(payload);

    if (targetId) {
      const updatedId = await updatePricingById(auth.writeClient, targetId, databasePayload);
      if (updatedId) {
        logAdminMutation({
          userId: auth.userId,
          action: "admin.subscription-pricing.update",
          payload: {
            pricingId: updatedId,
            tier,
            billingPeriod,
            method,
          },
        });
        return successResponse(updatedId, "updated");
      }
    }

    const insertPayload = buildInsertPayload(body, tier, billingPeriod);
    if (!insertPayload) {
      return errorResponse(400, "MISSING_REQUIRED_FIELDS", "Missing required pricing fields.");
    }

    const createdId = await insertPricing(auth.writeClient, insertPayload);
    logAdminMutation({
      userId: auth.userId,
      action: "admin.subscription-pricing.create",
      payload: {
        pricingId: createdId,
        tier,
        billingPeriod,
        method,
      },
    });
    return successResponse(createdId, "created");
  } catch (error) {
    const details = getErrorMessage(error, "Failed to save pricing.");
    return errorResponse(400, "PRICING_SAVE_FAILED", `Failed to save pricing: ${details}`);
  }
}

export async function PATCH(request: NextRequest) {
  return handleSave(request, "PATCH");
}

export async function POST(request: NextRequest) {
  return handleSave(request, "POST");
}
