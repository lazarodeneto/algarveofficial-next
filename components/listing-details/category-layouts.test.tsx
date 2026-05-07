import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PremiumAccommodationLayout } from "./PremiumAccommodationLayout";
import { ShoppingLayout } from "./ShoppingLayout";

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
});
