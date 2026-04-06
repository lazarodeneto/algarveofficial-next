import { describe, expect, it } from "vitest";

import {
  isAdminSettingsTable,
  normalizeAdminSettingsId,
  normalizeAdminSettingsMode,
  sanitizeAdminSettingsUpdates,
} from "@/lib/admin/settings-contract";

describe("admin settings contract", () => {
  it("accepts only whitelisted tables", () => {
    expect(isAdminSettingsTable("privacy_settings")).toBe(true);
    expect(isAdminSettingsTable("contact_settings")).toBe(true);
    expect(isAdminSettingsTable("global_settings")).toBe(false);
  });

  it("enforces default id for singleton settings tables", () => {
    expect(normalizeAdminSettingsId("contact_settings", "pt")).toBe("default");
    expect(normalizeAdminSettingsId("site_settings", null)).toBe("default");
  });

  it("keeps explicit locale ids for localized legal settings", () => {
    expect(normalizeAdminSettingsId("privacy_settings", "pt")).toBe("pt");
    expect(normalizeAdminSettingsId("terms_settings", "")).toBe("default");
  });

  it("sanitizes immutable columns from payload updates", () => {
    expect(
      sanitizeAdminSettingsUpdates({
        id: "pt",
        created_at: "old",
        page_title: "Privacy",
      }),
    ).toEqual({ page_title: "Privacy" });

    expect(sanitizeAdminSettingsUpdates([])).toBeNull();
    expect(sanitizeAdminSettingsUpdates(null)).toBeNull();
  });

  it("normalizes mode to a safe default", () => {
    expect(normalizeAdminSettingsMode("update")).toBe("update");
    expect(normalizeAdminSettingsMode("upsert")).toBe("upsert");
    expect(normalizeAdminSettingsMode("anything-else")).toBe("upsert");
  });
});
