import { describe, expect, it } from "vitest";

import {
  isAdminNavigationMenu,
  resolveNavigationTable,
} from "@/lib/admin/navigation-contract";

describe("admin navigation contract", () => {
  it("validates allowed admin navigation menus", () => {
    expect(isAdminNavigationMenu("header")).toBe(true);
    expect(isAdminNavigationMenu("left")).toBe(true);
    expect(isAdminNavigationMenu("footer")).toBe(false);
  });

  it("resolves menu tables from whitelisted menu ids", () => {
    expect(resolveNavigationTable("header")).toBe("header_menu_items");
    expect(resolveNavigationTable("left")).toBe("left_menu_items");
  });
});
