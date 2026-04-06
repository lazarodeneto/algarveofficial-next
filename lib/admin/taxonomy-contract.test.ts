import { describe, expect, it } from "vitest";

import {
  isAdminTaxonomyEntity,
  resolveAdminTaxonomyTable,
} from "@/lib/admin/taxonomy-contract";

describe("admin taxonomy contract", () => {
  it("accepts only whitelisted taxonomy entities", () => {
    expect(isAdminTaxonomyEntity("cities")).toBe(true);
    expect(isAdminTaxonomyEntity("categories")).toBe(true);
    expect(isAdminTaxonomyEntity("regions")).toBe(true);
  });

  it("resolves taxonomy tables by entity", () => {
    expect(resolveAdminTaxonomyTable("cities")).toBe("cities");
    expect(resolveAdminTaxonomyTable("categories")).toBe("categories");
    expect(resolveAdminTaxonomyTable("regions")).toBe("regions");
  });
});
