import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
  createServerClient: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createServerClient,
}));

vi.mock("@/lib/email/send-email", () => ({
  sendEmail: mocks.sendEmail,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { POST as enquiryPost } from "@/app/api/enquiries/route";
import { POST as partnerClaimPost } from "@/app/api/partner/claims/route";
import { POST as businessClaimPost } from "@/app/api/business-claims/route";

function jsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("communication form abuse protection", () => {
  it("blocks contact form honeypot submissions", async () => {
    mocks.createServiceRoleClient.mockReturnValue({ from: vi.fn() });

    const response = await enquiryPost(jsonRequest("http://localhost/api/enquiries", {
      name: "Test Sender",
      email: "sender@example.com",
      message: "Hello",
      honeypot: "filled",
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("ENQUIRY_REJECTED");
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("blocks partner claim honeypot submissions", async () => {
    mocks.createServiceRoleClient.mockReturnValue({ from: vi.fn() });

    const response = await partnerClaimPost(jsonRequest("http://localhost/api/partner/claims", {
      requestType: "new-listing",
      businessName: "Golden Beach Resort",
      businessWebsite: "https://golden.example",
      contactName: "Maria Santos",
      email: "maria@golden.example",
      phone: "+351912345678",
      message: "We want to join the platform and increase direct qualified leads.",
      honeypot: "filled",
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("PARTNER_CLAIM_REJECTED");
  });

  it("blocks authenticated business claim honeypot submissions", async () => {
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
    });
    mocks.createServiceRoleClient.mockReturnValue({ from: vi.fn() });

    const response = await businessClaimPost(jsonRequest("http://localhost/api/business-claims", {
      listingId: "00000000-0000-4000-8000-000000000001",
      claimantName: "Maria Santos",
      claimantEmail: "maria@example.com",
      claimantPhone: "+351912345678",
      claimantRole: "owner",
      companyWebsite: "https://example.com",
      message: "I own this business and would like to claim it.",
      proofNotes: "Business email and website match.",
      selectedTier: "verified",
      verificationMethod: "business_email_domain",
      honeypot: "filled",
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("BUSINESS_CLAIM_REJECTED");
  });
});
