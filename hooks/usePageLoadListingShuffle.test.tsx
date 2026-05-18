import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePageLoadListingShuffle } from "@/hooks/usePageLoadListingShuffle";

let setItemSpy: ReturnType<typeof vi.fn>;

function makeListings(label: string) {
  return [
    { id: "listing-a", label: `${label}-a` },
    { id: "listing-b", label: `${label}-b` },
    { id: "listing-c", label: `${label}-c` },
  ];
}

describe("usePageLoadListingShuffle", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    setItemSpy = vi.fn((key: string, value: string) => {
      values.set(key, value);
    });

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => values.get(key) ?? null),
        setItem: setItemSpy,
        removeItem: vi.fn((key: string) => {
          values.delete(key);
        }),
        clear: vi.fn(() => values.clear()),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not reschedule state when the listing array identity changes with the same ids", () => {
    const { result, rerender } = renderHook(
      ({ listings }) => usePageLoadListingShuffle(listings, "homepage-listings"),
      { initialProps: { listings: makeListings("initial") } },
    );
    const initialOrder = result.current.map((listing) => listing.id);

    for (let index = 0; index < 5; index += 1) {
      rerender({ listings: makeListings(`rerender-${index}`) });
    }

    expect(result.current.map((listing) => listing.id)).toEqual(initialOrder);
    expect(setItemSpy).toHaveBeenCalledTimes(1);
  });

  it("preserves the shuffled order while returning the latest listing objects", () => {
    const { result, rerender } = renderHook(
      ({ listings }) => usePageLoadListingShuffle(listings, "homepage-listings"),
      { initialProps: { listings: makeListings("initial") } },
    );
    const initialOrder = result.current.map((listing) => listing.id);

    rerender({ listings: makeListings("updated") });

    expect(result.current.map((listing) => listing.id)).toEqual(initialOrder);
    expect(result.current.every((listing) => listing.label.startsWith("updated-"))).toBe(true);
  });
});
