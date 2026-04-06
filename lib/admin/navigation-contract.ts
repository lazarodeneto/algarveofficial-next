export const ADMIN_NAVIGATION_MENUS = ["header", "left"] as const;
export type AdminNavigationMenu = (typeof ADMIN_NAVIGATION_MENUS)[number];

const TABLE_BY_MENU: Record<AdminNavigationMenu, "header_menu_items" | "left_menu_items"> = {
  header: "header_menu_items",
  left: "left_menu_items",
};

export function isAdminNavigationMenu(value: string): value is AdminNavigationMenu {
  return ADMIN_NAVIGATION_MENUS.includes(value as AdminNavigationMenu);
}

export function resolveNavigationTable(menu: AdminNavigationMenu) {
  return TABLE_BY_MENU[menu];
}
