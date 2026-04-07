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
        price: 1900,
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

  it("creates pricing on POST when no existing row exists", async () => {
    const maybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const single = vi.fn().mockResolvedValueOnce({ data: { id: "new-pricing-id" }, error: null });
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ maybeSingle })),
            })),
          })),
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

    const response = await postPricingRoute(
      jsonRequest("POST", {
        tier: "verified",
        billing_period: "period",
        price: 1000,
        display_price: "€10",
        note: "Mar 30, 2026 - Apr 22, 2026",
        period_start_date: "2026-03-30",
        period_end_date: "2026-04-22",
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; action?: string; id?: string };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.action).toBe("created");
    expect(payload.id).toBe("new-pricing-id");
  });

  it("normalizes save errors for PATCH", async () => {
    const maybeSingle = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116", message: "Row not found." },
    });
    const from = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({ maybeSingle })),
        })),
      })),
    }));

    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from } as never,
    });

    const response = await patchPricingRoute(
      jsonRequest("PATCH", {
        id: "missing-id",
        price: 1900,
      }),
    );
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: { code?: string; message?: string };
    };

    expect(response.status).toBe(404);
    expect(payload.ok).toBe(false);
    expect(payload.error?.code).toBe("PRICING_NOT_FOUND");
  });

  it("returns PRICING_SAVE_FAILED with consistent message when write fails", async () => {
    const maybeSingleQueue = [
      { data: null, error: { code: "PGRST116", message: "Row not found." } },
      { data: null, error: null },
    ];
    const maybeSingle = vi.fn(async () => maybeSingleQueue.shift());
    const single = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { code: "42501", message: "new row violates row-level security policy for table subscription_pricing" },
      });

    const from = vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({ maybeSingle })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ maybeSingle })),
            })),
          })),
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
        id: "missing-id",
        tier: "verified",
        billing_period: "period",
        price: 1000,
        display_price: "€10",
        note: "Mar 30, 2026 - Apr 22, 2026",
        period_start_date: "2026-03-30",
        period_end_date: "2026-04-22",
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
