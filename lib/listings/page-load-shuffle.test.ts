import { describe, expect, it } from "vitest";

import { shuffleItemsForPageLoad } from "@/lib/listings/page-load-shuffle";

type TestItem = {
  id: string;
};

const ids = (items: readonly TestItem[]) => items.map((item) => item.id);

function item(id: string): TestItem {
  return { id };
}

function fixedRandom(value: number) {
  return () => value;
}

describe("shuffleItemsForPageLoad", () => {
  it("changes every visible position compared with the previous order when possible", () => {
    const listings = ["a", "b", "c", "d", "e"].map(item);
    const previousOrder = ids(listings);
    const result = shuffleItemsForPageLoad(
      listings,
      (listing) => listing.id,
      previousOrder,
      fixedRandom(0),
    );

    expect(result).toHaveLength(listings.length);
    expect(new Set(ids(result))).toEqual(new Set(previousOrder));
    result.forEach((listing, index) => {
      expect(listing.id).not.toBe(previousOrder[index]);
    });
  });

  it("uses the incoming order as the first-load reference when no stored order exists", () => {
    const listings = ["one", "two", "three"].map(item);
    const result = shuffleItemsForPageLoad(
      listings,
      (listing) => listing.id,
      null,
      fixedRandom(0),
    );

    result.forEach((listing, index) => {
      expect(listing.id).not.toBe(listings[index].id);
    });
  });

  it("swaps two listings instead of repeating either previous slot", () => {
    const listings = ["a", "b"].map(item);

    expect(
      ids(shuffleItemsForPageLoad(listings, (listing) => listing.id, ["a", "b"], fixedRandom(0))),
    ).toEqual(["b", "a"]);
  });

  it("does not mutate the source listing array", () => {
    const listings = ["a", "b", "c", "d"].map(item);
    const originalOrder = ids(listings);

    shuffleItemsForPageLoad(listings, (listing) => listing.id, originalOrder, fixedRandom(0));

    expect(ids(listings)).toEqual(originalOrder);
  });
});
