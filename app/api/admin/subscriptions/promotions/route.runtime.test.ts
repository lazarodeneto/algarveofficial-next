import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import {
  PATCH as patchPromotionsRoute,
  POST as postPromotionsRoute,
} from "@/app/api/admin/subscriptions/promotions/route";
import { requireAdminWriteClient } from "@/lib/server/admin-auth";

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminWriteClient: vi.fn(),
}));

const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);

function jsonRequest(method: "PATCH" | "POST", body: unknown) {
  return new NextRequest("http://localhost/api/admin/subscriptions/promotions", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postPromotionsRoute>[0];
}

function adminAuthWithWriteClient(writeClient: unknown) {
  mockedRequireAdminWriteClient.mockResolvedValueOnce({
    userId: "admin-1",
    writeClient,
  } as never);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin subscription promotions route runtime", () => {
  it("accepts the admin UI promotion payload on POST", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn(() => ({ insert }));
    adminAuthWithWriteClient({ from });

    const response = await postPromotionsRoute(
      jsonRequest("POST", {
        name: "2026 launch",
        code: "LAUNCH2026",
        discount_type: "fixed",
        discount_value: 700,
        applicable_tiers: ["verified"],
        applicable_billing: ["period"],
        start_date: "2026-05-01T00:00:00.000Z",
        end_date: "2026-12-31T23:59:59.000Z",
        is_active: true,
        max_uses: null,
        period_length: 8,
        period_unit: "months",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "2026 launch",
        code: "LAUNCH2026",
        discount_type: "fixed",
        discount_value: 700,
        applicable_tiers: ["verified"],
        applicable_billing: ["period"],
      }),
    );
  });

  it("validates percentage discounts before writing", async () => {
    const insert = vi.fn();
    const from = vi.fn(() => ({ insert }));
    adminAuthWithWriteClient({ from });

    const response = await postPromotionsRoute(
      jsonRequest("POST", {
        name: "Impossible promo",
        code: "TOO-MUCH",
        discount_type: "percentage",
        discount_value: 101,
        applicable_tiers: ["verified"],
        applicable_billing: ["monthly"],
        start_date: "2026-05-01T00:00:00.000Z",
        end_date: "2026-12-31T23:59:59.000Z",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error.message).toContain("Percentage discount cannot exceed 100");
    expect(insert).not.toHaveBeenCalled();
  });

  it("allows partial PATCH updates like toggling active state", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    adminAuthWithWriteClient({ from });

    const response = await patchPromotionsRoute(
      jsonRequest("PATCH", {
        id: "promo-1",
        is_active: false,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(eq).toHaveBeenCalledWith("id", "promo-1");
  });

  it("returns the admin auth response when the user is not allowed", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false }, { status: 401 }),
    } as never);

    const response = await postPromotionsRoute(jsonRequest("POST", {}));

    expect(response.status).toBe(401);
  });
});
