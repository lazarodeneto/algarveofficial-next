import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoftReveal } from "./SoftReveal";

const originalMatchMedia = window.matchMedia;
const originalIntersectionObserver = window.IntersectionObserver;

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  });
}

describe("SoftReveal", () => {
  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
    window.IntersectionObserver = originalIntersectionObserver;
    vi.restoreAllMocks();
  });

  it("server-renders children visible before client enhancement", () => {
    const html = renderToString(
      <SoftReveal>
        <p>Premium section content</p>
      </SoftReveal>,
    );

    expect(html).toContain("Premium section content");
    expect(html).toContain("opacity:1");
    expect(html).toContain("translate3d(0, 0, 0)");
  });

  it("respects reduced motion preferences", async () => {
    mockMatchMedia(true);
    window.IntersectionObserver = vi.fn() as unknown as typeof IntersectionObserver;

    render(
      <SoftReveal>
        <p>Accessible motion content</p>
      </SoftReveal>,
    );

    await waitFor(() => {
      expect(screen.getByText("Accessible motion content").parentElement).toHaveAttribute(
        "data-reduced-motion",
        "true",
      );
    });
    expect(screen.getByText("Accessible motion content").parentElement).toHaveStyle({
      transitionProperty: "none",
    });
    expect(window.IntersectionObserver).not.toHaveBeenCalled();
  });

  it("does not use layout-shifting animation properties", () => {
    render(
      <SoftReveal>
        <p>Stable layout content</p>
      </SoftReveal>,
    );

    const wrapper = screen.getByText("Stable layout content").parentElement;
    expect(wrapper).toHaveStyle({
      transitionProperty: "opacity, transform",
    });
    expect(wrapper?.style.top).toBe("");
    expect(wrapper?.style.left).toBe("");
    expect(wrapper?.style.width).toBe("");
    expect(wrapper?.style.height).toBe("");
  });
});
