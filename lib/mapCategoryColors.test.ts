import { describe, expect, it } from "vitest";
import { getCategoryMapColor } from "@/lib/mapCategoryColors";

describe("getCategoryMapColor", () => {
  it("uses orange for beach markers", () => {
    expect(getCategoryMapColor("beaches")).toBe("#f97316");
  });

  it("keeps beach clubs visually distinct from beach markers", () => {
    expect(getCategoryMapColor("beaches-clubs")).toBe("#0ea5e9");
  });
});
