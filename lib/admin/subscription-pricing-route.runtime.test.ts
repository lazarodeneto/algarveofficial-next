import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import { PATCH as patchPricingRoute, POST as postPricingRoute } from "@/app/api/admin/subscriptions/pricing/route";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminWriteClient: vi.fn(),
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
}));

const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);

function jsonRequest(method: "PATCH" | "POST", body: unknown) {
  return new NextRequest("http://localhost/api/admin/subscriptions/pricing", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof patchPricingRoute>[0];
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin subscription pricing route runtime", () => {
  it("enforces admin write auth and requires service-role for PATCH", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { code: "AUTH_UNAUTHORIZED" } }, { status: 401 }),
    });

    const response = await patchPricingRoute(
      jsonRequest("PATCH", {
        tier: "verified",
        billing_period: "monthly",
        price_cents: 1900,
        display_price: "€19",
        note: "per month",
      }),
    );

    expect(response.status).toBe(401);
    expect(mockedRequireAdminWriteClient).toHaveBeenCalledWith(
      expect.anything(),
      "Only admins can update subscription pricing.",
      expect.objectContaining({
        requireServiceRole: true,
      }),
    );
  });

  it("creates promo pricing on POST when no existing row exists", async () => {
    const overlapEq = vi.fn().mockResolvedValueOnce({ data: [], error: null });
    const maybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const single = vi.fn().mockResolvedValueOnce({ data: { id: "new-pricing-id" }, error: null });

    const select = vi
      .fn()
      .mockImplementationOnce(() => ({
        eq: overlapEq,
      }))
      .mockImplementationOnce(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({ maybeSingle })),
              })),
            })),
          })),
        })),
      }));

    const from = vi.fn(() => ({
      select,
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single })),
      })),
    }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postPricingRoute(
      jsonRequest("POST", {
        tier: "verified",
        billing_period: "promo",
        price_cents: 12000,
        display_price: "€120",
        note: "Promotional rate",
        stripe_price_id: "price_verifiedpromo001",
        valid_from: "2026-05-01",
        valid_to: "2026-12-31",
        is_active: true,
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; action?: string; id?: string };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.action).toBe("created");
    expect(payload.id).toBe("new-pricing-id");
  });

  it("blocks overlapping promo periods", async () => {
    const overlapEq = vi.fn().mockResolvedValueOnce({
      data: [
        {
          id: "existing-promo",
          billing_period: "promo",
          valid_from: "2026-05-01",
          valid_to: "2026-12-31",
        },
      ],
      error: null,
    });

    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: overlapEq,
      })),
    }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postPricingRoute(
      jsonRequest("POST", {
        tier: "verified",
        billing_period: "promo",
        price_cents: 13000,
        display_price: "€130",
        note: "Overlapping promo",
        stripe_price_id: "price_verifiedpromo002",
        valid_from: "2026-06-01",
        valid_to: "2026-07-01",
        is_active: true,
      }),
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: { code?: string; message?: string };
    };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("PROMO_OVERLAP");
  });

  it("falls back to create when PATCH receives a stale id but valid pricing data", async () => {
    const findByIdMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const updateMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const single = vi.fn().mockResolvedValueOnce({ data: { id: "created-after-missing-id" }, error: null });

    const select = vi.fn().mockImplementationOnce(() => ({
      eq: vi.fn(() => ({
        maybeSingle: findByIdMaybeSingle,
      })),
    }));

    const from = vi.fn(() => ({
      select,
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({ maybeSingle: updateMaybeSingle })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single })),
      })),
    }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await patchPricingRoute(
      jsonRequest("PATCH", {
        id: "stale-id",
        tier: "signature",
        billing_period: "yearly",
        price_cents: 190000,
        display_price: "€1,900",
        note: "per year",
        stripe_price_id: "price_signatureyearly001",
        is_active: true,
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; action?: string; id?: string };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.action).toBe("created");
    expect(payload.id).toBe("created-after-missing-id");
  });

  it("returns PRICING_SAVE_FAILED with consistent message when write fails", async () => {
    const overlapEq = vi.fn().mockResolvedValueOnce({ data: [], error: null });
    const maybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const single = vi.fn().mockResolvedValueOnce({
      data: null,
      error: {
        code: "42501",
        message: "new row violates row-level security policy for table subscription_pricing",
      },
    });

    const select = vi
      .fn()
      .mockImplementationOnce(() => ({
        eq: overlapEq,
      }))
      .mockImplementationOnce(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({ maybeSingle })),
              })),
            })),
          })),
        })),
      }));

    const from = vi.fn(() => ({
      select,
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single })),
      })),
    }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await postPricingRoute(
      jsonRequest("POST", {
        tier: "verified",
        billing_period: "promo",
        price_cents: 12000,
        display_price: "€120",
        note: "Promotional rate",
        stripe_price_id: "price_verifiedpromo003",
        valid_from: "2026-05-01",
        valid_to: "2026-12-31",
        is_active: true,
      }),
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: { code?: string; message?: string };
    };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("PRICING_SAVE_FAILED");
    expect(payload.error?.message).toContain("Failed to save pricing");
  });
});
