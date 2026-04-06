import { describe, expect, it } from "vitest";

import {
  isAdminEmailEntity,
  resolveAdminEmailTable,
} from "@/lib/admin/email-contract";

describe("admin email contract", () => {
  it("accepts whitelisted email entities", () => {
    expect(isAdminEmailEntity("templates")).toBe(true);
    expect(isAdminEmailEntity("segments")).toBe(true);
    expect(isAdminEmailEntity("campaigns")).toBe(true);
    expect(isAdminEmailEntity("contacts")).toBe(false);
  });

  it("maps email entities to expected tables", () => {
    expect(resolveAdminEmailTable("templates")).toBe("email_templates");
    expect(resolveAdminEmailTable("segments")).toBe("email_segments");
    expect(resolveAdminEmailTable("campaigns")).toBe("email_campaigns");
  });
});
