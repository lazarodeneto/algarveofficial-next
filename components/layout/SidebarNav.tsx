"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Binoculars,
  CalendarDays,
  Compass,
  Home,
  Mail,
  Map,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";

const NAV_ICONS: Record<string, LucideIcon> = {
  "nav.visit": Binoculars,
  "nav.stay": Binoculars,
  "nav.live": Home,
  "nav.invest": TrendingUp,
  "nav.properties": TrendingUp,
  "nav.experiences": Compass,
  "nav.map": Map,
  "nav.events": CalendarDays,
  "nav.contact": Mail,
};

interface SidebarNavProps {
  expanded?: boolean;
}

export function SidebarNav({ expanded = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentPath = stripLocaleFromPathname(pathname || "/");

  return (
    <nav className={clsx("flex flex-col gap-2", expanded ? "items-stretch" : "items-center")}>
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive =
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(`${item.href}/`));
        const Icon = NAV_ICONS[item.labelKey];
        const label = t(item.labelKey, item.fallbackLabel);

        if (!Icon) {
          return null;
        }

        return (
          <LocaleLink
            key={item.href}
            href={item.href}
            aria-label={label}
            className={clsx(
              "group relative flex items-center rounded-2xl border transition-all duration-200",
              expanded ? "h-12 w-full justify-start gap-3 px-4" : "h-12 w-12 justify-center",
              "border-transparent text-muted-foreground hover:border-primary/25 hover:bg-primary/8 hover:text-primary",
              expanded ? "hover:translate-x-1" : "hover:-translate-y-0.5",
              isActive
                ? expanded
                  ? "border-primary/20 bg-primary/10 text-foreground shadow-[0_16px_32px_-24px_rgba(201,163,90,0.65)]"
                  : "border-primary/30 bg-primary/12 text-primary shadow-[0_14px_24px_-18px_rgba(201,163,90,0.75)]"
                : "bg-transparent"
            )}
          >
            <span
              className={clsx(
                "flex items-center justify-center rounded-xl transition-colors duration-200",
                expanded ? "h-9 w-9 shrink-0" : "h-11 w-11",
              )}
            >
              <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </span>
            {expanded ? (
              <span className={clsx("truncate text-[1rem] font-medium", isActive && "font-semibold text-foreground")}>
                {label}
              </span>
            ) : null}
            <span
              className={clsx(
                "pointer-events-none absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
              )}
            />
          </LocaleLink>
        );
      })}
    </nav>
  );
}
