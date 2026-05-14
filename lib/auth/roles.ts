import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type AdminRole = Extract<AppRole, "admin" | "editor">;
export type AdminOnlyRole = Extract<AppRole, "admin">;
export type OwnerAccessRole = Extract<AppRole, "owner" | "admin">;

export const APP_ROLES = ["admin", "editor", "owner", "viewer_logged"] as const satisfies readonly AppRole[];
export const APP_ADMIN_ROLES = ["admin", "editor"] as const satisfies readonly AdminRole[];
export const APP_ADMIN_ONLY_ROLES = ["admin"] as const satisfies readonly AdminOnlyRole[];
export const APP_OWNER_ACCESS_ROLES = ["owner", "admin"] as const satisfies readonly OwnerAccessRole[];
export const DEFAULT_AUTHENTICATED_ROLE = "viewer_logged" satisfies AppRole;

export const APP_ROLE_SET: ReadonlySet<AppRole> = new Set(APP_ROLES);
export const APP_ADMIN_ROLE_SET: ReadonlySet<AppRole> = new Set(APP_ADMIN_ROLES);
export const APP_OWNER_ACCESS_ROLE_SET: ReadonlySet<AppRole> = new Set(APP_OWNER_ACCESS_ROLES);

const ROLE_RANK: Record<AppRole, number> = {
  admin: 1,
  editor: 2,
  owner: 3,
  viewer_logged: 4,
};

export function parseAppRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  const role = value.trim() as AppRole;
  return APP_ROLE_SET.has(role) ? role : null;
}

export function normalizeAppRole(
  value: unknown,
  fallback: AppRole = DEFAULT_AUTHENTICATED_ROLE,
): AppRole {
  return parseAppRole(value) ?? fallback;
}

export function isAdminRole(value: unknown): value is AdminRole {
  const role = parseAppRole(value);
  return Boolean(role && APP_ADMIN_ROLE_SET.has(role));
}

export function isOwnerAccessRole(value: unknown): value is OwnerAccessRole {
  const role = parseAppRole(value);
  return Boolean(role && APP_OWNER_ACCESS_ROLE_SET.has(role));
}

export function isRoleAllowed(value: unknown, allowedRoles: readonly AppRole[]): value is AppRole {
  const role = parseAppRole(value);
  return Boolean(role && allowedRoles.includes(role));
}

export function getPrimaryAppRole(values: readonly unknown[]): AppRole {
  const roles = values
    .map(parseAppRole)
    .filter((role): role is AppRole => role !== null)
    .sort((left, right) => ROLE_RANK[left] - ROLE_RANK[right]);

  return roles[0] ?? DEFAULT_AUTHENTICATED_ROLE;
}
