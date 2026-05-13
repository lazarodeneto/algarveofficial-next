import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  verifyServerSecret: vi.fn(),
  getTranslationProcessorCapabilities: vi.fn(),
  processListingTranslationJob: vi.fn(),
}));

vi.mock("@/lib/server/secret-auth", () => ({
  verifyServerSecret: mocks.verifyServerSecret,
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/translations/processorConfig", () => ({
  TRANSLATION_PROCESSOR_UNAVAILABLE:
    "Translation processor is not configured. Missing translations require manual review or an enabled provider.",
  getTranslationProcessorCapabilities: mocks.getTranslationProcessorCapabilities,
}));

vi.mock("@/lib/translations/listingProcessor", () => ({
  processListingTranslationJob: mocks.processListingTranslationJob,
}));

import { GET } from "./route";

function request() {
  return new NextRequest("http://localhost/api/translate", {
    method: "GET",
    headers: { "x-cron-secret": "test-secret" },
  });
}

function makeTranslationClient({
  jobs = [],
  selectError = null,
  updateError = null,
}: {
  jobs?: Array<{ id: string; attempts?: number | null }>;
  selectError?: { message: string } | null;
  updateError?: { message: string } | null;
} = {}) {
  const limit = vi.fn().mockResolvedValue({ data: jobs, error: selectError });
  const selectEq = vi.fn(() => ({ limit }));
  const select = vi.fn(() => ({ eq: selectEq }));
  const updateEq = vi.fn().mockResolvedValue({ error: updateError });
  const update = vi.fn(() => ({ eq: updateEq }));
  const from = vi.fn(() => ({ select, update }));

  return {
    client: { from },
    spies: { from, select, selectEq, limit, update, updateEq },
  };
}

afterEach(() => {
  vi.clearAllMocks();
  mocks.getTranslationProcessorCapabilities.mockReturnValue({
    configured: false,
    provider: null,
    mode: "manual",
    message:
      "Translation processor is not configured. Missing translations require manual review or an enabled provider.",
  });
  mocks.processListingTranslationJob.mockResolvedValue({
    jobId: "job-1",
    status: "completed",
    provider: "deepl",
  });
});

describe("translation cron route runtime", () => {
  it("rejects unauthorized cron requests before creating a service-role client", async () => {
    mocks.verifyServerSecret.mockReturnValueOnce("unauthorized");

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Unauthorized." });
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });

  it("reports no work without mutating jobs", async () => {
    mocks.verifyServerSecret.mockReturnValueOnce("authorized");
    const translationClient = makeTranslationClient();
    mocks.createServiceRoleClient.mockReturnValueOnce(translationClient.client);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ message: "No jobs" });
    expect(translationClient.spies.update).not.toHaveBeenCalled();
  });

  it("skips queued jobs without failing them when the processor is not configured", async () => {
    mocks.verifyServerSecret.mockReturnValueOnce("authorized");
    mocks.getTranslationProcessorCapabilities.mockReturnValueOnce({
      configured: false,
      provider: null,
      mode: "manual",
      message:
        "Translation processor is not configured. Missing translations require manual review or an enabled provider.",
    });
    const translationClient = makeTranslationClient({
      jobs: [
        { id: "job-1", attempts: 2 },
        { id: "job-2", attempts: null },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValueOnce(translationClient.client);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.objectContaining({
        processed: 0,
        skipped: 2,
        failed: 0,
      }),
    );
    expect(payload.message).toContain("not configured");
    expect(translationClient.spies.update).not.toHaveBeenCalled();
    expect(mocks.processListingTranslationJob).not.toHaveBeenCalled();
  });

  it("processes queued jobs through the configured provider path", async () => {
    mocks.verifyServerSecret.mockReturnValueOnce("authorized");
    mocks.getTranslationProcessorCapabilities.mockReturnValueOnce({
      configured: true,
      provider: "deepl",
      mode: "deepl",
      message: "Translation processor is configured using deepl.",
    });
    mocks.processListingTranslationJob
      .mockResolvedValueOnce({ jobId: "job-1", status: "completed", provider: "deepl" })
      .mockResolvedValueOnce({ jobId: "job-2", status: "failed", provider: "deepl", errorMessage: "provider error" });
    const translationClient = makeTranslationClient({
      jobs: [
        { id: "job-1", attempts: 2 },
        { id: "job-2", attempts: null },
      ],
    });
    mocks.createServiceRoleClient.mockReturnValueOnce(translationClient.client);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.objectContaining({
        processed: 1,
        failed: 1,
        provider: "deepl",
      }),
    );
    expect(mocks.processListingTranslationJob).toHaveBeenCalledTimes(2);
    expect(mocks.processListingTranslationJob).toHaveBeenCalledWith(translationClient.client, {
      id: "job-1",
      attempts: 2,
    });
  });

  it("does not hide translation job query failures", async () => {
    mocks.verifyServerSecret.mockReturnValueOnce("authorized");
    const translationClient = makeTranslationClient({
      selectError: { message: "permission denied" },
    });
    mocks.createServiceRoleClient.mockReturnValueOnce(translationClient.client);

    const response = await GET(request());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "permission denied" });
    expect(translationClient.spies.update).not.toHaveBeenCalled();
  });
});
