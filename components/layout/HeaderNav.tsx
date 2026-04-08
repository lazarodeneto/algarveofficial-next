"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  BedDouble,
  Binoculars,
  CalendarDays,
  FlagTriangleRight,
  Home,
  HouseHeart,
  type LucideIcon,
} from "lucide-react";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";

const HEADER_NAV_ITEMS = PRIMARY_NAV_ITEMS.filter(
  (item) => item.href !== "/contact" && item.href !== "/map" && item.href !== "/events" && item.href !== "/live",
);

const HEADER_NAV_ICONS: Record<string, LucideIcon> = {
  "nav.visit": Binoculars,
  "nav.stay": BedDouble,
  "nav.live": Home,
  "nav.invest": HouseHeart,
  "nav.properties": HouseHeart,
  "nav.experiences": Binoculars,
  "nav.golf": FlagTriangleRight,
  "nav.events": CalendarDays,
};

export function HeaderNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentPath = stripLocaleFromPathname(pathname || "/");
  const ariaLabel = t("nav.primaryNavigation", "Primary navigation");

  return (
    <nav
      aria-label={ariaLabel}
      className="font-['Archivo_Narrow'] flex items-center gap-2.5 text-[0.82rem] font-medium uppercase tracking-[0.04em] text-foreground/86 lg:text-[0.88rem] lg:tracking-[0.05em] xl:gap-4 xl:text-[0.95rem] xl:tracking-[0.065em] 2xl:gap-5 2xl:text-[1.22rem] 2xl:tracking-[0.08em]"
    >
      {HEADER_NAV_ITEMS.map((item) => {
        const itemPath = item.href.split("?")[0];
        const isActive =
          currentPath === itemPath ||
          (itemPath !== "/" && currentPath.startsWith(`${itemPath}/`));
        const Icon = HEADER_NAV_ICONS[item.labelKey];
        const label = t(item.labelKey, item.fallbackLabel);

        return (
          <LocaleLink
            key={item.href}
            href={item.href}
            className={clsx(
              "relative inline-flex items-center gap-1.5 whitespace-nowrap py-1.5 transition-colors duration-200 hover:text-foreground xl:gap-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100",
              isActive ? "font-semibold text-foreground after:scale-x-100" : ""
            )}
          >
            {Icon ? <Icon aria-hidden="true" className="h-[0.95rem] w-[0.95rem] shrink-0 text-current/80" /> : null}
            <span>{label}</span>
          </LocaleLink>
        );
      })}
    </nav>
  );
}
