import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BusinessClaimFormClient, type ClaimFormListing } from "./BusinessClaimFormClient";
import type { ClaimTierPricingDetails } from "@/lib/claims/claim-pricing-types";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  useAuth: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock("@/components/ListingImage", () => ({
  default: ({ alt }: { alt: string }) => <span aria-label={alt} role="img" />,
}));

function flatten(value: unknown, prefix = "", output: Record<string, string> = {}) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, output);
    }
  } else {
    output[prefix] = String(value ?? "");
  }
  return output;
}

const en = JSON.parse(readFileSync(join(process.cwd(), "i18n", "locales", "en.json"), "utf8"));
const tx = flatten(en);

const defaultPricing: ClaimTierPricingDetails = {
  free: {
    priceLabel: tx["claimBusinessPartnership.tiers.unverified.price"],
    cadenceLabel: tx["claimBusinessPartnership.tiers.unverified.priceNote"],
    supportingLabel: tx["claimBusinessSearch.pricing.freeNote"],
    billingPeriod: null,
    checkoutBillingPeriod: null,
    options: [],
  },
  verified: {
    priceLabel: "€19",
    cadenceLabel: "/month",
    supportingLabel: "per month",
    billingPeriod: "monthly",
    checkoutBillingPeriod: "monthly",
    options: [
      {
        billingPeriod: "monthly",
        priceLabel: "€19",
        cadenceLabel: "/month",
        supportingLabel: "per month",
      },
    ],
  },
  signature: {
    priceLabel: "€190",
    cadenceLabel: "/month",
    supportingLabel: "per month",
    billingPeriod: "monthly",
    checkoutBillingPeriod: "monthly",
    options: [
      {
        billingPeriod: "monthly",
        priceLabel: "€190",
        cadenceLabel: "/month",
        supportingLabel: "per month",
      },
    ],
  },
};

const listing: ClaimFormListing = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "atlantic-bistro",
  name: "Atlantic Bistro",
  featured_image_url: null,
  address: "Rua do Mar 1",
  website_url: "https://atlantic.example",
  contact_phone: "+351 912 345 678",
  claim_status: "unclaimed",
  updated_at: "2026-05-15T10:00:00.000Z",
  city: { name: "Lagos" },
  category: { name: "Restaurants", image_url: null },
};

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as Promise<Response>;
}

function renderClaimForm(pricing: ClaimTierPricingDetails | undefined = defaultPricing) {
  return render(
    <BusinessClaimFormClient
      listing={listing}
      listingHref="/en/listing/atlantic-bistro"
      searchHref="/en/claim-business"
      loginHref="/en/login?next=/en/claim-business/atlantic-bistro"
      tx={tx}
      pricing={pricing}
    />,
  );
}

async function openFormAndFillRequiredFields() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: tx["claimBusinessForm.yesContinue"] }));
  await user.type(screen.getByLabelText(tx["claimBusinessForm.fullName"]), "Maria Santos");
  await user.type(screen.getByLabelText(tx["claimBusinessForm.workEmail"]), "maria@atlantic.example");
  await user.type(
    screen.getByLabelText(tx["claimBusinessForm.message"]),
    "I own this business and can verify the public details.",
  );
  return user;
}

