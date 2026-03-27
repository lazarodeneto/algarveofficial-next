"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentPath = stripLocaleFromPathname(pathname || "/");

  return (
    <aside className="flex flex-col gap-3">
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive =
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(`${item.href}/`));

        return (
          <LocaleLink
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-lg px-3 py-2 transition-colors hover:bg-black/5",
              isActive ? "bg-black/10 font-semibold" : ""
            )}
          >
            {t(item.labelKey)}
          </LocaleLink>
        );
      })}
    </aside>
  );
}
