import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrandLogo } from "./brand-logo";

const mockState = vi.hoisted(() => ({
  hydrated: true,
  resolvedTheme: "light" as "light" | "dark",
  settings: null as { logo_url?: string | null; site_name?: string | null } | null,
}));

vi.mock("next/link", () => ({
  default: ({
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

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    className,
  }: {
    alt: string;
    src: string | { src: string };
    className?: string;
  }) => <img alt={alt} src={typeof src === "string" ? src : src.src} className={className} />,
}));

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (path: string) => path,
}));

vi.mock("@/hooks/useHydrated", () => ({
  useHydrated: () => mockState.hydrated,
}));

vi.mock("@/hooks/useSiteSettings", () => ({
  useSiteSettings: () => ({
    settings: mockState.settings,
  }),
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockState.resolvedTheme,
    resolvedTheme: mockState.resolvedTheme,
    setTheme: vi.fn(),
  }),
}));

describe("BrandLogo", () => {
  it("uses the official gold icon on light backgrounds by default", () => {
    mockState.hydrated = true;
    mockState.resolvedTheme = "light";
    mockState.settings = null;

    render(<BrandLogo showIcon showText={false} asLink={false} />);

    expect(screen.getByAltText("Algarve Official crown mark")).toHaveAttribute(
      "src",
      "/algarveofficial-icon-gold.png",
    );
  });

  it("uses the official white icon on dark backgrounds by default", () => {
    mockState.hydrated = true;
    mockState.resolvedTheme = "dark";
    mockState.settings = null;

    render(<BrandLogo showIcon showText={false} asLink={false} />);

    expect(screen.getByAltText("Algarve Official crown mark")).toHaveAttribute(
      "src",
      "/algarveofficial-icon-white.png",
    );
  });

  it("allows forcing the black icon for light surfaces", () => {
    mockState.hydrated = true;
    mockState.resolvedTheme = "light";
    mockState.settings = null;

    render(<BrandLogo showIcon showText={false} asLink={false} iconTone="black" />);

    expect(screen.getByAltText("Algarve Official crown mark")).toHaveAttribute(
      "src",
      "/algarveofficial-icon-black.png",
    );
  });
});
