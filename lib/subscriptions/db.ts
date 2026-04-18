// owner_subscriptions DB helpers. All writes go through here so we have a
// consistent shape and a single place to evolve the schema. Reads are kept
// thin — handlers compose them as needed.
//
// Note: Supabase generated types lag behind migration 013, so we cast to a
// loose record for inserts/updates and re-narrow at the boundary via SubscriptionRow.

import { randomUUID } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import { resolveEffectiveTier } from "./access";
import type { EffectiveTier, PlanType, SubscriptionRow, SubscriptionStatus } from "./types";

type Supabase = SupabaseClient<Database>;

export type SubscriptionUpdate = Partial<
  Omit<SubscriptionRow, "id" | "owner_id" | "created_at" | "updated_at">
>;

function rowAs(row: unknown): SubscriptionRow | null {
  if (!row || typeof row !== "object") return null;
  return row as SubscriptionRow;
}

export async function findByOwner(
  supabase: Supabase,
  ownerId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return rowAs(data);
}

export async function findByStripeSub(
  supabase: Supabase,
  stripeSubscriptionId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return rowAs(data);
}

export async function findByCustomer(
  supabase: Supabase,
  stripeCustomerId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return rowAs(data);
}

export async function findByCheckoutSession(
  supabase: Supabase,
  sessionId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("owner_subscriptions")
    .select("*")
    .eq("stripe_checkout_session_id" as never, sessionId as never)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return rowAs(data);
}

// Upsert keyed on owner_id (single-row-per-owner invariant enforced by uniq index).
// Pass `eventCreatedAt` to enable stale-event guarding: writes are skipped if the
// existing row's last_event_at is newer than the incoming event timestamp.
export async function upsertSubscription(
  supabase: Supabase,
  ownerId: string,
  payload: SubscriptionUpdate,
  options: { eventCreatedAt?: number | null; allowStale?: boolean } = {},
): Promise<{ id: string; skipped: boolean }> {
  const existing = await findByOwner(supabase, ownerId);
  const guardedPayload: SubscriptionUpdate = { ...payload };

  // Critical dual-authority guard:
  // if admin override is active, Stripe/system writers may update bookkeeping
  // fields (status/period IDs) but never the effective tier authority/value.
  if (existing?.tier_source === "admin") {
    delete guardedPayload.tier;
    guardedPayload.tier_source = "admin";
  }

  if (existing && options.eventCreatedAt && !options.allowStale) {
    const incomingMs = options.eventCreatedAt * 1000;
    const lastMs = existing.last_event_at ? Date.parse(existing.last_event_at) : 0;
    if (lastMs && incomingMs < lastMs) {
      return { id: existing.id, skipped: true };
    }
  }

  const nowIso = new Date().toISOString();
  const lastEventIso = options.eventCreatedAt
    ? new Date(options.eventCreatedAt * 1000).toISOString()
    : nowIso;

  if (existing) {
    const update = {
      ...guardedPayload,
      last_event_at: lastEventIso,
      updated_at: nowIso,
    } as Record<string, unknown>;
    const { error } = await supabase
      .from("owner_subscriptions")
      .update(update as never)
      .eq("id", existing.id);
    if (error) throw error;
    return { id: existing.id, skipped: false };
  }

  const insert = {
    id: randomUUID(),
    owner_id: ownerId,
    tier: guardedPayload.tier ?? "unverified",
    tier_source: guardedPayload.tier_source ?? "stripe",
    plan_type: guardedPayload.plan_type ?? "monthly",
    billing_period: guardedPayload.billing_period ?? "monthly",
    status: guardedPayload.status ?? "pending",
    stripe_customer_id: guardedPayload.stripe_customer_id ?? null,
    stripe_subscription_id: guardedPayload.stripe_subscription_id ?? null,
    stripe_price_id: guardedPayload.stripe_price_id ?? null,
    stripe_checkout_session_id: guardedPayload.stripe_checkout_session_id ?? null,
    stripe_payment_intent_id: guardedPayload.stripe_payment_intent_id ?? null,
    current_period_start: guardedPayload.current_period_start ?? null,
    current_period_end: guardedPayload.current_period_end ?? null,
    cancel_at_period_end: guardedPayload.cancel_at_period_end ?? false,
    canceled_at: guardedPayload.canceled_at ?? null,
    trial_end: guardedPayload.trial_end ?? null,
    start_date: guardedPayload.start_date ?? new Date().toISOString().slice(0, 10),
    end_date: guardedPayload.end_date ?? null,
    price_cents: guardedPayload.price_cents ?? null,
    currency: guardedPayload.currency ?? "EUR",
    last_event_at: lastEventIso,
  } as Record<string, unknown>;

  const { error } = await supabase.from("owner_subscriptions").insert(insert as never);
  if (error) throw error;
  return { id: insert.id as string, skipped: false };
}

