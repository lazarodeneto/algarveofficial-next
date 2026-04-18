import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedOwner: vi.fn(),
  createServiceRoleClient: vi.fn(),
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

const pricingRow = {
  id: "pricing-verified-monthly",
  tier: "verified",
  billing_period: "monthly",
  stripe_price_id: "price_verified_monthly",
  is_active: true,
  price_cents: 1900,
  currency: "EUR",
};

function makeSupabaseMock(pricingData: typeof pricingRow[] = [pricingRow]) {
  const limit = vi.fn().mockResolvedValue({ data: pricingData, error: null });
  const eqIsActive = vi.fn(() => ({ limit }));
  const eqBillingPeriod = vi.fn(() => ({ eq: eqIsActive }));
  const eqTier = vi.fn(() => ({ eq: eqBillingPeriod }));
  const selectStar = vi.fn(() => ({ eq: eqTier }));
  return { from: vi.fn(() => ({ select: selectStar })) };
}

afterEach(() => {
  vi.clearAllMocks();
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
