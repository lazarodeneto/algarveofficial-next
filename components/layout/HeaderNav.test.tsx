import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeaderNav } from "./HeaderNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/events",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
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

describe("HeaderNav", () => {
  it("renders the desktop header nav without the contact item", () => {
    render(<HeaderNav />);

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toHaveClass("uppercase");
    expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Contact" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Map" })).not.toBeInTheDocument();
    expect(screen.queryByText("nav.contact")).not.toBeInTheDocument();
    expect(document.querySelectorAll("svg")).toHaveLength(4);
  });
});
