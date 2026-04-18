import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import OwnerMembership from "./OwnerMembership";
import type { SubscriptionState } from "@/hooks/useStripeSubscription";

const mocks = vi.hoisted(() => ({
  createCheckout: vi.fn(),
  changePlan: vi.fn(),
  openCustomerPortal: vi.fn(),
  checkSubscription: vi.fn(),
  replace: vi.fn(),
}));

let mockSubscription: SubscriptionState = {
  subscribed: false,
  tier: "unverified",
  planType: null,
  billingPeriod: null,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  trialEnd: null,
  endDate: null,
  hasStripeCustomer: false,
};

let mockListings: Array<{ id: string; tier: "unverified" | "verified" | "signature" }> = [];

const membershipTiers = [
  {
    id: "unverified",
    name: "Free",
    monthly: { display: "€0", note: "month" },
    annual: { display: "€0", note: "year", savings: 0 },
    benefits: [],
    limitations: [],
    highlight: false,
  },
  {
    id: "verified",
    name: "Verified",
    monthly: { display: "€19", note: "month" },
    annual: { display: "€190", note: "year", savings: 38, monthlyEquivalent: "€15.8/mo" },
    benefits: ["Benefit A"],
    limitations: [],
    highlight: true,
  },
  {
    id: "signature",
    name: "Signature",
    monthly: { display: "€99", note: "month" },
    annual: { display: "€990", note: "year", savings: 198, monthlyEquivalent: "€82.5/mo" },
    benefits: ["Benefit B"],
    limitations: [],
    highlight: false,
  },
];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("framer-motion", () => ({
  m: {
    div: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => "/owner/membership",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (href: string) => href,
}));

vi.mock("@/hooks/useOwnerListings", () => ({
  useOwnerListings: () => ({ data: mockListings, isLoading: false }),
}));

vi.mock("@/hooks/useSubscriptionPricing", () => ({
  useSubscriptionPricing: () => ({ membershipTiers, isLoading: false }),
}));

vi.mock("@/hooks/useStripeSubscription", () => ({
  useStripeSubscription: () => ({
    subscription: mockSubscription,
    isLoading: false,
    createCheckout: mocks.createCheckout,
    changePlan: mocks.changePlan,
    openCustomerPortal: mocks.openCustomerPortal,
    checkSubscription: mocks.checkSubscription,
  }),
}));

describe("OwnerMembership billing actions", () => {
  beforeEach(() => {
    mockListings = [];
    mockSubscription = {
      subscribed: false,
      tier: "unverified",
      planType: null,
      billingPeriod: null,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialEnd: null,
      endDate: null,
      hasStripeCustomer: false,
    };
    mocks.createCheckout.mockReset();
    mocks.changePlan.mockReset();
    mocks.openCustomerPortal.mockReset();
    mocks.checkSubscription.mockReset();
    mocks.replace.mockReset();
  });

  it("keeps unsubscribed users on checkout flow", async () => {
    mocks.createCheckout.mockResolvedValue(undefined);
    render(<OwnerMembership />);

    fireEvent.click(screen.getByRole("button", { name: "owner.membership.subscribeNow" }));

    expect(mocks.createCheckout).toHaveBeenCalledWith("verified", "monthly");
    expect(mocks.changePlan).not.toHaveBeenCalled();
  });

  it("uses changePlan for active same-tier monthly -> annual switch", async () => {
    mockSubscription = {
      ...mockSubscription,
      subscribed: true,
      tier: "verified",
      planType: "monthly",
      billingPeriod: "monthly",
      status: "active",
      hasStripeCustomer: true,
    };
    mocks.changePlan.mockResolvedValue({ ok: true, immediate: true, message: "changed" });

    render(<OwnerMembership />);

    fireEvent.click(screen.getByText("owner.membership.annual").closest("button") as HTMLButtonElement);
    fireEvent.click(screen.getByRole("button", { name: "owner.membership.switchTo" }));

    expect(mocks.changePlan).toHaveBeenCalledWith("verified", "annual");
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("uses changePlan for active tier upgrade action", async () => {
    mockSubscription = {
      ...mockSubscription,
      subscribed: true,
      tier: "unverified",
      planType: "monthly",
      billingPeriod: "monthly",
      status: "active",
      hasStripeCustomer: true,
    };
    mocks.changePlan.mockResolvedValue({ ok: true, immediate: true, message: "changed" });

    render(<OwnerMembership />);

    fireEvent.click(screen.getByRole("button", { name: "owner.membership.subscribeNow" }));

    expect(mocks.changePlan).toHaveBeenCalledWith("verified", "monthly");
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("keeps current plan button disabled with no action", () => {
    mockSubscription = {
      ...mockSubscription,
      subscribed: true,
      tier: "verified",
      planType: "monthly",
      billingPeriod: "monthly",
      status: "active",
      hasStripeCustomer: true,
    };

    render(<OwnerMembership />);

    const currentPlanButton = screen.getByRole("button", { name: "owner.membership.currentPlan" });
    expect(currentPlanButton).toBeDisabled();

    fireEvent.click(currentPlanButton);

    expect(mocks.changePlan).not.toHaveBeenCalled();
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });
});
