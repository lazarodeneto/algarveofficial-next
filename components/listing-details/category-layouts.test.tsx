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
    t: (key: string, options?: { count?: number; defaultValue?: string }) => {
      if (key === "categoryLayouts.accommodation.stars") {
        return `${options?.count ?? 0} stars`;
      }
      return options?.defaultValue ?? key;
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

  it("renders structured beach practical details, nearby items, and FAQ content", () => {
    render(
      <BeachesLayout
        details={{
          parking_info: "Parking is listed by the official tourism source.",
          accessibility_info: "Access involves stairs.",
          lifeguard_info: "Seasonal supervision should be checked locally.",
          blue_flag_info: "Blue Flag status was not verified for the current year.",
          nearby_beaches: [
            {
              name: "Praia Vizinha",
              description: "A nearby published beach listing.",
              href: "/listing/praia-vizinha",
              verification_status: "Verified",
            },
          ],
          nearby_restaurants: [
            {
              name: "Restaurante Teste",
              type: "Restaurant",
              description: "Official website verified nearby restaurant.",
              slug: "restaurante-teste",
              url: "https://example.com",
            },
          ],
          nearby_attractions: [
            {
              name: "Coastal Trail",
              type: "Walking trail",
              description: "A verified coastal route.",
              slug: "coastal-trail",
            },
          ],
          faq_items: [
            {
              question: "Where is Praia Teste?",
              answer: "Praia Teste is in Lagoa.",
            },
          ],
        }}
        listingName="Praia Teste"
        cityName="Lagoa"
      />,
    );

    expect(screen.getByText("Practical details")).toBeInTheDocument();
    expect(screen.getByText("Parking")).toHaveClass("font-fira", "font-bold");
    expect(screen.getByText("Parking is listed by the official tourism source.")).toBeInTheDocument();
    expect(screen.getByText("Nearby beaches")).toBeInTheDocument();
    expect(screen.getByText("Praia Vizinha")).toHaveClass("font-fira", "font-bold");
    expect(screen.getByText("Nearby restaurants")).toBeInTheDocument();
    expect(screen.getByText("Restaurante Teste")).toHaveClass("font-fira", "font-bold");
    expect(screen.getByRole("link", { name: /Restaurante Teste/ })).toHaveAttribute("href", "/listing/restaurante-teste");
    expect(screen.getByText("Nearby attractions")).toBeInTheDocument();
    expect(screen.getByText("Coastal Trail")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("Where is Praia Teste?")).toHaveClass("font-fira", "font-bold");
  });

  it("does not let stale localized beach details override verified base content", () => {
    render(
      <BeachesLayout
        locale="pt-pt"
        details={{
          last_verified_at: "2026-05-18",
          full_description: "New verified beach description.",
          parking_info: "Verified parking detail.",
          localized_content: {
            "pt-pt": {
              full_description: "Old translated beach description.",
            },
          },
        }}
        listingName="Praia Teste"
        cityName="Lagoa"
      />,
    );

    expect(screen.getByText("New verified beach description.")).toBeInTheDocument();
    expect(screen.queryByText("Old translated beach description.")).not.toBeInTheDocument();
    expect(screen.getByText("Verified parking detail.")).toBeInTheDocument();
  });

  it("renders nearby business cards for beach pages with internal listing links", () => {
    render(
      <BeachesLayout
        details={{ highlights: ["Verified beach context"] }}
        listingName="Praia Teste"
        cityName="Lagoa"
        nearbyBusinessListings={[
          {
            id: "business-1",
            slug: "restaurante-teste",
            name: "Restaurante Teste",
            short_description: "Published restaurant listing close to the beach.",
            featured_image_url: null,
            updated_at: null,
            distance_km: 1.2,
            city: { name: "Lagoa" },
            category: { name: "Restaurants", slug: "restaurants" },
          },
        ]}
      />,
    );

    expect(screen.getAllByText("Nearby businesses").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Restaurante Teste").at(-1)).toHaveClass("font-fira", "font-bold");
    expect(screen.getByText("Restaurants · Lagoa · ~1.2 km")).toBeInTheDocument();
    const restaurantLinks = screen.getAllByRole("link", { name: /Restaurante Teste/ });
    expect(restaurantLinks[restaurantLinks.length - 1]).toHaveAttribute("href", "/listing/test");
  });

  it("does not render unrelated fallback nearby listing cards for beach pages", () => {
    render(
      <BeachesLayout
        details={{ highlights: ["Verified beach context"] }}
        listingName="Praia Teste"
        cityName="Lagoa"
        nearbyListings={[
          {
            id: "far-1",
            slug: "far-beach",
            name: "Far Beach",
            featured_image_url: null,
            city: { name: "Aljezur" },
          },
        ]}
      />,
    );

    expect(screen.queryByText("Far Beach")).not.toBeInTheDocument();
    expect(screen.queryByText("More attractions near Lagoa")).not.toBeInTheDocument();
  });

  it("does not render a beach map from fallback coordinates when category data explicitly has no coordinates", () => {
    render(
      <BeachesLayout
        details={{
          coordinates: {
            latitude: null,
            longitude: null,
          },
        }}
        listingName="Praia Sem Coordenadas"
        cityName="Carvoeiro"
        latitude={37.096196}
        longitude={-8.472004}
      />,
    );

    expect(screen.queryByText("listing.location")).not.toBeInTheDocument();
  });
});
