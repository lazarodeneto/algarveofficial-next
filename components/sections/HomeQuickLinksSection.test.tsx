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
      if (key === "categoryNames.whats-on") {
        return "Wat Er te Doen Is";
      }

      return fallback ?? key;
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

  it("renders all three cards with themed fallback artwork when no custom images are set", () => {
    render(<HomeQuickLinksSection />);

    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByAltText("Things to Do")).toHaveAttribute(
      "src",
      "/home-quick-links/things-to-do.svg",
    );
    expect(screen.getByAltText("Places to Stay")).toHaveAttribute(
      "src",
      "/home-quick-links/places-to-stay.svg",
    );
    expect(screen.getByAltText("Wat Er te Doen Is")).toHaveAttribute(
      "src",
      "/home-quick-links/whats-on.svg",
    );
  });

  it("falls back to the themed image when a custom image fails to load", () => {
    mockUseGlobalSettings.mockReturnValue({
      settings: [
        {
          key: "home_card_whats_on_image",
          value: "https://images.example.com/broken-whats-on.jpg",
          category: "homepage",
        },
      ],
      isLoading: false,
    });

    render(<HomeQuickLinksSection />);

    const whatsOnImage = screen.getByAltText("Wat Er te Doen Is");
    expect(whatsOnImage).toHaveAttribute("src", "https://images.example.com/broken-whats-on.jpg");

    fireEvent.error(whatsOnImage);

    expect(screen.getByAltText("Wat Er te Doen Is")).toHaveAttribute(
      "src",
      "/home-quick-links/whats-on.svg",
    );
  });

  it("falls back to the uploaded image when a saved video fails to load", () => {
    mockUseGlobalSettings.mockReturnValue({
      settings: [
        {
          key: "home_card_whats_on_image",
          value: "https://images.example.com/custom-whats-on.jpg",
          category: "homepage",
        },
        {
          key: "home_card_whats_on_video",
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

    expect(screen.getByAltText("Wat Er te Doen Is")).toHaveAttribute(
      "src",
      "https://images.example.com/custom-whats-on.jpg",
    );
  });

  it("reserves room for wrapped localized titles", () => {
    render(<HomeQuickLinksSection />);

    const wrappedTitle = screen.getByRole("heading", { name: "Wat Er te Doen Is" });

    expect(wrappedTitle.className).toContain("text-balance");
    expect(wrappedTitle.className).toContain("sm:min-h-[3.5rem]");
  });

  it("stacks the cards vertically on mobile widths", () => {
    const { container } = render(<HomeQuickLinksSection />);

    const layout = container.querySelector("#home-quick-links .app-container > div");
    const firstCard = screen.getAllByRole("link")[0];

    expect(layout?.className).toContain("flex-col");
    expect(layout?.className).not.toContain("overflow-x-auto");
    expect(firstCard.className).toContain("w-full");
    expect(firstCard.className).not.toContain("flex-none");
  });
});
