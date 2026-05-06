import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  verifyServerSecret: vi.fn(),
}));

vi.mock("@/lib/server/secret-auth", () => ({
  verifyServerSecret: mocks.verifyServerSecret,
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
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

  it("marks queued jobs failed instead of falsely completing translations", async () => {
    mocks.verifyServerSecret.mockReturnValueOnce("authorized");
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
        failed: 2,
      }),
    );
    expect(translationClient.spies.update).toHaveBeenCalledTimes(2);
    expect(translationClient.spies.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        status: "failed",
        attempts: 3,
        locked_at: null,
      }),
    );
    expect(translationClient.spies.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        status: "failed",
        attempts: 1,
        locked_at: null,
      }),
    );
    const firstPayload = translationClient.spies.update.mock.calls[0]?.[0] as { last_error?: string };
    expect(firstPayload.last_error).toContain("not configured");
    expect(firstPayload.last_error).toContain("no translated content was written");
    expect(translationClient.spies.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: "auto" }),
    );
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
