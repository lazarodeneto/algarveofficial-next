export const ADMIN_SETTINGS_TABLES = [
  "privacy_settings",
  "terms_settings",
  "cookie_settings",
  "cookie_banner_settings",
  "contact_settings",
  "partner_settings",
  "support_settings",
  "site_settings",
] as const;

export type AdminSettingsTable = (typeof ADMIN_SETTINGS_TABLES)[number];

const DEFAULT_ID_TABLES = new Set<AdminSettingsTable>([
  "cookie_settings",
  "cookie_banner_settings",
  "contact_settings",
  "partner_settings",
  "support_settings",
  "site_settings",
]);

export function isAdminSettingsTable(value: string): value is AdminSettingsTable {
  return ADMIN_SETTINGS_TABLES.includes(value as AdminSettingsTable);
}

export function sanitizeAdminSettingsUpdates(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const updates = { ...(raw as Record<string, unknown>) };
  delete updates.id;
  delete updates.created_at;
  return updates;
}

export function normalizeAdminSettingsMode(mode: unknown) {
  return mode === "update" ? "update" : "upsert";
}

export function normalizeAdminSettingsId(table: AdminSettingsTable, bodyId: unknown) {
  if (DEFAULT_ID_TABLES.has(table)) return "default";
  if (typeof bodyId === "string" && bodyId.trim().length > 0) return bodyId.trim();
  return "default";
}
