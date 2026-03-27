"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";

export function HeaderNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentPath = stripLocaleFromPathname(pathname || "/");
  const ariaLabel = t("nav.primaryNavigation", "Primary navigation");

  return (
    <nav aria-label={ariaLabel} className="flex items-center gap-6">
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive =
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(`${item.href}/`));

        return (
          <LocaleLink
            key={item.href}
            href={item.href}
            className={clsx(
              "transition-opacity hover:opacity-70",
              isActive ? "font-semibold underline underline-offset-4" : ""
            )}
          >
            {t(item.labelKey)}
          </LocaleLink>
        );
      })}
    </nav>
  );
}
