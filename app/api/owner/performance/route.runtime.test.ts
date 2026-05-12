import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedOwner: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/server/owner-auth", () => ({
  requireAuthenticatedOwner: mocks.requireAuthenticatedOwner,
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

import { GET as getOwnerPerformanceRoute } from "./route";

function request(url = "http://localhost/api/owner/performance") {
  return new NextRequest(url) as unknown as Parameters<typeof getOwnerPerformanceRoute>[0];
}

function makeThenableQuery<T>(resultFactory: (filters: Record<string, unknown>) => T) {
  const filters: Record<string, unknown> = {};
  const query: Record<string, unknown> = {
    select: vi.fn(() => query),
    eq: vi.fn((field: string, value: unknown) => {
      filters[field] = value;
      return query;
    }),
    gte: vi.fn((field: string, value: unknown) => {
      filters[`${field}:gte`] = value;
      return query;
    }),
    lte: vi.fn((field: string, value: unknown) => {
      filters[`${field}:lte`] = value;
      return query;
    }),
    order: vi.fn(() => query),
    then: (resolve: (value: T) => unknown, reject: (reason?: unknown) => unknown) =>
      Promise.resolve(resultFactory(filters)).then(resolve, reject),
  };
  return query;
}

function makeClient() {
  const listingsQuery = makeThenableQuery(() => ({
    data: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        name: "Atlantic Bistro",
        slug: "atlantic-bistro",
        tier: "verified",
        claim_status: "claimed",
        owner_id: "owner-1",
        city: { name: "Lagos" },
        category: { name: "Restaurants" },
      },
    ],
    error: null,
  }));

  const countMap: Record<string, number> = {
    "00000000-0000-4000-8000-000000000001:listing_profile_view": 12,
    "00000000-0000-4000-8000-000000000001:listing_website_click": 3,
    "00000000-0000-4000-8000-000000000001:listing_phone_click": 2,
    "00000000-0000-4000-8000-000000000001:listing_directions_click": 4,
    "00000000-0000-4000-8000-000000000001:listing_whatsapp_click": 5,
    "00000000-0000-4000-8000-000000000001:listing_booking_click": 1,
  };

  const analyticsQueries: Array<ReturnType<typeof makeThenableQuery>> = [];
  const from = vi.fn((table: string) => {
    if (table === "listings") return listingsQuery;
    if (table === "analytics_events") {
      const analyticsQuery = makeThenableQuery((filters) => ({
        count: countMap[`${filters.listing_id}:${filters.event_type}`] ?? 0,
        error: null,
      }));
      analyticsQueries.push(analyticsQuery);
      return analyticsQuery;
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    client: { from },
    spies: {
      from,
      listingsQuery,
      analyticsQueries,
    },
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("owner performance route", () => {
  it("returns owner-scoped listing performance counts", async () => {
    mocks.requireAuthenticatedOwner.mockResolvedValue({ userId: "owner-1", email: "owner@example.com" });
    const client = makeClient();
    mocks.createServiceRoleClient.mockReturnValue(client.client);

    const response = await getOwnerPerformanceRoute(request());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(client.spies.from).toHaveBeenCalledWith("listings");
    expect(client.spies.listingsQuery.eq).toHaveBeenCalledWith("owner_id", "owner-1");
    expect(client.spies.listingsQuery.eq).toHaveBeenCalledWith("claim_status", "claimed");
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          totals: {
            profileViews: 12,
            websiteClicks: 3,
            phoneClicks: 2,
            directionsClicks: 4,
            whatsAppClicks: 5,
            bookingClicks: 1,
          },
          listings: [
            expect.objectContaining({
              id: "00000000-0000-4000-8000-000000000001",
              name: "Atlantic Bistro",
              counts: expect.objectContaining({ profileViews: 12 }),
            }),
          ],
        }),
      }),
    );
  });

  it("returns 503 when service role is unavailable", async () => {
    mocks.requireAuthenticatedOwner.mockResolvedValue({ userId: "owner-1", email: "owner@example.com" });
    mocks.createServiceRoleClient.mockReturnValue(null);

    const response = await getOwnerPerformanceRoute(request());
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "SERVICE_ROLE_NOT_CONFIGURED" }),
      }),
    );
  });
});
