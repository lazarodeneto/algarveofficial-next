import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeQuickLinksSection } from "./HomeQuickLinksSection";

const mockUseGlobalSettings = vi.hoisted(() => vi.fn());

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
    onError,
  }: {
    alt: string;
    src: string | { src: string };
    className?: string;
    onError?: () => void;
  }) => (
    <img
      alt={alt}
      src={typeof src === "string" ? src : src.src}
      className={className}
      onError={onError}
    />
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const labels: Record<string, string> = {
        "sections.homepage.quickLinks.items.stay.title": "Stay",
        "sections.homepage.quickLinks.items.eatDrink.title": "Eat & Drink",
        "sections.homepage.quickLinks.items.thingsToDo.title": "Things to Do",
        "sections.homepage.quickLinks.items.golf.title": "Golf",
        "sections.homepage.quickLinks.items.realEstate.title": "Real Estate",
        "sections.homepage.quickLinks.items.events.title": "Events",
        "sections.homepage.common.explore": "Explore",
      };

      return labels[key] ?? fallback ?? key;
    },
  }),
}));

vi.mock("@/hooks/useLocalePath", () => ({
  useLocalePath: () => (path: any) => {
    if (typeof path === "string") return path;
    if (path?.routeType === "category") return `/category/${path.slugs.en}`;
    return "/";
  },
}));

vi.mock("@/hooks/useGlobalSettings", () => ({
  useGlobalSettings: () => mockUseGlobalSettings(),
}));

describe("HomeQuickLinksSection", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mockUseGlobalSettings.mockReturnValue({
      settings: [],
      isLoading: false,
    });
  });

  it("renders black placeholders instead of fallback artwork when no custom images are set", () => {
    const { container } = render(<HomeQuickLinksSection />);

    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(container.querySelectorAll("[aria-hidden='true'].bg-black")).toHaveLength(6);
  });

  it("renders black when a custom image fails to load", () => {
    mockUseGlobalSettings.mockReturnValue({
      settings: [
        {
          key: "home_card_events_image",
          value: "https://images.unsplash.com/broken-whats-on.jpg",
          category: "homepage",
        },
      ],
      isLoading: false,
    });

    render(<HomeQuickLinksSection />);

    const whatsOnImage = screen.getByAltText("Events");
    expect(whatsOnImage).toHaveAttribute("src", "https://images.unsplash.com/broken-whats-on.jpg");

    fireEvent.error(whatsOnImage);

    expect(screen.queryByAltText("Events")).not.toBeInTheDocument();
  });

  it("falls back to the uploaded image when a saved video fails to load", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("min-width: 1024px"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 });
      return 1;
    });
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    mockUseGlobalSettings.mockReturnValue({
      settings: [
        {
          key: "home_card_events_image",
          value: "https://images.unsplash.com/custom-whats-on.jpg",
          category: "homepage",
        },
        {
          key: "home_card_events_video",
          value: "https://videos.example.com/custom-whats-on.mp4",
          category: "homepage",
        },
      ],
      isLoading: false,
    });

    const { container } = render(<HomeQuickLinksSection />);

    const video = await waitFor(() => container.querySelector("video"));
    expect(video).toBeTruthy();

    fireEvent.error(video!);

    expect(screen.getByAltText("Events")).toHaveAttribute(
      "src",
      "https://images.unsplash.com/custom-whats-on.jpg",
    );
  });

  it("reserves room for wrapped localized titles", () => {
    render(<HomeQuickLinksSection />);

    const wrappedTitle = screen.getByRole("heading", { name: "Real Estate" });

    expect(wrappedTitle.className).toContain("text-balance");
    expect(wrappedTitle.className).toContain("font-fira");
    expect(wrappedTitle.className).toContain("font-black");
    expect(wrappedTitle.className).toContain("min-h-[2.35em]");
    expect(wrappedTitle.className).toContain("text-[clamp(1.12rem,6vw,1.5rem)]");
    expect(wrappedTitle.className).toContain("sm:text-[clamp(1.04rem,3.1vw,1.48rem)]");
    expect(wrappedTitle.className).toContain("[overflow-wrap:normal]");
    expect(wrappedTitle.className).toContain("lg:text-[1.28rem]");
  });

  it("stacks the cards vertically on mobile widths", () => {
    const { container } = render(<HomeQuickLinksSection />);

    const layout = container.querySelector("#home-quick-links .app-container > div:last-of-type");
    const firstCard = screen.getAllByRole("link")[0];

    expect(layout?.className).toContain("grid");
    expect(layout?.className).not.toContain("overflow-x-auto");
    expect(firstCard.className).toContain("aspect-[4/3]");
    expect(firstCard.className).not.toContain("flex-none");
  });
});
