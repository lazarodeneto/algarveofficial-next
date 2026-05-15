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

vi.mock("@/lib/translations/processorConfig", () => ({
  TRANSLATION_PROCESSOR_UNAVAILABLE: "Translation processor unavailable.",
  isTranslationProcessorConfigured: vi.fn(() => true),
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

type QueryResult = { data: unknown; error: { message: string } | null };

function createWriteClient(results: QueryResult[]) {
  const calls: Array<{ table: string; method: string; args: unknown[] }> = [];

  const createBuilder = (table: string, result: QueryResult) => {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "select", args });
        return builder;
      }),
      update: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "update", args });
        return builder;
      }),
      upsert: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "upsert", args });
        return builder;
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "eq", args });
        return builder;
      }),
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "in", args });
        return builder;
      }),
      not: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "not", args });
        return builder;
      }),
      lt: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "lt", args });
        return builder;
      }),
      maybeSingle: vi.fn(async () => result),
      then: (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  };

  const client = {
    from: vi.fn((table: string) => {
      calls.push({ table, method: "from", args: [] });
      return createBuilder(table, results.shift() ?? { data: null, error: null });
    }),
  };

  return { client, calls };
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

  it("blocks non-admin manual translation saves before any write runs", async () => {
    const writeClient = { from: vi.fn() };
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      error: NextResponse.json({ ok: false, error: { message: "Forbidden" } }, { status: 403 }),
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "listing-1",
        targetLang: "fr",
        translation: { title: "Titre" },
      }),
    );

    expect(response.status).toBe(403);
    expect(writeClient.from).not.toHaveBeenCalled();
  });

  it("rejects unsupported manual translation locales", async () => {
    const { client } = createWriteClient([]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "listing-1",
        targetLang: "pt-br",
        translation: { title: "Titulo" },
      }),
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("VALIDATION_ERROR");
    expect(client.from).not.toHaveBeenCalled();
  });

  it("rejects manual translation saves for missing listings", async () => {
    const { client } = createWriteClient([{ data: null, error: null }]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "missing-listing",
        targetLang: "de",
        translation: { title: "Titel" },
      }),
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(404);
    expect(payload.error?.code).toBe("LISTING_NOT_FOUND");
  });

  it("allows admins to save manual translations into listing_translations", async () => {
    const { client, calls } = createWriteClient([
      {
        data: {
          id: "listing-1",
          name: "Source listing",
          short_description: "Source short",
          description: null,
          meta_title: null,
          meta_description: null,
          tier: "verified",
          content_updated_at: "2026-05-15T09:00:00.000Z",
        },
        error: null,
      },
      { data: null, error: null },
      { data: null, error: null },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "listing-1",
        targetLang: "fr",
        saveStatus: "reviewed",
        translation: {
          title: "Nom traduit",
          short_description: "Description courte",
        },
      }),
    );
    const payload = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    const translationUpsert = calls.find((call) => call.table === "listing_translations" && call.method === "upsert");
    expect(translationUpsert?.args[0]).toMatchObject({
      listing_id: "listing-1",
      language_code: "fr",
      title: "Nom traduit",
      translation_status: "reviewed",
      translation_source: "manual",
    });
    const jobUpsert = calls.find((call) => call.table === "translation_jobs" && call.method === "upsert");
    expect(jobUpsert?.args[0]).toMatchObject({
      listing_id: "listing-1",
      target_lang: "fr",
      status: "reviewed",
      allow_manual_overwrite: false,
    });
  });

  it("saves manual drafts as edited manual translations", async () => {
    const { client, calls } = createWriteClient([
      {
        data: {
          id: "listing-1",
          name: "Source listing",
          short_description: "Source short",
          description: null,
          meta_title: null,
          meta_description: null,
          tier: "verified",
          content_updated_at: "2026-05-15T09:00:00.000Z",
        },
        error: null,
      },
      { data: null, error: null },
      { data: null, error: null },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "listing-1",
        targetLang: "fr",
        saveStatus: "edited",
        translation: {
          title: "Brouillon traduit",
        },
      }),
    );

    expect(response.status).toBe(200);
    const translationUpsert = calls.find((call) => call.table === "listing_translations" && call.method === "upsert");
    expect(translationUpsert?.args[0]).toMatchObject({
      listing_id: "listing-1",
      language_code: "fr",
      title: "Brouillon traduit",
      translation_status: "edited",
      translation_source: "manual",
    });
    const jobUpsert = calls.find((call) => call.table === "translation_jobs" && call.method === "upsert");
    expect(jobUpsert?.args[0]).toMatchObject({
      listing_id: "listing-1",
      target_lang: "fr",
      status: "edited",
      allow_manual_overwrite: false,
    });
  });

  it("rejects reviewed manual saves when required source fields are missing", async () => {
    const { client } = createWriteClient([
      {
        data: {
          id: "listing-1",
          name: "Source listing",
          short_description: "Source short",
          description: null,
          meta_title: null,
          meta_description: null,
          tier: "verified",
          content_updated_at: "2026-05-15T09:00:00.000Z",
        },
        error: null,
      },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "save_edit",
        listingId: "listing-1",
        targetLang: "fr",
        saveStatus: "reviewed",
        translation: { title: "Nom traduit" },
      }),
    );
    const payload = (await response.json()) as { error?: { code?: string; message?: string } };

    expect(response.status).toBe(400);
    expect(payload.error?.code).toBe("REQUIRED_FIELDS_MISSING");
    expect(payload.error?.message).toContain("short_description");
  });

  it("does not silently queue automatic overwrite when an edited manual translation exists", async () => {
    const { client } = createWriteClient([
      {
        data: { id: "listing-1", tier: "verified", content_updated_at: "2026-05-15T09:00:00.000Z" },
        error: null,
      },
      {
        data: [
          {
            listing_id: "listing-1",
            language_code: "de",
            translation_status: "edited",
            translation_source: "manual",
            updated_at: "2026-05-15T10:00:00.000Z",
          },
        ],
        error: null,
      },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "queue",
        listingId: "listing-1",
        targetLang: "de",
      }),
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(409);
    expect(payload.error?.code).toBe("MANUAL_TRANSLATION_EXISTS");
  });

  it("does not silently queue automatic overwrite when a reviewed manual translation exists", async () => {
    const { client } = createWriteClient([
      {
        data: { id: "listing-1", tier: "verified", content_updated_at: "2026-05-15T09:00:00.000Z" },
        error: null,
      },
      {
        data: [
          {
            listing_id: "listing-1",
            language_code: "de",
            translation_status: "reviewed",
            translation_source: "manual",
            updated_at: "2026-05-15T10:00:00.000Z",
          },
        ],
        error: null,
      },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "queue",
        listingId: "listing-1",
        targetLang: "de",
      }),
    );
    const payload = (await response.json()) as { error?: { code?: string } };

    expect(response.status).toBe(409);
    expect(payload.error?.code).toBe("MANUAL_TRANSLATION_EXISTS");
  });

  it("queues automatic overwrite only when explicitly confirmed", async () => {
    const { client, calls } = createWriteClient([
      {
        data: { id: "listing-1", tier: "verified", content_updated_at: "2026-05-15T09:00:00.000Z" },
        error: null,
      },
      { data: null, error: null },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "queue",
        listingId: "listing-1",
        targetLang: "de",
        overwriteManual: true,
      }),
    );

    expect(response.status).toBe(200);
    const jobUpsert = calls.find((call) => call.table === "translation_jobs" && call.method === "upsert");
    expect(jobUpsert?.args[0]).toMatchObject({
      listing_id: "listing-1",
      target_lang: "de",
      status: "queued",
      allow_manual_overwrite: true,
    });
  });

  it("requeues stale automatic reviewed jobs while skipping reviewed manual translations", async () => {
    const { client, calls } = createWriteClient([
      {
        data: { id: "listing-1", tier: "signature", content_updated_at: "2026-05-15T12:00:00.000Z" },
        error: null,
      },
      {
        data: [
          { id: "job-manual", listing_id: "listing-1", target_lang: "fr" },
          { id: "job-auto", listing_id: "listing-1", target_lang: "de" },
        ],
        error: null,
      },
      {
        data: [
          {
            listing_id: "listing-1",
            language_code: "fr",
            translation_status: "reviewed",
            translation_source: "manual",
            updated_at: "2026-05-15T10:00:00.000Z",
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: "job-auto",
            listing_id: "listing-1",
            target_lang: "de",
            listing: { tier: "signature", content_updated_at: "2026-05-15T12:00:00.000Z" },
          },
        ],
        error: null,
      },
      { data: [], error: null },
      { data: null, error: null },
    ]);
    mockedRequireAdminWriteClient.mockResolvedValueOnce({
      userId: "admin-1",
      writeClient: client as never,
    });

    const response = await POST(
      postRequest({
        action: "requeue_outdated",
        listingId: "listing-1",
      }),
    );
    const payload = (await response.json()) as { ok?: boolean; data?: { updated?: number } };

    expect(response.status).toBe(200);
    expect(payload.data?.updated).toBe(1);
    const jobUpdates = calls.filter((call) => call.table === "translation_jobs" && call.method === "update");
    expect(jobUpdates).toHaveLength(1);
    expect(jobUpdates[0]?.args[0]).toMatchObject({
      status: "queued",
      allow_manual_overwrite: false,
    });
  });
});
