import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PremiumCard } from "./premium-card";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    className,
  }: {
    alt: string;
    src: string | { src: string };
    className?: string;
    children?: ReactNode;
  }) => (
    <img
      alt={alt}
      src={typeof src === "string" ? src : src.src}
      className={className}
    />
  ),
}));

describe("PremiumCard image reset behaviour", () => {
  it("renders a black image area when homepage-managed card media is empty", () => {
    const { container } = render(
      <PremiumCard title="Lagos" imageUrl="" emptyImageMode="black" />,
    );

    expect(screen.getByLabelText("Lagos image not set")).toHaveClass("bg-black");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("keeps valid image URLs rendering normally", () => {
    render(
      <PremiumCard
        title="Lagos"
        imageUrl="https://images.unsplash.com/lagos.jpg"
        emptyImageMode="black"
      />,
    );

    expect(screen.getByAltText("Lagos")).toHaveAttribute(
      "src",
      "https://images.unsplash.com/lagos.jpg",
    );
    expect(screen.queryByLabelText("Lagos image not set")).not.toBeInTheDocument();
  });

  it("renders black when the CMS image URL is invalid or unsupported", () => {
    const { container } = render(
      <PremiumCard
        title="Lagos"
        imageUrl="https://unsupported.example/lagos.jpg"
        emptyImageMode="black"
      />,
    );

    expect(screen.getByLabelText("Lagos image not set")).toHaveClass("bg-black");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
