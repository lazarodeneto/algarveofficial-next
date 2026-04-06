export const ADMIN_FOOTER_ENTITIES = ["sections", "links"] as const;
export type AdminFooterEntity = (typeof ADMIN_FOOTER_ENTITIES)[number];

const FOOTER_TABLE_BY_ENTITY: Record<AdminFooterEntity, "footer_sections" | "footer_links"> = {
  sections: "footer_sections",
  links: "footer_links",
};

export function isAdminFooterEntity(value: string): value is AdminFooterEntity {
  return ADMIN_FOOTER_ENTITIES.includes(value as AdminFooterEntity);
}

export function resolveAdminFooterTable(entity: AdminFooterEntity) {
  return FOOTER_TABLE_BY_ENTITY[entity];
}
