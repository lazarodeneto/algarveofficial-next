import { describe, expect, it } from "vitest";

import {
  APP_ROLES,
  getPrimaryAppRole,
  isAdminRole,
  isOwnerAccessRole,
  normalizeAppRole,
  parseAppRole,
} from "./roles";

describe("canonical app roles", () => {
  it("keeps the allowed role list narrow", () => {
    expect(APP_ROLES).toEqual(["admin", "editor", "owner", "viewer_logged"]);
  });

  it("rejects unknown or platform roles", () => {
    expect(parseAppRole("super_admin")).toBeNull();
    expect(parseAppRole("business_owner")).toBeNull();
    expect(parseAppRole("staff")).toBeNull();
    expect(parseAppRole("authenticated")).toBeNull();
    expect(parseAppRole("anon")).toBeNull();
    expect(parseAppRole(null)).toBeNull();
  });

  it("normalizes missing roles to viewer_logged without granting access", () => {
    expect(normalizeAppRole(undefined)).toBe("viewer_logged");
    expect(isAdminRole(undefined)).toBe(false);
    expect(isOwnerAccessRole(undefined)).toBe(false);
  });

  it("uses the same role hierarchy as get_user_role", () => {
    expect(getPrimaryAppRole(["owner", "admin", "viewer_logged"])).toBe("admin");
    expect(getPrimaryAppRole(["viewer_logged", "editor"])).toBe("editor");
    expect(getPrimaryAppRole(["unknown"])).toBe("viewer_logged");
  });
});
