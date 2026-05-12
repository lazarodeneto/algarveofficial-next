import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "./MobileBottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/stay",
}));

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (href: string) => href,
}));

vi.mock("@/contexts/MobileMenuContext", () => ({
  useMobileMenu: () => ({ mobileMenuOpen: false }),
}));

vi.mock("@/hooks/useMobileChromeScrollState", () => ({
  useMobileChromeScrollState: () => ({ isUserScrolling: false }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

describe("MobileBottomNav", () => {
  it("uses the same public links as the desktop sidebar", () => {
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: "Stay" })).toHaveAttribute("href", "/stay");
    expect(screen.getByRole("link", { name: "Experiences" })).toHaveAttribute("href", "/experiences");
    expect(screen.getByRole("link", { name: "Beaches" })).toHaveAttribute("href", "/beaches");
    expect(screen.getByRole("link", { name: "Wellness" })).toHaveAttribute("href", "/category/wellness-spas");
    expect(screen.getByRole("link", { name: "Golf" })).toHaveAttribute("href", "/golf");
    expect(screen.getByRole("link", { name: "Properties" })).toHaveAttribute("href", "/properties");
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: "Relocation" })).toHaveAttribute("href", "/relocation");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });
});
