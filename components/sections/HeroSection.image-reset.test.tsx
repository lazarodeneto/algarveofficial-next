import type { ReactNode } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeroSection } from "./HeroSection";

const mockUseHeroSettings = vi.hoisted(() => vi.fn());
const mockUseConnectionQuality = vi.hoisted(() => vi.fn());

vi.mock("next/dynamic", () => ({
  default: () => () => null,
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
  }) => (
    <img
      alt={alt}
      src={typeof src === "string" ? src : src.src}
      className={className}
    />
  ),
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/usePublicHeroSettings", () => ({
  usePublicHeroSettings: () => mockUseHeroSettings(),
}));

vi.mock("@/hooks/useHydratedGlobalSettings", () => ({
  useHydratedGlobalSettings: () => ({ settings: [] }),
}));

vi.mock("@/hooks/useCmsPageBuilder", () => ({
  useCmsPageBuilder: () => ({
    getText: (_key: string, fallback: string) => fallback,
    pageConfig: {
      text: {
        "hero.mediaType": "poster",
        "hero.imageUrl": "https://images.example.com/old-home-hero.jpg",
      },
    },
    textOverrides: {},
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const labels: Record<string, string> = {
        "sections.homepage.hero.titleLead": "The Algarve",
        "sections.homepage.hero.titleHighlight": "Curated",
        "sections.homepage.hero.subtitle": "Homepage subtitle",
        "sections.homepage.hero.label": "Curated for you",
        "sections.homepage.smartSearch.cta": "Explore",
        "sections.homepage.hero.secondaryCta": "Search",
        "hero.loginRequired": "Login required",
        "hero.tripCreated": "Trip created",
      };
      return labels[key] ?? key;
    },
  }),
}));

vi.mock("@/hooks/useConnectionQuality", () => ({
  useConnectionQuality: () => mockUseConnectionQuality(),
}));

vi.mock("@/hooks/useTripPlanner", () => ({
  useTripPlanner: () => ({ createTrip: vi.fn(() => ({ id: "trip-1" })) }),
}));

vi.mock("@/contexts/AuthContextBase", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (path: string) => path,
}));

vi.mock("@/hooks/useCurrentLocale", () => ({
  useCurrentLocale: () => "en",
}));

vi.mock("@/hooks/useHydrated", () => ({
  useHydrated: () => true,
}));

describe("HeroSection image reset behaviour", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    mockUseConnectionQuality.mockReturnValue({ isSlow: false, isMobile: false });
  });

  it("ignores stale CMS hero media when Home Page Editor media is reset", () => {
    mockUseHeroSettings.mockReturnValue({
      isLoading: false,
      hasLocaleTranslation: true,
      settings: {
        hero_media_type: "video",
        hero_video_url: null,
        hero_poster_url: null,
        hero_overlay_intensity: 50,
        hero_title: null,
        hero_subtitle: null,
        hero_cta_primary_text: null,
        hero_cta_primary_link: null,
        hero_cta_secondary_text: null,
        hero_cta_secondary_link: null,
      },
    });

    const { container } = render(<HeroSection />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-black")).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("old-home-hero.jpg");
  });

  it("renders uploaded homepage video after desktop interaction", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("min-width: 1024px"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    mockUseHeroSettings.mockReturnValue({
      isLoading: false,
      hasLocaleTranslation: true,
      settings: {
        updated_at: "2026-05-08T10:00:00.000Z",
        hero_media_type: "video",
        hero_video_url: "https://media.example.com/home-hero.mp4",
        hero_poster_url: null,
        hero_overlay_intensity: 50,
        hero_title: null,
        hero_subtitle: null,
        hero_cta_primary_text: null,
        hero_cta_primary_link: null,
        hero_cta_secondary_text: null,
        hero_cta_secondary_link: null,
      },
    });

    const { container } = render(<HeroSection />);
    expect(container.querySelector("video")).not.toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new Event("pointerdown"));
    });

    expect(container.querySelector("video")).toBeInTheDocument();
    expect(container.querySelector("source")?.getAttribute("src")).toContain("home-hero.mp4");
  });
});
