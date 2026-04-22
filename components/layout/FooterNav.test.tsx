import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FooterNav } from "./FooterNav";

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

describe("FooterNav", () => {
  it("renders footer labels instead of raw translation keys", () => {
    render(<FooterNav />);

    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookie Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of Service" })).toBeInTheDocument();

    expect(screen.queryByRole("link", { name: "About Us" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
    expect(screen.queryByText("nav.privacy")).not.toBeInTheDocument();
    expect(screen.queryByText("nav.cookies")).not.toBeInTheDocument();
    expect(screen.queryByText("nav.terms")).not.toBeInTheDocument();
  });
});
