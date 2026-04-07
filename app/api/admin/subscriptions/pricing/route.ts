import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";
import { logAdminMutation } from "@/lib/server/admin-audit-log";
import {
  buildPricingApiErrorResponse,
  type PricingApiSuccessResponse,
} from "@/lib/subscriptions/pricing-api";

type PricingInsert = Database["public"]["Tables"]["subscription_pricing"]["Insert"];
type PricingUpdate = Database["public"]["Tables"]["subscription_pricing"]["Update"];
type PricingInsertPayload = Omit<PricingInsert, "id"> & { id?: string };
type PricingTier = "verified" | "signature";
type BillingPeriod = "monthly" | "annual" | "period";

const VALID_TIERS = new Set(["verified", "signature"]);
const VALID_BILLING_PERIODS = new Set(["monthly", "annual", "period"]);
const VALID_PERIOD_UNITS = new Set(["days", "months"]);
const RETRIABLE_PERIOD_COLUMNS = [
  "period_length",
  "period_unit",
  "period_start_date",
  "period_end_date",
] as const;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(buildPricingApiErrorResponse(code, message), { status });
}

function successResponse(id: string, action: PricingApiSuccessResponse["action"]) {
  return NextResponse.json<PricingApiSuccessResponse>({ ok: true, id, action });
}

function isMissingColumnError(error: unknown, column: string) {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";
  return (
    message.includes(`'${column}'`) &&
    (message.includes("column") || message.includes("schema cache"))
  );
}

function getRetriableMissingPeriodColumn(
  error: unknown,
  payload: Record<string, unknown>,
): (typeof RETRIABLE_PERIOD_COLUMNS)[number] | null {
  const column = RETRIABLE_PERIOD_COLUMNS.find((candidate) =>
    isMissingColumnError(error, candidate),
  );

  if (!column) return null;
  if (!(column in payload)) return null;
  return column;
}

function parseNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value;
}

function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  return value;
}

function parseNullableNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return value;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return value;
}

function parsePeriodUnit(value: unknown): "days" | "months" | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return VALID_PERIOD_UNITS.has(value) ? (value as "days" | "months") : undefined;
}

function parseTier(value: unknown): PricingTier | null {
  if (typeof value !== "string") return null;
  const tier = value.trim().toLowerCase();
  return VALID_TIERS.has(tier) ? (tier as PricingTier) : null;
}

function parseBillingPeriod(value: unknown): BillingPeriod | null {
  if (typeof value !== "string") return null;
  const period = value.trim().toLowerCase();
  return VALID_BILLING_PERIODS.has(period) ? (period as BillingPeriod) : null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
    if (maybeMessage) return maybeMessage;
  }

  return fallback;
}

function getPricingApiErrorMessage(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);

  if (message.includes("subscription_pricing_billing_period_check")) {
    return "Database schema does not support period billing yet. Apply migrations 006, 007, and 008, then retry.";
  }

  return message;
}

function buildPricingPayload(raw: Record<string, unknown>) {
  const price = parseOptionalNumber(raw.price);
  const displayPrice = parseOptionalString(raw.display_price);
  const note = parseOptionalString(raw.note);
  const periodLength = parseNullableNumber(raw.period_length);
  const periodUnit = parsePeriodUnit(raw.period_unit);
  const periodStartDate = parseNullableString(raw.period_start_date);
  const periodEndDate = parseNullableString(raw.period_end_date);
  const monthlyEquivalent = parseNullableString(raw.monthly_equivalent);
  const savings = parseNullableNumber(raw.savings);

  const payload: PricingUpdate = {};
  if (price !== undefined) payload.price = price;
  if (displayPrice !== undefined) payload.display_price = displayPrice;
  if (note !== undefined) payload.note = note;
  if (periodLength !== undefined) payload.period_length = periodLength;
  if (periodUnit !== undefined) payload.period_unit = periodUnit;
  if (periodStartDate !== undefined) payload.period_start_date = periodStartDate;
  if (periodEndDate !== undefined) payload.period_end_date = periodEndDate;
  if (monthlyEquivalent !== undefined) payload.monthly_equivalent = monthlyEquivalent;
  if (savings !== undefined) payload.savings = savings;
  return payload;
}

function buildInsertPayload(
  raw: Record<string, unknown>,
  tier: PricingTier,
  billingPeriod: BillingPeriod,
): PricingInsertPayload | null {
  const price = parseOptionalNumber(raw.price);
  const displayPrice = parseOptionalString(raw.display_price);
  const note = parseOptionalString(raw.note);

  if (price === undefined || displayPrice === undefined || note === undefined) {
    return null;
  }

  const periodLength = parseNullableNumber(raw.period_length);
  const periodUnit = parsePeriodUnit(raw.period_unit);
  const periodStartDate = parseNullableString(raw.period_start_date);
  const periodEndDate = parseNullableString(raw.period_end_date);
  const monthlyEquivalent = parseNullableString(raw.monthly_equivalent);
  const savings = parseNullableNumber(raw.savings);

  return {
    id: randomUUID(),
    tier,
    billing_period: billingPeriod,
    price,
    display_price: displayPrice,
    note,
    period_length: periodLength ?? null,
    period_unit: periodUnit ?? null,
    period_start_date: periodStartDate ?? null,
    period_end_date: periodEndDate ?? null,
    monthly_equivalent: monthlyEquivalent ?? null,
    savings: savings ?? 0,
  };
}

