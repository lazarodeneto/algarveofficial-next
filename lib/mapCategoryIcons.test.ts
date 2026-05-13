import { Sun, Waves } from "lucide-react";
import { describe, expect, it } from "vitest";

import { getMapCategoryIcon } from "@/lib/mapCategoryIcons";

describe("getMapCategoryIcon", () => {
  it("uses the Lucide Sun icon for beach listing markers", () => {
    expect(getMapCategoryIcon("beaches")).toBe(Sun);
  });

  it("keeps beach clubs visually distinct from beach listings", () => {
    expect(getMapCategoryIcon("beaches-clubs")).toBe(Waves);
  });
});
