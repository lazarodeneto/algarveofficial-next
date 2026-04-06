import { describe, expect, it } from "vitest";

import {
  isAdminFooterEntity,
  resolveAdminFooterTable,
} from "@/lib/admin/footer-contract";

describe("admin footer contract", () => {
  it("accepts only whitelisted footer entities", () => {
    expect(isAdminFooterEntity("sections")).toBe(true);
    expect(isAdminFooterEntity("links")).toBe(true);
    expect(isAdminFooterEntity("menus")).toBe(false);
  });

  it("resolves footer tables by whitelisted entity", () => {
    expect(resolveAdminFooterTable("sections")).toBe("footer_sections");
    expect(resolveAdminFooterTable("links")).toBe("footer_links");
  });
});
