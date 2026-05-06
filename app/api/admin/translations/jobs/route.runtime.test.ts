import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

import {
  getAttentionCounts,
  getStatusCounts,
  getTranslationJobsGrouped,
} from "@/lib/admin/translations/queries";
import { requireAdminSession, requireAdminWriteClient } from "@/lib/server/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { GET, POST } from "./route";

vi.mock("@/lib/admin/translations/queries", () => ({
  getAttentionCounts: vi.fn(),
  getStatusCounts: vi.fn(),
  getTranslationJobsGrouped: vi.fn(),
}));

vi.mock("@/lib/server/admin-auth", () => ({
  requireAdminSession: vi.fn(),
  requireAdminWriteClient: vi.fn(),
  adminErrorResponse: (status: number, code: string, message: string) =>
    NextResponse.json({ ok: false, error: { code, message } }, { status }),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: vi.fn(),
}));

const mockedRequireAdminSession = vi.mocked(requireAdminSession);
const mockedRequireAdminWriteClient = vi.mocked(requireAdminWriteClient);
const mockedCreateServiceRoleClient = vi.mocked(createServiceRoleClient);
const mockedGetStatusCounts = vi.mocked(getStatusCounts);
const mockedGetAttentionCounts = vi.mocked(getAttentionCounts);
const mockedGetTranslationJobsGrouped = vi.mocked(getTranslationJobsGrouped);

function getRequest(pathnameWithQuery: string) {
  return new NextRequest(`http://localhost${pathnameWithQuery}`, {
    method: "GET",
  });
}

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/admin/translations/jobs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("admin translation jobs route runtime", () => {
  it("blocks unauthenticated console reads before creating a service-role client", async () => {
    mockedRequireAdminSession.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Unauthorized" } }, { status: 401 }),
    });

    const response = await GET(getRequest("/api/admin/translations/jobs?filter=all"));

    expect(response.status).toBe(401);
    expect(mockedCreateServiceRoleClient).not.toHaveBeenCalled();
  });

  it("serves grouped console data from the service-role client and slices preview groups", async () => {
    const serviceClient = { from: vi.fn() };
    const groups = Array.from({ length: 14 }, (_, index) => ({
      listing: {
        id: `listing-${index}`,
        name: `Listing ${index}`,
        city: "Faro",
        category: "Golf",
        tier: "unverified",
        status: "published",
        content_updated_at: "2026-05-01T00:00:00.000Z",
      },
      jobs: [],
      priorityScore: 0,
      seoCoverage: 100,
      seoCoverageLabel: "complete" as const,
      doneCount: 0,
      problemCount: 0,
      pendingCount: 0,
      attentionCount: 0,
      slaBreachCount: 0,
      outdatedCount: 0,
    }));

    mockedRequireAdminSession.mockResolvedValueOnce({ userId: "admin-1", role: "admin" } as never);
    mockedCreateServiceRoleClient.mockReturnValueOnce(serviceClient as never);
    mockedGetStatusCounts.mockResolvedValueOnce({
      missing: 0,
      queued: 0,
      auto: 9467,
      reviewed: 0,
      edited: 0,
      failed: 0,
    });
    mockedGetAttentionCounts.mockResolvedValueOnce({
      total: 0,
      missing: 0,
      queued: 0,
      failed: 0,
      slaRiskCount: 0,
      signatureCount: 0,
      outdatedCount: 0,
    });
    mockedGetTranslationJobsGrouped.mockResolvedValueOnce({ groups, total: 9467 });

    const response = await GET(getRequest("/api/admin/translations/jobs?filter=all"));
    const payload = (await response.json()) as { ok?: boolean; data?: { groups?: unknown[]; total?: number } };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data?.groups).toHaveLength(12);
    expect(payload.data?.total).toBe(9467);
    expect(mockedGetTranslationJobsGrouped).toHaveBeenCalledWith(serviceClient, { page: 1 });
  });

  it("rejects unsafe HTML before saving edited translations", async () => {
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: { from: vi.fn() } as never,
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "listing-1",
        targetLang: "de",
        translation: {
          title: "Safe title",
          description: "<script>alert(1)</script>",
        },
      }),
    );
    const payload = (await response.json()) as { error?: { code?: string; message?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("UNSAFE_TRANSLATION_CONTENT");
    expect(payload.error?.message).toContain("description");
  });
});
