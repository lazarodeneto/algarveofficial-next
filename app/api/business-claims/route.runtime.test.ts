import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
  notifyBusinessClaimSubmitted: vi.fn(),
  calculateBusinessClaimConfidence: vi.fn(() => 70),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createServerClient,
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/claims/business-claim-email", () => ({
  notifyBusinessClaimSubmitted: mocks.notifyBusinessClaimSubmitted,
}));

vi.mock("@/lib/claims/business-claim-scoring", () => ({
  calculateBusinessClaimConfidence: mocks.calculateBusinessClaimConfidence,
}));

import { POST as postBusinessClaim } from "./route";

const LISTING_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

function validPayload() {
  return {
    listingId: LISTING_ID,
    claimantName: "Maria Santos",
    claimantEmail: "maria@atlantic.example",
    claimantPhone: "+351 912 345 678",
    claimantRole: "owner",
    companyWebsite: "https://atlantic.example",
    message: "I own this business and can verify the public details.",
    proofNotes: "The domain and phone match the business website.",
    selectedTier: "verified",
    verificationMethod: "business_email_domain",
  };
}

function jsonRequest(body: unknown) {
  return new NextRequest("http://localhost/api/business-claims", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof postBusinessClaim>[0];
}

function makeWriteClient({
  listing = {
    id: LISTING_ID,
    name: "Atlantic Bistro",
    slug: "atlantic-bistro",
    status: "published",
    claim_status: "unclaimed",
    website_url: "https://atlantic.example",
    contact_phone: "+351912345678",
  },
  listingError = null,
  claim = {
    id: "claim-123",
    status: "pending",
    selected_tier: "verified",
    created_at: "2026-05-11T12:00:00.000Z",
  },
  claimError = null,
  updatedListing = { id: LISTING_ID, claim_status: "claim_pending" },
  updateError = null,
  cleanupError = null,
}: {
  listing?: unknown;
  listingError?: { message: string } | null;
  claim?: unknown;
  claimError?: { message: string; code?: string } | null;
  updatedListing?: unknown;
  updateError?: { message: string } | null;
  cleanupError?: { message: string } | null;
} = {}) {
  const listingMaybeSingle = vi.fn().mockResolvedValue({ data: listing, error: listingError });
  const listingLookupEq = vi.fn(() => ({ eq: listingLookupEq, maybeSingle: listingMaybeSingle }));
  const listingSelect = vi.fn(() => ({ eq: listingLookupEq }));

  const listingUpdateMaybeSingle = vi.fn().mockResolvedValue({
    data: updatedListing,
    error: updateError,
  });
  const listingUpdateSelect = vi.fn(() => ({ maybeSingle: listingUpdateMaybeSingle }));
  const listingUpdateEq = vi.fn(() => ({ eq: listingUpdateEq, select: listingUpdateSelect }));
  const listingUpdate = vi.fn(() => ({ eq: listingUpdateEq }));

  const claimSingle = vi.fn().mockResolvedValue({ data: claim, error: claimError });
  const claimSelect = vi.fn(() => ({ single: claimSingle }));
  const claimInsert = vi.fn(() => ({ select: claimSelect }));

  const claimCleanupEq = vi.fn(() => ({ eq: claimCleanupEq, error: cleanupError }));
  const claimUpdate = vi.fn(() => ({ eq: claimCleanupEq }));

  const from = vi.fn((table: string) => {
    if (table === "listings") {
      return { select: listingSelect, update: listingUpdate };
    }
    if (table === "business_claims") {
      return { insert: claimInsert, update: claimUpdate };
    }
    throw new Error(`Unexpected table ${table}`);
  });

  return {
    client: { from },
    spies: {
      from,
      listingSelect,
      listingLookupEq,
      listingMaybeSingle,
      listingUpdate,
      listingUpdateEq,
      listingUpdateSelect,
      listingUpdateMaybeSingle,
      claimInsert,
      claimSelect,
      claimSingle,
      claimUpdate,
      claimCleanupEq,
    },
  };
}

function mockAuthenticatedUser() {
  mocks.createServerClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: USER_ID, email: "maria@atlantic.example" } },
        error: null,
      }),
    },
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("business claims route", () => {
  it("creates a pending claim only after moving the listing to claim_pending", async () => {
    mockAuthenticatedUser();
    const writeClient = makeWriteClient();
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.notifyBusinessClaimSubmitted.mockResolvedValue([]);

    const response = await postBusinessClaim(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual(expect.objectContaining({ ok: true }));
    expect(writeClient.spies.claimInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        listing_id: LISTING_ID,
        claimant_user_id: USER_ID,
        status: "pending",
        confidence_score: 70,
      }),
    );
    expect(writeClient.spies.listingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        claim_status: "claim_pending",
        claim_verification_method: "business_email_domain",
      }),
    );
    expect(writeClient.spies.listingUpdateSelect).toHaveBeenCalledWith("id, claim_status");
    expect(mocks.notifyBusinessClaimSubmitted).toHaveBeenCalledWith(
      writeClient.client,
      expect.objectContaining({
        claimId: "claim-123",
        listingId: LISTING_ID,
        selectedTier: "verified",
      }),
    );
  });

  it("cancels the inserted claim if the listing claim status changed before activation", async () => {
    mockAuthenticatedUser();
    const writeClient = makeWriteClient({ updatedListing: null });
    mocks.createServiceRoleClient.mockReturnValue(writeClient.client);
    mocks.notifyBusinessClaimSubmitted.mockResolvedValue([]);

    const response = await postBusinessClaim(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "BUSINESS_CLAIM_LISTING_STATUS_CHANGED" }),
      }),
    );
    expect(writeClient.spies.claimUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "cancelled",
        review_note: expect.stringContaining("listing claim_status changed"),
      }),
    );
    expect(writeClient.spies.claimCleanupEq).toHaveBeenCalledWith("id", "claim-123");
    expect(writeClient.spies.claimCleanupEq).toHaveBeenCalledWith("status", "pending");
    expect(mocks.notifyBusinessClaimSubmitted).not.toHaveBeenCalled();
  });

  it("requires an authenticated user", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });

    const response = await postBusinessClaim(jsonRequest(validPayload()));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("AUTH_REQUIRED");
    expect(mocks.createServiceRoleClient).not.toHaveBeenCalled();
  });
});