async function updatePricingById(
  writeClient: SupabaseClient<Database>,
  id: string,
  payload: PricingUpdate,
): Promise<string | null> {
  let nextPayload = { ...payload } as Record<string, unknown>;

  while (true) {
    const attempt = await writeClient
      .from("subscription_pricing")
      .update(nextPayload as PricingUpdate)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (!attempt.error) {
      return attempt.data?.id ?? null;
    }

    if (attempt.error.code === "PGRST116") {
      return null;
    }

    const missingColumn = getRetriableMissingPeriodColumn(attempt.error, nextPayload);
    if (!missingColumn) {
      throw attempt.error;
    }

    const { [missingColumn]: _removed, ...fallbackPayload } = nextPayload;
    nextPayload = fallbackPayload;
  }
}

async function findPricingIdByTierAndBilling(
  writeClient: SupabaseClient<Database>,
  tier: PricingTier,
  billingPeriod: BillingPeriod,
): Promise<string | null> {
  const { data, error } = await writeClient
    .from("subscription_pricing")
    .select("id")
    .eq("tier", tier)
    .eq("billing_period", billingPeriod)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data?.id ?? null;
}

async function insertPricing(
  writeClient: SupabaseClient<Database>,
  payload: PricingInsertPayload,
): Promise<string> {
  let nextPayload = { ...payload } as Record<string, unknown>;

  while (true) {
    const attempt = await writeClient
      .from("subscription_pricing")
      .insert(nextPayload as PricingInsert)
      .select("id")
      .single();

    if (!attempt.error) {
      return attempt.data.id;
    }

    const missingColumn = getRetriableMissingPeriodColumn(attempt.error, nextPayload);
    if (!missingColumn) {
      throw attempt.error;
    }

    const { [missingColumn]: _removed, ...fallbackPayload } = nextPayload;
    nextPayload = fallbackPayload;
  }
}

export async function PATCH(request: NextRequest) {
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse(400, "INVALID_JSON", "Invalid JSON payload.");
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const tier = parseTier(body.tier);
  const billingPeriod = parseBillingPeriod(body.billing_period);

  const payload = buildPricingPayload(body);
  if (Object.keys(payload).length === 0) {
    return errorResponse(400, "EMPTY_UPDATE", "No pricing fields provided.");
  }

  if (!id && (!tier || !billingPeriod)) {
    return errorResponse(
      400,
      "MISSING_SELECTOR",
      "Provide either a valid pricing id or tier + billing_period.",
    );
  }

  try {
    if (id) {
      const updatedId = await updatePricingById(auth.writeClient, id, payload);
      if (updatedId) {
        logAdminMutation({
          userId: auth.userId,
          action: "admin.subscription-pricing.update",
          payload: {
            pricingId: updatedId,
            tier: tier ?? null,
            billingPeriod: billingPeriod ?? null,
            mode: "by-id",
          },
        });
        return successResponse(updatedId, "updated");
      }
    }

    if (tier && billingPeriod) {
      const existingId = await findPricingIdByTierAndBilling(auth.writeClient, tier, billingPeriod);
      if (existingId) {
        const updatedId = await updatePricingById(auth.writeClient, existingId, payload);
        if (updatedId) {
          logAdminMutation({
            userId: auth.userId,
            action: "admin.subscription-pricing.update",
            payload: {
              pricingId: updatedId,
              tier,
              billingPeriod,
              mode: "by-tier-billing",
            },
          });
          return successResponse(updatedId, "updated");
        }
      }

      const insertPayload = buildInsertPayload(body, tier, billingPeriod);
      if (!insertPayload) {
        return errorResponse(
          400,
          "MISSING_REQUIRED_FIELDS",
          "Missing required pricing fields for create fallback.",
        );
      }

      const createdId = await insertPricing(auth.writeClient, insertPayload);
      logAdminMutation({
        userId: auth.userId,
        action: "admin.subscription-pricing.create",
        payload: {
          pricingId: createdId,
          tier,
          billingPeriod,
        },
      });
      return successResponse(createdId, "created");
    }

    return errorResponse(404, "PRICING_NOT_FOUND", "Invalid pricing id.");
  } catch (error) {
    const details = getPricingApiErrorMessage(error, "Failed to save pricing.");
    return errorResponse(400, "PRICING_SAVE_FAILED", `Failed to save pricing: ${details}`);
  }
}

export async function POST(request: NextRequest) {
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse(400, "INVALID_JSON", "Invalid JSON payload.");
  }

  const tier = parseTier(body.tier);
  const billingPeriod = parseBillingPeriod(body.billing_period);

  if (!tier) {
    return errorResponse(400, "INVALID_TIER", "Invalid tier.");
  }

  if (!billingPeriod) {
    return errorResponse(400, "INVALID_BILLING_PERIOD", "Invalid billing period.");
  }

  const insertPayload = buildInsertPayload(body, tier, billingPeriod);
  if (!insertPayload) {
    return errorResponse(400, "MISSING_REQUIRED_FIELDS", "Missing required pricing fields.");
  }

  try {
    const existingId = await findPricingIdByTierAndBilling(auth.writeClient, tier, billingPeriod);

    if (existingId) {
      const updatedPayload = buildPricingPayload(body);
      const updatedId = await updatePricingById(auth.writeClient, existingId, updatedPayload);
      if (updatedId) {
        logAdminMutation({
          userId: auth.userId,
          action: "admin.subscription-pricing.update",
          payload: {
            pricingId: updatedId,
            tier,
            billingPeriod,
            mode: "upsert-existing",
          },
        });
        return successResponse(updatedId, "updated");
      }
    }

    const createdId = await insertPricing(auth.writeClient, insertPayload);
    logAdminMutation({
      userId: auth.userId,
      action: "admin.subscription-pricing.create",
      payload: {
        pricingId: createdId,
        tier,
        billingPeriod,
      },
    });
    return successResponse(createdId, "created");
  } catch (error) {
    const details = getPricingApiErrorMessage(error, "Failed to save pricing.");
    return errorResponse(400, "PRICING_SAVE_FAILED", `Failed to save pricing: ${details}`);
  }
}
