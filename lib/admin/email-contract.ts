export const ADMIN_EMAIL_ENTITIES = [
  "templates",
  "segments",
  "campaigns",
  "contacts",
  "automations",
] as const;

export type AdminEmailEntity = (typeof ADMIN_EMAIL_ENTITIES)[number];

const TABLE_BY_ENTITY: Record<
  AdminEmailEntity,
  "email_templates" | "email_segments" | "email_campaigns" | "email_contacts" | "email_automations"
> = {
  templates: "email_templates",
  segments: "email_segments",
  campaigns: "email_campaigns",
  contacts: "email_contacts",
  automations: "email_automations",
};

export function isAdminEmailEntity(value: string): value is AdminEmailEntity {
  return ADMIN_EMAIL_ENTITIES.includes(value as AdminEmailEntity);
}

export function resolveAdminEmailTable(entity: AdminEmailEntity) {
  return TABLE_BY_ENTITY[entity];
}
