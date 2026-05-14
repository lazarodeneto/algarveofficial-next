"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LocaleLink } from "@/components/navigation/LocaleLink";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { buildLocalizedPath, type LocalizedPathInput } from "@/lib/i18n/localized-routing";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import {
  MEGA_MENU_SECTIONS,
  type MegaMenuItem,
  type MegaMenuSection,
} from "@/lib/navigation/mega-menu";
import { cn } from "@/lib/utils";

function translated(
  t: ReturnType<typeof useTranslation>["t"],
  key: string,
  fallback: string,
) {
  return t(key, fallback);
}

function useRouteState() {
  const locale = useCurrentLocale();
  const pathname = usePathname() ?? "/";
  const currentPath = stripLocaleFromPathname(pathname).split(/[?#]/)[0] || "/";

  return useMemo(
    () => ({
      currentPath,
      isActive(target: LocalizedPathInput) {
        const path = stripLocaleFromPathname(buildLocalizedPath(locale, target)).split(/[?#]/)[0] || "/";
        return currentPath === path || (path !== "/" && currentPath.startsWith(`${path}/`));
      },
    }),
    [currentPath, locale],
  );
}

function MenuLink({
  item,
  compact = false,
  dense = false,
  onClick,
}: {
  item: MegaMenuItem;
  compact?: boolean;
  dense?: boolean;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const { isActive } = useRouteState();
  const Icon = item.icon;
  const active = isActive(item.href);

  return (
    <NavigationMenuLink asChild>
      <LocaleLink
        href={item.href}
        onClick={onClick}
        className={cn(
          "group flex rounded-lg border border-transparent transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          compact
            ? "items-center gap-3 px-3 py-2.5"
            : dense
              ? "items-start gap-2.5 px-3 py-2"
              : "items-start gap-3 px-3 py-3",
          active
            ? "border-primary/35 bg-primary/10 text-primary"
            : "hover:border-primary/25 hover:bg-primary/8 hover:text-primary",
        )}
      >
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md border border-primary/18 bg-primary/8 text-primary transition group-hover:scale-[1.03]",
            compact || dense ? "h-9 w-9" : "h-10 w-10",
          )}
        >
          <Icon className={compact || dense ? "h-4 w-4" : "h-4.5 w-4.5"} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn("font-fira font-bold leading-tight text-foreground group-hover:text-primary", dense ? "text-[14.95px]" : "text-[1.00625rem]")}>
              {translated(t, item.labelKey, item.fallbackLabel)}
            </span>
            {item.badge ? (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                {item.badge}
              </span>
            ) : null}
          </span>
          {!compact ? (
            <span className={cn("hidden text-xs text-muted-foreground min-[1440px]:block", dense ? "mt-0.5 leading-4" : "mt-1 leading-5")}>
              {item.description}
            </span>
          ) : null}
        </span>
      </LocaleLink>
    </NavigationMenuLink>
  );
}

function FeaturedCard({
  section,
  dense = false,
  onClick,
}: {
  section: MegaMenuSection;
  dense?: boolean;
  onClick?: () => void;
}) {
  const { t } = useTranslation();
  const Icon = section.featuredIcon;

  return (
    <NavigationMenuLink asChild>
      <LocaleLink
        href={section.featuredHref}
        onClick={onClick}
        className={cn(
          "group flex h-full flex-col justify-between rounded-lg border border-primary/20 bg-[linear-gradient(135deg,hsl(var(--background))_0%,rgba(199,163,90,0.13)_100%)] p-3 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.5)] transition hover:border-primary/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          dense ? "min-[1440px]:p-4" : "min-[1440px]:p-5",
        )}
      >
        <span className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary",
          dense ? "min-[1440px]:h-10 min-[1440px]:w-10" : "min-[1440px]:h-11 min-[1440px]:w-11",
        )}>
          <Icon className={cn("h-4.5 w-4.5", dense ? "min-[1440px]:h-4.5 min-[1440px]:w-4.5" : "min-[1440px]:h-5 min-[1440px]:w-5")} aria-hidden="true" />
        </span>
        <span className={cn("mt-4 block", dense ? "min-[1440px]:mt-5" : "min-[1440px]:mt-7")}>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {section.eyebrow}
          </span>
          <span className={cn("mt-2 block font-serif text-lg leading-tight text-foreground", dense ? "min-[1440px]:text-xl" : "min-[1440px]:text-2xl")}>
            {section.featuredLabel}
          </span>
          <span className={cn("mt-3 hidden text-sm text-muted-foreground min-[1440px]:block", dense ? "leading-5" : "leading-6")}>
            {section.featuredDescription}
          </span>
        </span>
        <span className={cn("mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary", dense ? "min-[1440px]:mt-5" : "min-[1440px]:mt-6")}>
          {translated(t, "common.explore", "Explore")}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </LocaleLink>
    </NavigationMenuLink>
  );
}

