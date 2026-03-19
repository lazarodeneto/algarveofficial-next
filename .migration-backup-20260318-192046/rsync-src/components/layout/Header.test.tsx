import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "@/components/router/nextRouterCompat";
import { describe, expect, it, vi } from "vitest";
import { HeaderCompactNav } from "./HeaderMegaMenu";

vi.mock("@/hooks/useHeaderMenu", () => ({
  useHeaderMenu: () => ({ data: [], isLoading: false }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

describe("Header navigation crawlability", () => {
  it("renders primary header navigation as anchors with href values", () => {
    render(
      <MemoryRouter>
        <HeaderCompactNav />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      expect(link).toHaveAttribute("href");
      expect(link.getAttribute("href")).toBeTruthy();
    }
  });
});
