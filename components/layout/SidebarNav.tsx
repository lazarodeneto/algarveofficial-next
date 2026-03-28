"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Binoculars,
  CalendarDays,
  Home,
  Mail,
  Map,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/nav-items";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";

const NAV_ICONS: Record<string, LucideIcon> = {
  "nav.visit": Binoculars,
  "nav.live": Home,
  "nav.invest": TrendingUp,
  "nav.map": Map,
  "nav.events": CalendarDays,
  "nav.contact": Mail,
};

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const currentPath = stripLocaleFromPathname(pathname || "/");

  return (
    <aside className="flex flex-col items-center gap-3">
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
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <LocaleLink
                href={item.href}
                aria-label={label}
                className={clsx(
                  "group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200",
                  "border-transparent text-muted-foreground hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/8 hover:text-primary",
                  isActive
                    ? "border-primary/30 bg-primary/12 text-primary shadow-[0_14px_24px_-18px_rgba(201,163,90,0.75)]"
                    : "bg-transparent"
                )}
              >
                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span
                  className={clsx(
                    "pointer-events-none absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-200",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                  )}
                />
              </LocaleLink>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              sideOffset={12}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] dark:border-white/12 dark:bg-white dark:text-slate-900"
            >
              {label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </aside>
  );
}
