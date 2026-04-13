import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedOwner: vi.fn(),
  createServiceRoleClient: vi.fn(),
  getStripeServerClient: vi.fn(),
  findOverlappingActive: vi.fn(),
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
}));

import { POST as postCheckoutRoute } from "@/app/api/stripe/checkout/route";

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/stripe/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postCheckoutRoute>[0];
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("stripe checkout route runtime", () => {
  it("passes owner_id in checkout metadata", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.test/session" }),
        },
      },
    });

    mocks.requireAuthenticatedOwner.mockResolvedValue({
      userId: "owner-123",
    });

    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: "pricing-verified-monthly",
          tier: "verified",
          billing_period: "monthly",
          stripe_price_id: "price_verified_monthly",
          is_active: true,
          valid_from: null,
          valid_to: null,
          price_cents: 1900,
          currency: "EUR",
        },
      ],
      error: null,
    });

    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit,
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
    };

    mocks.createServiceRoleClient.mockReturnValue(supabase as never);
    mocks.findOverlappingActive.mockResolvedValue(null);

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

  it("preserves unauthenticated behavior from the shared owner auth helper", async () => {
    mocks.getStripeServerClient.mockReturnValue({
      checkout: {
        sessions: {
          create: mocks.sessionsCreate,
        },
      },
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
});
