import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarNav } from "./SidebarNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/stay",
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
    ...props
  }: {
    children: ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("SidebarNav", () => {
  it("renders an icon rail with accessible labels when collapsed", () => {
    render(<SidebarNav />);

    expect(screen.getByRole("link", { name: "Stay" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Experiences" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Properties" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Residence" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Invest" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Golf" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Map" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();

    expect(screen.queryByText("Stay")).not.toBeInTheDocument();
    expect(screen.queryByText("Contact")).not.toBeInTheDocument();
  });

  it("renders icon labels when expanded", () => {
    render(<SidebarNav expanded />);

    expect(screen.getByText("Stay")).toBeInTheDocument();
    expect(screen.getByText("Experiences")).toBeInTheDocument();
    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(screen.getByText("Residence")).toBeInTheDocument();
    expect(screen.getByText("Invest")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Golf")).toBeInTheDocument();
    expect(screen.getByText("Map")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });
});
