import { afterEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const mocks = vi.hoisted(() => ({
  findByCheckoutSession: vi.fn(),
  findByOwner: vi.fn(),
  findByStripeSub: vi.fn(),
  upsertSubscription: vi.fn(),
}));

vi.mock("./db", () => ({
  findByCheckoutSession: mocks.findByCheckoutSession,
  findByOwner: mocks.findByOwner,
  findByStripeSub: mocks.findByStripeSub,
  upsertSubscription: mocks.upsertSubscription,
}));

import {
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleSubscriptionCreatedOrUpdated,
  handleSubscriptionDeleted,
} from "@/lib/subscriptions/webhook-handlers";

function createPricingSupabase({
  pricingById = {},
  pricingByStripePriceId = {},
}: {
  pricingById?: Record<string, Record<string, unknown> | null>;
  pricingByStripePriceId?: Record<string, Record<string, unknown> | null>;
}) {
  return {
    from(table: string) {
      if (table !== "subscription_pricing") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select() {
          const filters = new Map<string, string>();

          return {
            eq(column: string, value: string) {
              filters.set(column, value);
              return this;
            },
            async maybeSingle() {
              if (filters.has("id")) {
                return {
                  data: pricingById[filters.get("id") as string] ?? null,
                  error: null,
                };
              }

              if (filters.has("stripe_price_id")) {
                return {
                  data:
                    pricingByStripePriceId[filters.get("stripe_price_id") as string] ?? null,
                  error: null,
                };
              }

              return { data: null, error: null };
            },
          };
        },
      };
    },
  } as never;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("subscription webhook handlers", () => {
  it("creates a pending recurring subscription on checkout.session.completed", async () => {
    const supabase = createPricingSupabase({
      pricingById: {
        "pricing-verified-monthly": {
          id: "pricing-verified-monthly",
          tier: "verified",
          billing_period: "monthly",
          stripe_price_id: "price_verified_monthly",
          price_cents: 1900,
          currency: "EUR",
          valid_to: null,
        },
      },
    });

    const event = {
      created: 1710000000,
      data: {
        object: {
          id: "cs_test_1",
          customer: "cus_test_1",
          subscription: "sub_test_1",
          payment_intent: null,
          metadata: {
            owner_id: "owner-1",
            pricing_id: "pricing-verified-monthly",
            tier: "verified",
            billing_period: "monthly",
          },
        },
      },
    } as unknown as Stripe.Event;

    await handleCheckoutCompleted({} as Stripe, supabase, event);

    expect(mocks.upsertSubscription).toHaveBeenCalledWith(
      supabase,
      "owner-1",
      expect.objectContaining({
        tier: "verified",
        plan_type: "monthly",
        billing_period: "monthly",
        status: "pending",
        stripe_customer_id: "cus_test_1",
        stripe_subscription_id: "sub_test_1",
        stripe_checkout_session_id: "cs_test_1",
        stripe_price_id: "price_verified_monthly",
        price_cents: 1900,
        currency: "EUR",
      }),
      { eventCreatedAt: 1710000000 },
    );
  });

  it("activates the paid tier on invoice.paid", async () => {
    const supabase = createPricingSupabase({
      pricingByStripePriceId: {
        price_signature_yearly: {
          id: "pricing-signature-yearly",
          tier: "signature",
          billing_period: "yearly",
          stripe_price_id: "price_signature_yearly",
          price_cents: 29900,
          currency: "EUR",
          valid_to: null,
        },
      },
    });

    const stripe = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: "sub_test_1",
          customer: "cus_test_1",
          status: "active",
          cancel_at_period_end: false,
          metadata: { userId: "owner-1" },
          items: {
            data: [
              {
                current_period_start: 1710000000,
                current_period_end: 1712592000,
                price: { id: "price_signature_yearly" },
              },
            ],
          },
        }),
      },
    } as unknown as Stripe;

    const event = {
      created: 1710000100,
      data: {
        object: {
          subscription: "sub_test_1",
          customer: "cus_test_1",
        },
      },
    } as unknown as Stripe.Event;

    await handleInvoicePaid(stripe, supabase, event);

    expect(mocks.upsertSubscription).toHaveBeenCalledWith(
      supabase,
      "owner-1",
      expect.objectContaining({
        tier: "signature",
        plan_type: "yearly",
        billing_period: "yearly",
        status: "active",
        stripe_customer_id: "cus_test_1",
        stripe_subscription_id: "sub_test_1",
        stripe_price_id: "price_signature_yearly",
        price_cents: 29900,
        currency: "EUR",
        end_date: "2024-04-08",
      }),
      { eventCreatedAt: 1710000100 },
    );
  });

  it("syncs subscription state on customer.subscription.updated", async () => {
    const supabase = createPricingSupabase({
      pricingByStripePriceId: {
        price_verified_monthly: {
          id: "pricing-verified-monthly",
          tier: "verified",
          billing_period: "monthly",
          stripe_price_id: "price_verified_monthly",
          price_cents: 1900,
          currency: "EUR",
          valid_to: null,
        },
      },
    });

    const event = {
      created: 1710000200,
      data: {
        object: {
          id: "sub_test_2",
          customer: "cus_test_2",
          status: "past_due",
          cancel_at_period_end: true,
          canceled_at: null,
          trial_end: null,
          metadata: { userId: "owner-2" },
          items: {
            data: [
              {
                current_period_start: 1710000000,
                current_period_end: 1712592000,
                price: { id: "price_verified_monthly" },
              },
            ],
          },
        },
      },
    } as unknown as Stripe.Event;

    await handleSubscriptionCreatedOrUpdated({} as Stripe, supabase, event);

    expect(mocks.upsertSubscription).toHaveBeenCalledWith(
      supabase,
      "owner-2",
      expect.objectContaining({
        tier: "verified",
        plan_type: "monthly",
        billing_period: "monthly",
        status: "past_due",
        stripe_customer_id: "cus_test_2",
        stripe_subscription_id: "sub_test_2",
        stripe_price_id: "price_verified_monthly",
        cancel_at_period_end: true,
        end_date: "2024-04-08",
      }),
      { eventCreatedAt: 1710000200 },
    );
  });

  it("downgrades to unverified on customer.subscription.deleted", async () => {
    const event = {
      created: 1710000300,
      data: {
        object: {
          id: "sub_test_3",
          customer: "cus_test_3",
          canceled_at: 1710000250,
          ended_at: null,
          metadata: { userId: "owner-3" },
        },
      },
    } as unknown as Stripe.Event;

    await handleSubscriptionDeleted({} as Stripe, {} as never, event);

    expect(mocks.upsertSubscription).toHaveBeenCalledWith(
      expect.anything(),
      "owner-3",
      expect.objectContaining({
        status: "canceled",
        tier: "unverified",
        cancel_at_period_end: false,
        end_date: "2024-03-09",
      }),
      { eventCreatedAt: 1710000300 },
    );
  });
});
