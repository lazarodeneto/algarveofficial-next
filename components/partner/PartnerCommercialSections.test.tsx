import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PartnerCommercialSections } from "./PartnerCommercialSections";
import { ForWhomSection } from "./ForWhomSection";

vi.mock("framer-motion", () => ({
  m: {
    div: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        "partner.forWhom.title": "Built for premium Algarve businesses",
        "partner.forWhom.subtitle": "Not a mass directory.",
        "partner.forWhom.categories.hotels": "Hotels & Accommodation",
        "partner.forWhom.categories.restaurants": "Restaurants & Gastronomy",
        "partner.forWhom.categories.experiences": "Experiences & Activities",
        "partner.forWhom.categories.golf": "Golf & Leisure",
        "partner.forWhom.categories.realEstate": "Real Estate & Services",
        "partner.audience.badge": "Audience",
        "partner.audience.title": "Reach the Algarve audiences that matter",
        "partner.audience.subtitle": "High intent discovery.",
        "partner.audience.items.visitors.title": "Visitors planning trips",
        "partner.audience.items.visitors.description": "Trip planners.",
        "partner.audience.items.residents.title": "Residents and relocation users",
        "partner.audience.items.residents.description": "Local routines.",
        "partner.audience.items.golf.title": "Golf travellers",
        "partner.audience.items.golf.description": "Golf planning.",
        "partner.audience.items.property.title": "Property buyers and investors",
        "partner.audience.items.property.description": "Investment planning.",
        "partner.audience.items.lifestyle.title": "Premium lifestyle consumers",
        "partner.audience.items.lifestyle.description": "Lifestyle discovery.",
        "partner.placement.badge": "Placement",
        "partner.placement.title": "Curated visibility, not overcrowded advertising",
        "partner.placement.subtitle": "Curated and limited.",
        "partner.placement.items.curated.title": "Homepage visibility is limited",
        "partner.placement.items.curated.description": "Curated areas.",
        "partner.placement.items.relevance.title": "City and category placement depends on fit",
        "partner.placement.items.relevance.description": "Relevant placement.",
        "partner.placement.items.standards.title": "Quality standards remain in place",
        "partner.placement.items.standards.description": "Quality review.",
        "partner.trust.title": "Trust standards protect the platform",
        "partner.trust.subtitle": "No guaranteed bookings.",
        "partner.trust.points.review": "Listings may be reviewed.",
        "partner.trust.points.quality": "Poor-quality businesses may be declined.",
        "partner.trust.points.noGuarantees": "Paid placement remains subject to availability.",
        "partner.hubLinks.title": "Where partners can be discovered",
        "partner.hubLinks.subtitle": "Public hubs.",
        "partner.hubLinks.links.golf": "Golf audience",
        "partner.hubLinks.links.properties": "Property and investor audience",
        "partner.hubLinks.links.relocation": "Relocation audience",
        "partner.hubLinks.links.map": "Map discovery",
      };

      return labels[key] ?? key;
    },
  }),
}));

vi.mock("@/components/navigation/LocaleLink", () => ({
  LocaleLink: ({
    children,
    href,
    className,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("partner commercial sections", () => {
  it("renders localized audience and placement messaging", () => {
    render(
      <>
        <ForWhomSection />
        <PartnerCommercialSections />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Built for premium Algarve businesses" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reach the Algarve audiences that matter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Curated visibility, not overcrowded advertising" })).toBeInTheDocument();
    expect(screen.getByText("No guaranteed bookings.")).toBeInTheDocument();
  });

  it("links partner discovery hubs through internal locale-aware links", () => {
    render(<PartnerCommercialSections />);

    expect(screen.getByRole("link", { name: /Golf audience/ })).toHaveAttribute("href", "/golf");
    expect(screen.getByRole("link", { name: /Property and investor audience/ })).toHaveAttribute("href", "/properties");
    expect(screen.getByRole("link", { name: /Relocation audience/ })).toHaveAttribute("href", "/relocation");
    expect(screen.getByRole("link", { name: /Map discovery/ })).toHaveAttribute("href", "/map");
  });
});
