import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service";

type UserRole = Database["public"]["Enums"]["app_role"];
type PricingInsert = Database["public"]["Tables"]["subscription_pricing"]["Insert"];
type PricingUpdate = Database["public"]["Tables"]["subscription_pricing"]["Update"];
type PricingInsertPayload = Omit<PricingInsert, "id"> & { id?: string };

const VALID_TIERS = new Set(["verified", "signature"]);
const VALID_BILLING_PERIODS = new Set(["monthly", "annual", "period"]);
const VALID_PERIOD_UNITS = new Set(["days", "months"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

async function requireAdminServiceClient(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }) };
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return {
      error: NextResponse.json(
        { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY for admin writes." },
        { status: 500 },
      ),
    };
  }

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
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const { data: requesterRole, error: roleError } = await userClient.rpc("get_user_role", {
    _user_id: userData.user.id,
  });

  if (roleError) {
    return {
      error: NextResponse.json(
        { error: roleError.message || "Failed to verify user role." },
        { status: 403 },
      ),
    };
  }

  if ((requesterRole as UserRole) !== "admin") {
    return { error: NextResponse.json({ error: "Only admins can update subscription pricing." }, { status: 403 }) };
  }

  return { serviceClient };
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

function shouldRetryWithoutPeriodDates(error: unknown) {
  return (
    isMissingColumnError(error, "period_start_date") ||
    isMissingColumnError(error, "period_end_date")
  );
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

async function updatePricing(
  serviceClient: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  id: string,
  payload: PricingUpdate,
) {
  const firstAttempt = await serviceClient
    .from("subscription_pricing")
    .update(payload)
    .eq("id", id);

  if (!firstAttempt.error) return;
  if (!shouldRetryWithoutPeriodDates(firstAttempt.error)) {
    throw firstAttempt.error;
  }

  const { period_start_date: _startDate, period_end_date: _endDate, ...fallbackPayload } = payload;
  const retryAttempt = await serviceClient
    .from("subscription_pricing")
    .update(fallbackPayload)
    .eq("id", id);

  if (retryAttempt.error) throw retryAttempt.error;
}

async function insertPricing(
  serviceClient: NonNullable<ReturnType<typeof createServiceRoleClient>>,
  payload: PricingInsertPayload,
) {
  const firstAttempt = await serviceClient
    .from("subscription_pricing")
    .insert(payload as PricingInsert);

  if (!firstAttempt.error) return;
  if (!shouldRetryWithoutPeriodDates(firstAttempt.error)) {
    throw firstAttempt.error;
  }

  const { period_start_date: _startDate, period_end_date: _endDate, ...fallbackPayload } = payload;
  const retryAttempt = await serviceClient
    .from("subscription_pricing")
    .insert(fallbackPayload as PricingInsert);

  if (retryAttempt.error) throw retryAttempt.error;
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminServiceClient(request);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid pricing id." }, { status: 400 });
  }

  const payload = buildPricingPayload(body);
  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No pricing fields provided." }, { status: 400 });
  }

  try {
    await updatePricing(auth.serviceClient, id, payload);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update pricing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminServiceClient(request);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const tier = typeof body.tier === "string" ? body.tier : "";
  const billingPeriod = typeof body.billing_period === "string" ? body.billing_period : "";
  const price = parseOptionalNumber(body.price);
  const displayPrice = parseOptionalString(body.display_price);
  const note = parseOptionalString(body.note);
  const periodLength = parseNullableNumber(body.period_length);
  const periodUnit = parsePeriodUnit(body.period_unit);
  const periodStartDate = parseNullableString(body.period_start_date);
  const periodEndDate = parseNullableString(body.period_end_date);
  const monthlyEquivalent = parseNullableString(body.monthly_equivalent);
  const savings = parseNullableNumber(body.savings);

  if (!VALID_TIERS.has(tier)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }
  if (!VALID_BILLING_PERIODS.has(billingPeriod)) {
    return NextResponse.json({ error: "Invalid billing period." }, { status: 400 });
  }
  if (price === undefined || displayPrice === undefined || note === undefined) {
    return NextResponse.json({ error: "Missing required pricing fields." }, { status: 400 });
  }

  try {
    const { data: existing, error: existingError } = await auth.serviceClient
      .from("subscription_pricing")
      .select("id")
      .eq("tier", tier)
      .eq("billing_period", billingPeriod)
      .limit(1);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, existed: true, id: existing[0].id });
    }

    const payload: PricingInsertPayload = {
      tier: tier as PricingInsert["tier"],
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

    await insertPricing(auth.serviceClient, payload);
    return NextResponse.json({ ok: true, existed: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create pricing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
