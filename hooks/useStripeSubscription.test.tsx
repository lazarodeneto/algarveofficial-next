import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStripeSubscription } from "./useStripeSubscription";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Promise<Response>;
}

describe("useStripeSubscription", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    mocks.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: "owner-1", role: "admin" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("calls change-plan endpoint and normalizes annual -> yearly", async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({
        ok: true,
        immediate: true,
        message: "Plan upgraded immediately",
      }),
    );

    const { result } = renderHook(() => useStripeSubscription());

    let payload: Awaited<ReturnType<typeof result.current.changePlan>> | null = null;
    await act(async () => {
      payload = await result.current.changePlan("verified", "annual");
    });

    expect(payload).toEqual({
      ok: true,
      immediate: true,
      message: "Plan upgraded immediately",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/subscriptions/change-plan",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        credentials: "include",
        body: JSON.stringify({ tier: "verified", billing_period: "yearly" }),
      }),
    );
  });

  it("returns structured API error from change-plan", async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse(
        {
          error: "No subscription on file.",
          code: "NO_SUBSCRIPTION",
        },
        422,
      ),
    );

    const { result } = renderHook(() => useStripeSubscription());

    let payload: Awaited<ReturnType<typeof result.current.changePlan>> | null = null;
    await act(async () => {
      payload = await result.current.changePlan("verified", "monthly");
    });

    expect(payload).toEqual({
      ok: false,
      error: "No subscription on file.",
      code: "NO_SUBSCRIPTION",
    });
    expect(result.current.error).toBe("No subscription on file.");
  });
});