export async function applyAdminTierOverride(
  supabase: Supabase,
  ownerId: string,
  tier: EffectiveTier,
): Promise<{ id: string; skipped: boolean }> {
  const nowIso = new Date().toISOString();
  const status = tier === "unverified" ? "canceled" : "active";
  const existing = await findByOwner(supabase, ownerId);
  const payload: SubscriptionUpdate = {
    tier,
    tier_source: "admin",
    status,
    last_event_at: nowIso,
  };

  if (!existing) {
    payload.plan_type = "monthly";
    payload.billing_period = "monthly";
    payload.start_date = new Date().toISOString().slice(0, 10);
  }

  return upsertSubscription(
    supabase,
    ownerId,
    payload,
    { allowStale: true },
  );
}

// Apply the effective tier (derived from access rules) to all of an owner's
// listings. No-op if every listing already carries the desired tier — this
// avoids cache invalidation and write amplification on multi-listing owners.
export async function applyTierToListings(
  supabase: Supabase,
  ownerId: string,
  sub: SubscriptionRow | null,
): Promise<{ updated: number; tier: EffectiveTier }> {
  const desired = resolveEffectiveTier(sub);

  const { data: listings, error: listError } = await supabase
    .from("listings")
    .select("id, tier")
    .eq("owner_id", ownerId);
  if (listError) throw listError;

  const targets = (listings ?? []).filter((l) => l.tier !== desired);
  if (targets.length === 0) return { updated: 0, tier: desired };

  const { error: updateError } = await supabase
    .from("listings")
    .update({ tier: desired })
    .eq("owner_id", ownerId);
  if (updateError) throw updateError;

  return { updated: targets.length, tier: desired };
}

// Detects whether starting a new checkout would conflict with an existing
// active plan. Returns the conflicting row if a conflict exists, else null.
export async function findOverlappingActive(
  supabase: Supabase,
  ownerId: string,
  requestedPlanType: PlanType,
): Promise<{ row: SubscriptionRow; reason: string } | null> {
  const existing = await findByOwner(supabase, ownerId);
  if (!existing) return null;

  const isExistingFixed = existing.plan_type === "fixed_2026";
  const todayKey = new Date().toISOString().slice(0, 10);
  const fixedStillValid =
    isExistingFixed && existing.end_date != null && existing.end_date >= todayKey;
  const recurringActive =
    !isExistingFixed && (existing.status as SubscriptionStatus) !== "canceled" &&
    (existing.status as SubscriptionStatus) !== "expired" &&
    (existing.status as SubscriptionStatus) !== "incomplete_expired" &&
    (existing.status as SubscriptionStatus) !== "unpaid";

  // fixed_2026 in force, requested anything else (including another fixed_2026)
  if (fixedStillValid && requestedPlanType !== "fixed_2026") {
    return {
      row: existing,
      reason: "An active 2026 fixed plan exists. Wait until it expires or contact support.",
    };
  }
  if (fixedStillValid && requestedPlanType === "fixed_2026") {
    return {
      row: existing,
      reason: "A 2026 fixed plan is already active for this account.",
    };
  }
  // Recurring in force, user trying to add fixed_2026
  if (recurringActive && requestedPlanType === "fixed_2026") {
    return {
      row: existing,
      reason: "Cancel your recurring subscription before purchasing the 2026 fixed plan.",
    };
  }

  // Recurring in force → block any new recurring checkout to prevent dual billing.
  // Active subscribers must use /api/subscriptions/change-plan instead.
  if (recurringActive && requestedPlanType !== "fixed_2026") {
    return {
      row: existing,
      reason: "An active subscription already exists. Use the plan management option to change tiers.",
    };
  }

  return null;
}
