import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PremiumAccommodationLayout } from "./PremiumAccommodationLayout";
import { BeachesLayout } from "./BeachesLayout";
import { ShoppingLayout } from "./ShoppingLayout";

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (href: unknown) => (typeof href === "string" ? href : "/listing/test"),
}));

vi.mock("@/components/ListingImage", () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      if (key === "categoryLayouts.accommodation.stars") {
        return `${options?.count ?? 0} stars`;
      }
      return key;
    },
  }),
}));

describe("category-specific listing layouts", () => {
  it("does not render shopping sections for empty shopping category data", () => {
    const { container } = render(<ShoppingLayout details={{}} />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("categoryLayouts.shopping.shoppingExperience")).not.toBeInTheDocument();
    expect(screen.queryByText("Boutique")).not.toBeInTheDocument();
  });

  it("renders shopping details only when shopping category data exists", () => {
    render(<ShoppingLayout details={{ shop_type: "concept_store" }} />);

    expect(screen.getByText("categoryLayouts.shopping.shoppingExperience")).toBeInTheDocument();
    expect(screen.getByText("Concept Store")).toBeInTheDocument();
  });

  it("does not render accommodation sections for empty accommodation category data", () => {
    const { container } = render(<PremiumAccommodationLayout details={{}} />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("categoryLayouts.accommodation.highlights")).not.toBeInTheDocument();
    expect(screen.queryByText("N/A")).not.toBeInTheDocument();
  });

  it("renders accommodation details only when accommodation category data exists", () => {
    render(<PremiumAccommodationLayout details={{ accommodation_type: "villa", star_rating: 5 }} />);

    expect(screen.getByText("categoryLayouts.accommodation.highlights")).toBeInTheDocument();
    expect(screen.getByText("Villa")).toBeInTheDocument();
    expect(screen.getByText("5 stars")).toBeInTheDocument();
  });

  it("renders the beach detail order with expandable description and nearby listings", () => {
    render(
      <BeachesLayout
        details={{
          highlights: ["Cliff views"],
          what_to_bring: ["Water"],
        }}
        fallbackDescription={`${"A scenic beach description. ".repeat(30)}`}
        listingName="Praia Teste"
        cityName="Lagoa"
        tags={["cliffs"]}
        latitude={37.09}
        longitude={-8.41}
        nearbyListings={[
          {
            id: "nearby-1",
            slug: "nearby-beach",
            name: "Nearby Beach",
            featured_image_url: null,
            city: { name: "Lagoa" },
          },
        ]}
      />,
    );

    expect(screen.getByText("categoryLayouts.beach.highlights")).toBeInTheDocument();
    expect(screen.getByText("Cliff views")).toBeInTheDocument();
    expect(screen.getByText("listing.location")).toBeInTheDocument();
    expect(screen.getAllByText("Praia Teste, Lagoa, Algarve Portugal").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "categoryLayouts.beach.seeMore" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText("Nearby Beach")).toBeInTheDocument();
    expect(screen.getByText("categoryLayouts.beach.relatedBeachTags")).toBeInTheDocument();
  });

  it("renders the beach location map from category data coordinates", () => {
    render(
      <BeachesLayout
        details={{
          coordinates: {
            latitude: "37.09",
            longitude: "-8.41",
          },
        }}
        listingName="Praia Coordenada"
        cityName="Lagoa"
      />,
    );

    expect(screen.getByText("listing.location")).toBeInTheDocument();
    expect(screen.getAllByText("Praia Coordenada, Lagoa, Algarve Portugal").length).toBeGreaterThan(0);
  });
});
