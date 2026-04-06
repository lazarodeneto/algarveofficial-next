export const ADMIN_TAXONOMY_ENTITIES = ["cities", "categories", "regions"] as const;
export type AdminTaxonomyEntity = (typeof ADMIN_TAXONOMY_ENTITIES)[number];

const TABLE_BY_ENTITY: Record<AdminTaxonomyEntity, "cities" | "categories" | "regions"> = {
  cities: "cities",
  categories: "categories",
  regions: "regions",
};

export function isAdminTaxonomyEntity(value: string): value is AdminTaxonomyEntity {
  return ADMIN_TAXONOMY_ENTITIES.includes(value as AdminTaxonomyEntity);
}

export function resolveAdminTaxonomyTable(entity: AdminTaxonomyEntity) {
  return TABLE_BY_ENTITY[entity];
}