function MegaPanel({ section, onNavigate }: { section: MegaMenuSection; onNavigate: () => void }) {
  const { t } = useTranslation();
  const isVisit = section.id === "visit";
  const isDensePanel = !isVisit;

  return (
    <div
      className={cn(
        "header-mega-panel rounded-lg border border-black/10 bg-[hsl(var(--background)/0.98)] text-foreground shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/12 dark:bg-[hsl(var(--background)/0.9)]",
        isVisit
          ? "w-[min(720px,calc(100vw-2rem))] translate-x-0 overflow-visible min-[960px]:w-[min(720px,calc(100vw-7rem))] min-[1280px]:w-[min(760px,calc(100vw-9rem))] min-[1280px]:translate-x-14 min-[1360px]:w-[min(820px,calc(100vw-10rem))] min-[1440px]:w-[min(900px,calc(100vw-12rem))] min-[1440px]:translate-x-8"
          : "w-[min(500px,calc(100vw-2rem))] overflow-visible min-[960px]:w-[min(520px,calc(100vw-7rem))] min-[1280px]:w-[min(500px,calc(100vw-9rem))] min-[1360px]:w-[min(600px,calc(100vw-10rem))] min-[1440px]:w-[min(640px,calc(100vw-12rem))]",
      )}
    >
      <div
        className={cn(
          "grid gap-0",
          isVisit
            ? "grid-cols-[150px_minmax(0,1fr)] min-[1360px]:grid-cols-[170px_minmax(0,1fr)] min-[1440px]:grid-cols-[210px_minmax(0,1fr)]"
            : "grid-cols-[175px_minmax(0,1fr)] min-[1360px]:grid-cols-[215px_minmax(0,1fr)] min-[1440px]:grid-cols-[240px_minmax(0,1fr)]",
        )}
      >
        <div className="border-r border-border/80 p-3 min-[1440px]:p-4">
          <FeaturedCard section={section} dense={isDensePanel} onClick={onNavigate} />
        </div>
        <div className={cn("min-w-0 p-4", isDensePanel ? "min-[1440px]:p-4" : "min-[1440px]:p-5")}>
          <div className={cn("mb-3 flex items-end justify-between gap-4", isDensePanel ? "min-[1440px]:mb-3" : "min-[1440px]:mb-4")}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {translated(t, section.labelKey, section.fallbackLabel)}
              </p>
              <p className={cn("mt-1 hidden max-w-xl text-muted-foreground min-[1440px]:block", isDensePanel ? "text-xs leading-5" : "text-sm leading-6")}>
                {section.description}
              </p>
            </div>
          </div>
          <div className={cn("grid gap-1", isVisit ? "grid-cols-3 gap-x-2" : "grid-cols-1")}>
            {section.items.map((item) => (
              <MenuLink key={`${section.id}-${item.labelKey}`} item={item} dense={isDensePanel} onClick={onNavigate} />
            ))}
          </div>
          {section.quickLinks?.length ? (
            <div className="mt-4 border-t border-border/80 pt-3 min-[1440px]:mt-5 min-[1440px]:pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {translated(t, "menu.browseCategories", "Quick links")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {section.quickLinks.map((item) => (
                  <MenuLink
                    key={`${section.id}-quick-${item.labelKey}`}
                    item={item}
                    compact
                    onClick={onNavigate}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HeaderMegaMenu({ overHero = false }: { overHero?: boolean } = {}) {
  const pathname = usePathname() ?? "";
  const { t } = useTranslation();
  const { isActive } = useRouteState();
  const [menuState, setMenuState] = useState({ pathname, activeItem: "" });
  const activeItem = menuState.pathname === pathname ? menuState.activeItem : "";
  const setActiveItem = (nextActiveItem: string) => {
    setMenuState({ pathname, activeItem: nextActiveItem });
  };

  return (
    <NavigationMenu
      value={activeItem}
      onValueChange={setActiveItem}
      className="hidden min-w-0 min-[960px]:flex"
    >
      <NavigationMenuList className="gap-1 xl:gap-1.5 2xl:gap-2">
        {MEGA_MENU_SECTIONS.map((section) => {
          const active = section.items.some((item) => isActive(item.href)) || isActive(section.featuredHref);
          const TriggerIcon = section.featuredIcon;
          return (
            <NavigationMenuItem key={section.id} value={section.id}>
              <NavigationMenuTrigger
                className={cn(
                  "font-fira h-[2.35rem] min-h-[2.35rem] gap-1.5 rounded-full border px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.07em] shadow-none transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-gold hover:text-black hover:brightness-105 hover:shadow-button-hover active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A62A]/55 focus-visible:ring-offset-2 xl:h-10 xl:min-h-10 xl:px-4 xl:text-[0.82rem] min-[1440px]:h-[3.25rem] min-[1440px]:min-h-[3.25rem] min-[1440px]:px-6 min-[1440px]:py-3.5 min-[1440px]:text-base 2xl:px-7",
                  overHero
                    ? "border-white/75 bg-white/[0.94] text-black shadow-[0_14px_34px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-white/75 dark:bg-white/[0.94] dark:text-black"
                    : "border-border/70 bg-transparent text-foreground dark:border-white/18 dark:text-white/90 dark:hover:text-black",
                  "data-[state=open]:border-transparent data-[state=open]:bg-gradient-gold data-[state=open]:text-black data-[state=open]:brightness-105 data-[state=open]:shadow-button-hover",
                  active
                    ? overHero
                      ? "border-primary/45 bg-white text-primary dark:bg-white dark:text-primary"
                      : "border-primary/35 text-primary dark:text-primary"
                    : "",
                )}
                aria-label={translated(t, section.labelKey, section.fallbackLabel)}
              >
                <TriggerIcon className="h-3.5 w-3.5 shrink-0 min-[1440px]:h-4 min-[1440px]:w-4" aria-hidden="true" />
                <span>{translated(t, section.labelKey, section.fallbackLabel)}</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaPanel section={section} onNavigate={() => setActiveItem("")} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function HeaderCompactNav() {
  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center min-[960px]:flex min-[1280px]:hidden">
      <div className="flex min-w-0 items-center gap-1">
        {MEGA_MENU_SECTIONS.map((section) => {
          const Icon = section.featuredIcon;
          return (
            <LocaleLink
              key={section.id}
              href={section.featuredHref}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/80 bg-white/[0.92] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.07em] text-black shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-gold hover:text-black hover:brightness-105 hover:shadow-button-hover active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A62A]/55 focus-visible:ring-offset-2 dark:border-white/25 dark:bg-white/90 dark:text-black dark:hover:text-black sm:px-4 sm:text-[11px]"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{section.fallbackLabel}</span>
            </LocaleLink>
          );
        })}
      </div>
    </div>
  );
}

export function MobileMegaMenuSections({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();

  return (
    <Accordion
      type="multiple"
      defaultValue={["visit"]}
      className="rounded-lg border border-black/10 bg-white/72 px-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/12 dark:bg-white/5 min-[768px]:px-2"
    >
      {MEGA_MENU_SECTIONS.map((section) => {
        const Icon = section.featuredIcon;
        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-primary/15 last:border-b-0"
          >
            <AccordionTrigger className="min-h-16 gap-3 py-4 text-left no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 min-[768px]:min-h-12 min-[768px]:py-2.5">
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary min-[768px]:h-8 min-[768px]:w-8">
                  <Icon className="h-5 w-5 min-[768px]:h-4 min-[768px]:w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-fira text-lg font-bold uppercase tracking-[0.12em] min-[768px]:text-sm">
                    {translated(t, section.labelKey, section.fallbackLabel)}
                  </span>
                  <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground min-[768px]:hidden">
                    {section.description}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 min-[768px]:pb-3">
              <LocaleLink
                href={section.featuredHref}
                onClick={onNavigate}
                className="mb-3 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/8 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/12 hover:text-primary min-[768px]:mb-2 min-[768px]:px-3 min-[768px]:py-2"
              >
                <span>
                  <span className="block">{section.featuredLabel}</span>
                  <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground min-[768px]:hidden">
                    {section.featuredDescription}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </LocaleLink>
              <div className="grid gap-2 min-[768px]:grid-cols-2 min-[768px]:gap-1.5">
                {[...section.items, ...(section.quickLinks ?? [])].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <LocaleLink
                      key={`${section.id}-mobile-${item.labelKey}`}
                      href={item.href}
                      onClick={onNavigate}
                      className="flex min-h-12 items-center gap-3 rounded-lg border border-black/8 bg-white/80 px-3 py-2.5 text-sm font-semibold transition hover:border-primary/25 hover:text-primary dark:border-white/10 dark:bg-white/10 min-[768px]:min-h-10 min-[768px]:gap-2 min-[768px]:px-2.5 min-[768px]:py-2 min-[768px]:text-xs"
                    >
                      <ItemIcon className="h-4.5 w-4.5 shrink-0 text-primary min-[768px]:h-4 min-[768px]:w-4" aria-hidden="true" />
                      <span className="flex-1">{translated(t, item.labelKey, item.fallbackLabel)}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-primary">
                          {item.badge}
                        </span>
                      ) : null}
                    </LocaleLink>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
