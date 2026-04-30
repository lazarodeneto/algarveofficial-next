import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
  useLocalePath: () => (path: string) => path,
}));

vi.mock("@/hooks/useGlobalSettings", () => ({
  useGlobalSettings: () => mockUseGlobalSettings(),
}));

describe("HomeQuickLinksSection", () => {
  beforeEach(() => {
    mockUseGlobalSettings.mockReturnValue({
      settings: [],
      isLoading: false,
    });
  });

  it("renders all six cards with themed fallback artwork when no custom images are set", () => {
    render(<HomeQuickLinksSection />);

    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(screen.getByAltText("Stay")).toHaveAttribute(
      "src",
      "/home-quick-links/places-to-stay.svg",
    );
    expect(screen.getByAltText("Eat & Drink")).toHaveAttribute(
      "src",
      "/home-quick-links/things-to-do.svg",
    );
    expect(screen.getByAltText("Things to Do")).toHaveAttribute(
      "src",
      "/home-quick-links/things-to-do.svg",
    );
    expect(screen.getByAltText("Golf")).toHaveAttribute(
      "src",
      "/home-quick-links/things-to-do.svg",
    );
    expect(screen.getByAltText("Real Estate")).toHaveAttribute(
      "src",
      "/home-quick-links/places-to-stay.svg",
    );
    expect(screen.getByAltText("Events")).toHaveAttribute(
      "src",
      "/home-quick-links/whats-on.svg",
    );
  });

  it("falls back to the themed image when a custom image fails to load", () => {
    mockUseGlobalSettings.mockReturnValue({
      settings: [
        {
          key: "home_card_events_image",
          value: "https://images.example.com/broken-whats-on.jpg",
          category: "homepage",
        },
      ],
      isLoading: false,
    });

    render(<HomeQuickLinksSection />);

    const whatsOnImage = screen.getByAltText("Events");
    expect(whatsOnImage).toHaveAttribute("src", "https://images.example.com/broken-whats-on.jpg");

    fireEvent.error(whatsOnImage);

    expect(screen.getByAltText("Events")).toHaveAttribute(
      "src",
      "/home-quick-links/whats-on.svg",
    );
  });

  it("falls back to the uploaded image when a saved video fails to load", () => {
    mockUseGlobalSettings.mockReturnValue({
      settings: [
        {
          key: "home_card_events_image",
          value: "https://images.example.com/custom-whats-on.jpg",
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

    const video = container.querySelector("video");
    expect(video).toBeTruthy();

    fireEvent.error(video!);

    expect(screen.getByAltText("Events")).toHaveAttribute(
      "src",
      "https://images.example.com/custom-whats-on.jpg",
    );
  });

  it("reserves room for wrapped localized titles", () => {
    render(<HomeQuickLinksSection />);

    const wrappedTitle = screen.getByRole("heading", { name: "Real Estate" });

    expect(wrappedTitle.className).toContain("break-words");
    expect(wrappedTitle.className).toContain("lg:text-[1.15rem]");
  });

  it("stacks the cards vertically on mobile widths", () => {
    const { container } = render(<HomeQuickLinksSection />);

    const layout = container.querySelector("#home-quick-links .app-container > div");
    const firstCard = screen.getAllByRole("link")[0];

    expect(layout?.className).toContain("grid");
    expect(layout?.className).not.toContain("overflow-x-auto");
    expect(firstCard.className).toContain("aspect-[4/3]");
    expect(firstCard.className).not.toContain("flex-none");
  });
});
