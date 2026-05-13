import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";

vi.mock("next/image", () => ({
  default: ({ alt, src, className }: { alt: string; src: string; className?: string }) => (
    <img alt={alt} src={src} className={className} />
  ),
}));

describe("HeroBackgroundMedia CMS image safety", () => {
  it("normalizes public asset paths before rendering", () => {
    render(<HeroBackgroundMedia imageUrl="images/hero.webp" alt="Hero" />);

    expect(screen.getByAltText("Hero")).toHaveAttribute("src", "/images/hero.webp");
  });

  it("renders black instead of a broken image for invalid CMS images", () => {
    const { container } = render(
      <HeroBackgroundMedia imageUrl="https://unsupported.example/hero.webp" alt="Hero" />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-black")).toBeInTheDocument();
  });

  it("does not render an empty image src for reset media", () => {
    const { container } = render(<HeroBackgroundMedia imageUrl="" alt="Hero" />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('src=""');
  });

  it("renders an explicit black fallback for disabled hero media", () => {
    const { container } = render(
      <HeroBackgroundMedia
        mediaType="none"
        imageUrl="/images/hero.webp"
        posterUrl="/images/poster.webp"
        videoUrl="https://cdn.algarveofficial.com/hero.mp4"
        alt="Hero"
        fallback={<img alt="Default fallback" src="/images/default.webp" />}
      />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Default fallback")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-black")).toBeInTheDocument();
  });

  it("uses poster fallback for YouTube media because public YouTube backgrounds are not embedded", () => {
    render(
      <HeroBackgroundMedia
        mediaType="youtube"
        youtubeUrl="https://www.youtube.com/watch?v=abc123"
        posterUrl="/images/poster.webp"
        alt="Hero poster"
      />,
    );

    expect(screen.getByAltText("Hero poster")).toHaveAttribute("src", "/images/poster.webp");
  });
});
