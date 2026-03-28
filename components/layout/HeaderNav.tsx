"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";

const HEADER_NAV_ITEMS = PRIMARY_NAV_ITEMS.filter(
  (item) => item.href !== "/contact" && item.href !== "/map",
);

export function HeaderNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentPath = stripLocaleFromPathname(pathname || "/");
  const ariaLabel = t("nav.primaryNavigation", "Primary navigation");

  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center gap-5 text-[1.02rem] font-medium tracking-[-0.02em] text-foreground/86 xl:gap-6 xl:text-[1.08rem] 2xl:gap-7 2xl:text-[1.12rem]"
    >
      {HEADER_NAV_ITEMS.map((item) => {
        const isActive =
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(`${item.href}/`));

        return (
          <LocaleLink
            key={item.href}
            href={item.href}
            className={clsx(
              "relative whitespace-nowrap py-1.5 transition-colors duration-200 hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100",
              isActive ? "font-semibold text-foreground after:scale-x-100" : ""
            )}
          >
            {t(item.labelKey, item.fallbackLabel)}
          </LocaleLink>
        );
      })}
    </nav>
  );
}