describe("BusinessClaimFormClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    mocks.useAuth.mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders all three claim partnership tiers with clear prices", async () => {
    renderClaimForm();

    await userEvent.click(screen.getByRole("button", { name: tx["claimBusinessForm.yesContinue"] }));

    expect(screen.getByRole("heading", { name: tx["claimBusinessPartnership.pricing.title"] })).toBeInTheDocument();
    expect(screen.getByText(tx["claimBusinessPartnership.tiers.unverified.name"])).toBeInTheDocument();
    expect(screen.getAllByText(tx["claimBusinessPartnership.tiers.unverified.price"]).length).toBeGreaterThan(0);
    expect(screen.getByText(tx["claimBusinessPartnership.tiers.verified.price"])).toBeInTheDocument();
    expect(screen.getByText(tx["claimBusinessPartnership.tiers.signature.price"])).toBeInTheDocument();
  });

  it("submits the free tier without starting Stripe checkout", async () => {
    fetchMock.mockResolvedValueOnce(
      await jsonResponse({
        ok: true,
        data: {
          id: "claim-free",
          status: "pending",
          selected_tier: "free",
          created_at: "2026-05-15T10:00:00.000Z",
        },
      }, 201),
    );

    renderClaimForm();
    const user = await openFormAndFillRequiredFields();
    await user.click(screen.getByRole("button", { name: tx["claimBusinessPartnership.tiers.unverified.cta"] }));
    await user.click(screen.getByRole("button", { name: tx["claimBusinessForm.submitFree"] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/business-claims",
      expect.objectContaining({
        body: expect.stringContaining('"selectedTier":"free"'),
      }),
    );
  });

  it("starts Verified checkout with the server-side tier after creating the claim", async () => {
    fetchMock
      .mockResolvedValueOnce(
        await jsonResponse({
          ok: true,
          data: {
            id: "claim-verified",
            status: "pending",
            selected_tier: "verified",
            created_at: "2026-05-15T10:00:00.000Z",
          },
        }, 201),
      )
      .mockResolvedValueOnce(await jsonResponse({ url: "https://checkout.stripe.test/verified" }));

    renderClaimForm();
    const user = await openFormAndFillRequiredFields();
    await user.click(screen.getByRole("button", { name: tx["claimBusinessForm.submitPaid"] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/stripe/checkout",
      expect.objectContaining({
        body: JSON.stringify({
          tier: "verified",
          billing_period: "monthly",
          claim_id: "claim-verified",
        }),
      }),
    );
  });

  it("uses the only available paid billing period instead of hardcoded monthly", async () => {
    const yearlyOnlyPricing: ClaimTierPricingDetails = {
      ...defaultPricing,
      verified: {
        priceLabel: "€190",
        cadenceLabel: "/year",
        supportingLabel: "annual billing",
        billingPeriod: "yearly",
        checkoutBillingPeriod: "yearly",
        options: [
          {
            billingPeriod: "yearly",
            priceLabel: "€190",
            cadenceLabel: "/year",
            supportingLabel: "annual billing",
          },
        ],
      },
    };

    fetchMock
      .mockResolvedValueOnce(
        await jsonResponse({
          ok: true,
          data: {
            id: "claim-verified-yearly",
            status: "pending",
            selected_tier: "verified",
            created_at: "2026-05-15T10:00:00.000Z",
          },
        }, 201),
      )
      .mockResolvedValueOnce(await jsonResponse({ url: "https://checkout.stripe.test/verified-yearly" }));

    renderClaimForm(yearlyOnlyPricing);
    const user = await openFormAndFillRequiredFields();
    await user.click(screen.getByRole("button", { name: tx["claimBusinessForm.submitPaid"] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/stripe/checkout",
      expect.objectContaining({
        body: JSON.stringify({
          tier: "verified",
          billing_period: "yearly",
          claim_id: "claim-verified-yearly",
        }),
      }),
    );
  });

  it("uses the selected paid billing period when multiple periods are available", async () => {
    const multiPeriodPricing: ClaimTierPricingDetails = {
      ...defaultPricing,
      verified: {
        priceLabel: "€19",
        cadenceLabel: "/month",
        supportingLabel: "per month",
        billingPeriod: "monthly",
        checkoutBillingPeriod: "monthly",
        options: [
          {
            billingPeriod: "monthly",
            priceLabel: "€19",
            cadenceLabel: "/month",
            supportingLabel: "per month",
          },
          {
            billingPeriod: "yearly",
            priceLabel: "€190",
            cadenceLabel: "/year",
            supportingLabel: "annual billing",
          },
        ],
      },
    };

    fetchMock
      .mockResolvedValueOnce(
        await jsonResponse({
          ok: true,
          data: {
            id: "claim-verified-selected-yearly",
            status: "pending",
            selected_tier: "verified",
            created_at: "2026-05-15T10:00:00.000Z",
          },
        }, 201),
      )
      .mockResolvedValueOnce(await jsonResponse({ url: "https://checkout.stripe.test/verified-yearly" }));

    renderClaimForm(multiPeriodPricing);
    const user = await openFormAndFillRequiredFields();
    await user.click(screen.getByRole("radio", { name: /€190/i }));
    await user.click(screen.getByRole("button", { name: tx["claimBusinessForm.submitPaid"] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/stripe/checkout",
      expect.objectContaining({
        body: JSON.stringify({
          tier: "verified",
          billing_period: "yearly",
          claim_id: "claim-verified-selected-yearly",
        }),
      }),
    );
  });

  it("starts Signature checkout with the signature tier after creating the claim", async () => {
    fetchMock
      .mockResolvedValueOnce(
        await jsonResponse({
          ok: true,
          data: {
            id: "claim-signature",
            status: "pending",
            selected_tier: "signature",
            created_at: "2026-05-15T10:00:00.000Z",
          },
        }, 201),
      )
      .mockResolvedValueOnce(await jsonResponse({ url: "https://checkout.stripe.test/signature" }));

    renderClaimForm();
    const user = await openFormAndFillRequiredFields();
    await user.click(screen.getByRole("button", { name: tx["claimBusinessPartnership.tiers.signature.cta"] }));
    await user.click(screen.getByRole("button", { name: tx["claimBusinessForm.submitPaid"] }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/stripe/checkout",
      expect.objectContaining({
        body: JSON.stringify({
          tier: "signature",
          billing_period: "monthly",
          claim_id: "claim-signature",
        }),
      }),
    );
  });
});
