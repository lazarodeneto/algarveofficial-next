import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedOwner: vi.fn(),
  createServiceRoleClient: vi.fn(),
  createServerClient: vi.fn(),
  getStripeServerClient: vi.fn(),
  findOverlappingActive: vi.fn(),
  findByOwner: vi.fn(),
  sessionsCreate: vi.fn(),
}));

vi.mock("@/lib/server/owner-auth", () => ({
  requireAuthenticatedOwner: mocks.requireAuthenticatedOwner,
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createServerClient,
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripeServerClient: mocks.getStripeServerClient,
}));

vi.mock("@/lib/subscriptions/db", () => ({
  findOverlappingActive: mocks.findOverlappingActive,
  findByOwner: mocks.findByOwner,
}));

import { POST as postCheckoutRoute } from "@/app/api/stripe/checkout/route";

function jsonRequest(body: unknown, token = "tok-owner") {
  return new NextRequest("http://localhost/api/stripe/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postCheckoutRoute>[0];
}

const pricingRow: {
  id: string;
  tier: string;
  billing_period: string;
  stripe_price_id: string | null;
  is_active: boolean;
  price_cents: number;
  price: number;
  currency: string;
  display_price: string;
  note: string;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
} = {
  id: "pricing-verified-monthly",
  tier: "verified",
  billing_period: "monthly",
  stripe_price_id: "price_verified_monthly",
  is_active: true,
  price_cents: 1900,
  price: 1900,
  currency: "EUR",
  display_price: "€19",
  note: "per month",
  valid_from: null,
  valid_to: null,
  created_at: "2026-04-01T00:00:00.000Z",
  updated_at: "2026-04-01T00:00:00.000Z",
};

const CLAIMED_LISTING_ID = "11111111-1111-4111-8111-111111111111";
const CLAIM_ID = "33333333-3333-4333-8333-333333333333";

function makeSupabaseMock(
  pricingData: typeof pricingRow[] = [pricingRow],
  listingData: Record<string, unknown> | null = null,
  claimData: Record<string, unknown> | null = null,
) {
  const limit = vi.fn().mockResolvedValue({ data: pricingData, error: null });
  const eqIsActive = vi.fn(() => ({ limit }));
  const eqTier = vi.fn(() => ({ eq: eqIsActive }));
  const selectStar = vi.fn(() => ({ eq: eqTier }));

  const listingMaybeSingle = vi.fn().mockResolvedValue({ data: listingData, error: null });
  const listingChain = {
    eq: vi.fn(() => listingChain),
    maybeSingle: listingMaybeSingle,
  };
  const selectListing = vi.fn(() => listingChain);

  const claimMaybeSingle = vi.fn().mockResolvedValue({ data: claimData, error: null });
  const claimChain = {
    eq: vi.fn(() => claimChain),
    maybeSingle: claimMaybeSingle,
  };
  const selectClaim = vi.fn(() => claimChain);

  return {
    from: vi.fn((table: string) => {
      if (table === "listings") return { select: selectListing };
      if (table === "business_claims") return { select: selectClaim };
      return { select: selectStar };
    }),
    __spies: {
      eqTier,
      eqIsActive,
      limit,
      selectListing,
      listingMaybeSingle,
      selectClaim,
      claimMaybeSingle,
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("stripe checkout route runtime", () => {
  it("passes owner_id, userId, and client_reference_id in checkout metadata", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "monthly" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ url: "https://checkout.stripe.test/session" });
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: "owner-123",
        metadata: expect.objectContaining({
          userId: "owner-123",
          owner_id: "owner-123",
        }),
        subscription_data: expect.objectContaining({
          metadata: expect.objectContaining({
            userId: "owner-123",
            owner_id: "owner-123",
          }),
        }),
      }),
    );
  });

  it("validates a claimed owner listing and passes listing upgrade metadata to Stripe", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([pricingRow], {
        id: CLAIMED_LISTING_ID,
        owner_id: "owner-123",
        claim_status: "claimed",
        tier: "unverified",
      }),
    );
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({
        tier: "verified",
        billing_period: "monthly",
        listing_id: CLAIMED_LISTING_ID,
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          listing_id: CLAIMED_LISTING_ID,
          user_id: "owner-123",
          target_tier: "verified",
        }),
        subscription_data: expect.objectContaining({
          metadata: expect.objectContaining({
            listing_id: CLAIMED_LISTING_ID,
            user_id: "owner-123",
            target_tier: "verified",
          }),
        }),
        success_url: expect.stringContaining("/owner/upgrade/success"),
        cancel_url: expect.stringContaining("/owner/upgrade/cancel"),
      }),
    );
  });

  it("rejects listing checkout when the selected listing is not claimed", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });
    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([pricingRow], {
        id: CLAIMED_LISTING_ID,
        owner_id: "owner-123",
        claim_status: "claim_pending",
        tier: "unverified",
      }),
    );

    const response = await postCheckoutRoute(
      jsonRequest({
        tier: "verified",
        billing_period: "monthly",
        listing_id: CLAIMED_LISTING_ID,
      }),
    );

    expect(response.status).toBe(409);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects listing checkout when the authenticated owner does not own the listing", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });
    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock([pricingRow], null));

    const response = await postCheckoutRoute(
      jsonRequest({
        tier: "verified",
        billing_period: "monthly",
        listing_id: CLAIMED_LISTING_ID,
      }),
    );

    expect(response.status).toBe(404);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("allows a paid business claim checkout without requiring owner role", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });
    mocks.requireAuthenticatedOwner.mockResolvedValue({
      error: NextResponse.json({ error: "Owner access required." }, { status: 403 }),
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "claimant-123", email: "owner@test.com" } },
          error: null,
        }),
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([pricingRow], null, {
        id: CLAIM_ID,
        listing_id: CLAIMED_LISTING_ID,
        claimant_user_id: "claimant-123",
        selected_tier: "verified",
        status: "pending",
        listing: { id: CLAIMED_LISTING_ID, slug: "atlantic-bistro" },
      }),
    );
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({
        source: "claim",
        tier: "verified",
        billing_period: "monthly",
        claim_id: CLAIM_ID,
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.requireAuthenticatedOwner).not.toHaveBeenCalled();
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: "claimant-123",
        metadata: expect.objectContaining({
          checkout_source: "claim",
          claim_id: CLAIM_ID,
          pricing_id: "pricing-verified-monthly",
          stripe_price_id: "price_verified_monthly",
          listing_id: CLAIMED_LISTING_ID,
          owner_id: "claimant-123",
          userId: "claimant-123",
          user_id: "claimant-123",
          tier: "verified",
          target_tier: "verified",
          billing_period: "monthly",
          requested_billing_period: "monthly",
        }),
        subscription_data: expect.objectContaining({
          metadata: expect.objectContaining({
            checkout_source: "claim",
            claim_id: CLAIM_ID,
            pricing_id: "pricing-verified-monthly",
            stripe_price_id: "price_verified_monthly",
            listing_id: CLAIMED_LISTING_ID,
            owner_id: "claimant-123",
            userId: "claimant-123",
            user_id: "claimant-123",
            tier: "verified",
            target_tier: "verified",
            billing_period: "monthly",
            requested_billing_period: "monthly",
          }),
        }),
        success_url: expect.stringContaining("/claim-business/atlantic-bistro?checkout=success"),
        cancel_url: expect.stringContaining("/claim-business/atlantic-bistro?checkout=cancel"),
      }),
    );
  });

  it("rejects explicit claim checkout when claim_id is missing", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });

    const response = await postCheckoutRoute(
      jsonRequest({ source: "claim", tier: "verified", billing_period: "monthly" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "claim_id is required for claim checkout." });
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects claim checkout when the claim belongs to another user", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "claimant-123", email: "owner@test.com" } },
          error: null,
        }),
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([pricingRow], null, {
        id: CLAIM_ID,
        listing_id: CLAIMED_LISTING_ID,
        claimant_user_id: "other-user",
        selected_tier: "verified",
        status: "pending",
        listing: { id: CLAIMED_LISTING_ID, slug: "atlantic-bistro" },
      }),
    );

    const response = await postCheckoutRoute(
      jsonRequest({
        source: "claim",
        tier: "verified",
        billing_period: "monthly",
        claim_id: CLAIM_ID,
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects claim checkout when the claim is not pending", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "claimant-123", email: "owner@test.com" } },
          error: null,
        }),
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([pricingRow], null, {
        id: CLAIM_ID,
        listing_id: CLAIMED_LISTING_ID,
        claimant_user_id: "claimant-123",
        selected_tier: "verified",
        status: "approved",
        listing: { id: CLAIMED_LISTING_ID, slug: "atlantic-bistro" },
      }),
    );

    const response = await postCheckoutRoute(
      jsonRequest({
        source: "claim",
        tier: "verified",
        billing_period: "monthly",
        claim_id: CLAIM_ID,
      }),
    );

    expect(response.status).toBe(409);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects claim checkout when the claim tier does not match the checkout tier", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "claimant-123", email: "owner@test.com" } },
          error: null,
        }),
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([pricingRow], null, {
        id: CLAIM_ID,
        listing_id: CLAIMED_LISTING_ID,
        claimant_user_id: "claimant-123",
        selected_tier: "signature",
        status: "pending",
        listing: { id: CLAIMED_LISTING_ID, slug: "atlantic-bistro" },
      }),
    );

    const response = await postCheckoutRoute(
      jsonRequest({
        source: "claim",
        tier: "verified",
        billing_period: "monthly",
        claim_id: CLAIM_ID,
      }),
    );

    expect(response.status).toBe(409);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects non-monthly claim checkout before creating a Stripe session", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "claimant-123", email: "owner@test.com" } },
          error: null,
        }),
      },
    });

    const response = await postCheckoutRoute(
      jsonRequest({ source: "claim", tier: "verified", billing_period: "yearly", claim_id: CLAIM_ID }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Claim checkout requires monthly pricing." });
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects free/unverified claim checkout before creating a Stripe session", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });

    const response = await postCheckoutRoute(
      jsonRequest({ source: "claim", tier: "free", billing_period: "monthly", claim_id: CLAIM_ID }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects claim checkout when the monthly pricing row has no paid EUR amount", async () => {
    const zeroPriceRow = {
      ...pricingRow,
      price_cents: 0,
      price: 0,
      display_price: "€0",
    };
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "claimant-123", email: "owner@test.com" } },
          error: null,
        }),
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(
      makeSupabaseMock([zeroPriceRow], null, {
        id: CLAIM_ID,
        listing_id: CLAIMED_LISTING_ID,
        claimant_user_id: "claimant-123",
        selected_tier: "verified",
        status: "pending",
        listing: { id: CLAIMED_LISTING_ID, slug: "atlantic-bistro" },
      }),
    );
    mocks.findOverlappingActive.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({
        source: "claim",
        tier: "verified",
        billing_period: "monthly",
        claim_id: CLAIM_ID,
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("pre-fills customer_email when no existing customer", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    await postCheckoutRoute(jsonRequest({ tier: "verified", billing_period: "monthly" }));

    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: "owner@test.com" }),
    );
  });

  it("reuses existing Stripe customer when one is on file", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue({ stripe_customer_id: "cus_existing" });

    await postCheckoutRoute(jsonRequest({ tier: "verified", billing_period: "monthly" }));

    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" }),
    );
    expect(mocks.sessionsCreate).not.toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: expect.anything() }),
    );
  });

  it("continues checkout when customer lookup throws and falls back to customer_email", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockRejectedValue(new Error("Supabase read failed"));

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "monthly" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ url: "https://checkout.stripe.test/session" });
    expect(warnSpy).toHaveBeenCalledWith(
      "[checkout] Failed to fetch existing subscription/customer",
      expect.objectContaining({ userId: "owner-123" }),
    );
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: "owner@test.com" }),
    );

    warnSpy.mockRestore();
  });

  it("returns 401 when requireAuthenticatedOwner rejects", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "monthly" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 409 when an active subscription already exists", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());
    mocks.findOverlappingActive.mockResolvedValue({
      row: {},
      reason: "An active subscription already exists.",
    });

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "monthly" }),
    );

    expect(response.status).toBe(409);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid tier", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "free", billing_period: "monthly" }),
    );

    expect(response.status).toBe(400);
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("normalizes annual billing period to yearly and uses the yearly metadata path", async () => {
    const yearlyPricingRow = {
      ...pricingRow,
      id: "pricing-verified-yearly",
      billing_period: "yearly",
      stripe_price_id: "price_verified_yearly",
    };
    const supabase = makeSupabaseMock([yearlyPricingRow]);

    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });
    mocks.createServiceRoleClient.mockReturnValue(supabase);
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "annual" }),
    );

    expect(response.status).toBe(200);
    expect(supabase.__spies.eqTier).toHaveBeenCalledWith("tier", "verified");
    expect(supabase.__spies.eqIsActive).toHaveBeenCalledWith("is_active", true);
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          billing_period: "yearly",
          requested_billing_period: "yearly",
        }),
        subscription_data: expect.objectContaining({
          metadata: expect.objectContaining({
            billing_period: "yearly",
            requested_billing_period: "yearly",
          }),
        }),
      }),
    );
  });

  it("uses the active promo pricing row server-side when a promo is live", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));

    const promoPricingRow = {
      ...pricingRow,
      id: "pricing-verified-promo",
      billing_period: "promo",
      stripe_price_id: "price_verified_promo",
      price_cents: 12000,
      price: 12000,
      display_price: "€120",
      note: "2026 promo",
      valid_from: "2026-05-01",
      valid_to: "2026-12-31",
      updated_at: "2026-05-01T00:00:00.000Z",
    };

    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });
    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });
    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock([pricingRow, promoPricingRow]));
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "annual" }),
    );

    expect(response.status).toBe(200);
    expect(mocks.findOverlappingActive).toHaveBeenCalledWith(
      expect.anything(),
      "owner-123",
      "fixed_2026",
    );
    expect(mocks.sessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        customer_creation: "always",
        line_items: [{ price: "price_verified_promo", quantity: 1 }],
        metadata: expect.objectContaining({
          billing_period: "promo",
          requested_billing_period: "yearly",
          pricing_id: "pricing-verified-promo",
        }),
        payment_intent_data: expect.objectContaining({
          metadata: expect.objectContaining({
            billing_period: "promo",
            requested_billing_period: "yearly",
            pricing_id: "pricing-verified-promo",
          }),
        }),
      }),
    );
  });

  it("returns a structured error when stripe_price_id is missing and never calls Stripe", async () => {
    const pricingRowWithoutPrice = {
      ...pricingRow,
      stripe_price_id: null,
    };

    mocks.getStripeServerClient.mockReturnValue({
      checkout: { sessions: { create: mocks.sessionsCreate } },
    });
    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });
    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock([pricingRowWithoutPrice]));
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "monthly" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "Pricing configuration error." });
    expect(mocks.sessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 502 when Stripe session create throws", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockRejectedValue(new Error("Stripe network error")),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
      email: "owner@test.com",
    });

    mocks.createServiceRoleClient.mockReturnValue(makeSupabaseMock());
    mocks.findOverlappingActive.mockResolvedValue(null);
    mocks.findByOwner.mockResolvedValue(null);

    const response = await postCheckoutRoute(
      jsonRequest({ tier: "verified", billing_period: "monthly" }),
    );

    expect(response.status).toBe(502);
  });
});
