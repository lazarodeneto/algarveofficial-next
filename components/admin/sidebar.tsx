"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent } from "react";
import { usePathname } from "next/navigation";

import {
  ADMIN_NAV_GROUPS,
  type AdminNavGroup,
  type AdminNavItem,
} from "@/components/admin/sidebar-config";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Badge } from "@/components/ui/badge";
import { useInboxUrgentCount } from "@/hooks/useInboxUrgentCount";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";

interface LocalizedNavItem extends Omit<AdminNavItem, "href" | "aliases" | "badgeKey"> {
  href: string;
  aliases: string[];
  badge?: number;
}

interface LocalizedNavGroup extends Omit<AdminNavGroup, "items"> {
  items: LocalizedNavItem[];
}

function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: LocalizedNavItem): boolean {
  if (isActivePath(pathname, item.href, item.exact)) {
    return true;
  }
  return item.aliases.some((alias) => isActivePath(pathname, alias));
}

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const l = useLocalePath();
  const asideRef = useRef<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: inboxCounts } = useInboxUrgentCount();
  const urgentCount = inboxCounts?.urgentCount ?? 0;
  const soonCount = inboxCounts?.soonCount ?? 0;
  const inboxBadge = urgentCount > 0 ? urgentCount : soonCount > 0 ? soonCount : undefined;

  const groups = useMemo<LocalizedNavGroup[]>(
    () =>
      ADMIN_NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          href: l(item.href),
          aliases: (item.aliases ?? []).map((alias) => l(alias)),
          badge: item.badgeKey === "inbox" ? inboxBadge : undefined,
        })),
      })),
    [inboxBadge, l],
  );

  const clearExpandTimer = () => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  };

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const queueExpand = (delay = 70) => {
    clearCollapseTimer();
    clearExpandTimer();
    expandTimerRef.current = setTimeout(() => {
      setExpanded(true);
      expandTimerRef.current = null;
    }, delay);
  };

  const queueCollapse = (delay = 130) => {
    clearExpandTimer();
    clearCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setExpanded(false);
      collapseTimerRef.current = null;
    }, delay);
  };

  useEffect(
    () => () => {
      clearExpandTimer();
      clearCollapseTimer();
    },
    [],
  );

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    const nextFocused = event.relatedTarget;

    if (!nextFocused || !asideRef.current?.contains(nextFocused as Node)) {
      queueCollapse(70);
    }
  };

  return (
    <aside
      ref={asideRef}
      onMouseEnter={() => queueExpand()}
      onMouseLeave={() => queueCollapse()}
      onFocusCapture={() => {
        clearExpandTimer();
        clearCollapseTimer();
        setExpanded(true);
      }}
      onBlurCapture={handleBlurCapture}
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden transform-gpu lg:flex flex-col overflow-hidden border-r border-border bg-background/95 backdrop-blur-xl shadow-[0_20px_48px_-36px_rgba(15,23,42,0.45)]",
        "will-change-[width] motion-safe:transition-[width,box-shadow] motion-safe:duration-300 motion-safe:ease-premium motion-reduce:transition-none",
        expanded ? "w-60" : "w-20",
      )}
    >
      <div
        className={cn(
          "flex h-20 items-center border-b border-border/80 transition-[padding,justify-content] duration-300",
          expanded ? "justify-start px-4" : "justify-center px-3",
        )}
      >
        <LocaleLink
          href="/admin"
          aria-label="Admin Dashboard"
          className={cn(
            "flex h-12 items-center overflow-hidden rounded-2xl border border-border/70 bg-white/80 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.45)] transition-[width,padding,gap,transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_30px_-22px_rgba(15,23,42,0.45)] dark:bg-white/10",
            expanded ? "w-full gap-3 px-4" : "w-12 justify-center",
          )}
        >
          <BrandLogo
            size="sm"
            showIcon
            showText={false}
            asLink={false}
            className="justify-center"
            iconClassName="h-6 w-6 shrink-0"
          />
          <span
            className={cn(
              "truncate font-serif text-lg font-normal tracking-tight transition-[max-width,opacity] duration-200 ease-out",
              expanded ? "max-w-[9.5rem] opacity-100" : "max-w-0 opacity-0",
            )}
            aria-hidden={!expanded}
          >
            <span className="brand-logo-algarve text-gradient-gold">Algarve</span>
            <span className="brand-logo-official text-foreground">Official</span>
          </span>
        </LocaleLink>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <nav
          aria-hidden={!expanded}
          className={cn(
            "absolute inset-0 space-y-1 px-3 py-5 motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out",
            expanded
              ? "translate-x-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden opacity-100"
              : "pointer-events-none -translate-x-1 overflow-hidden opacity-0",
          )}
        >
          {groups.map((group) => (
            <section key={group.id}>
              <ul id={`admin-sidebar-group-${group.id}`} className="space-y-1">
                {group.items.map((item) => {
                  const active = isItemActive(pathname, item);
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <LocaleLink
                        href={item.href}
                        tabIndex={expanded ? 0 : -1}
                        className={cn(
                          "group relative flex h-12 w-full items-center gap-3 rounded-2xl border px-4 text-sm transition-all duration-200",
                          "hover:translate-x-1 hover:border-primary/25 hover:bg-primary/10 hover:text-primary",
                          active
                            ? "border-primary/20 bg-primary/10 text-foreground shadow-[0_16px_32px_-24px_rgba(201,163,90,0.65)]"
                            : "border-transparent bg-transparent text-muted-foreground",
                        )}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200">
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                              active ? "text-primary" : "text-muted-foreground/80",
                            )}
                          />
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate",
                            active && "font-semibold text-foreground",
                          )}
                        >
                          {item.label}
                        </span>
                        {item.badge ? (
                          <Badge
                            variant={urgentCount > 0 ? "destructive" : "secondary"}
                            className="h-5 min-w-5 rounded-full px-1.5 text-[10px] shadow-sm"
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        ) : item.badgeLabel ? (
                          <Badge
                            variant="outline"
                            className="h-5 rounded-full border-primary/30 px-1.5 text-[10px] text-primary"
                          >
                            {item.badgeLabel}
                          </Badge>
                        ) : null}
                        <span
                          className={cn(
                            "pointer-events-none absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-200",
                            active ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                          )}
                        />
                      </LocaleLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        <nav
          aria-hidden={expanded}
          className={cn(
            "absolute inset-0 px-3 py-5 motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out",
            expanded
              ? "pointer-events-none translate-x-1 overflow-hidden opacity-0"
              : "translate-x-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden opacity-100",
          )}
        >
          <div className="flex flex-col gap-3">
            {groups.map((group, groupIndex) => (
              <section key={group.id} className="space-y-2">
                {groupIndex > 0 ? <div className="mx-2 border-t border-border/70" /> : null}
                <ul className="space-y-2">
                  {group.items.map((item) => {
                    const active = isItemActive(pathname, item);
                    const Icon = item.icon;

                    return (
                      <li key={item.id} className="flex justify-center">
                        <LocaleLink
                          href={item.href}
                          tabIndex={expanded ? -1 : 0}
                          aria-label={item.label}
                          title={item.label}
                          className={cn(
                            "group relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200",
                            "hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/8 hover:text-primary",
                            active
                              ? "border-primary/30 bg-primary/12 text-primary shadow-[0_14px_24px_-18px_rgba(201,163,90,0.75)]"
                              : "border-transparent text-muted-foreground",
                          )}
                        >
                          <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                          {item.badge ? (
                            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                              {item.badge > 9 ? "9+" : item.badge}
                            </span>
                          ) : null}
                          <span
                            className={cn(
                              "pointer-events-none absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity duration-200",
                              active ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                            )}
                          />
                        </LocaleLink>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
      </div>

      <div className="border-t border-border/70 px-4 py-3">
        {expanded ? <p className="text-xs text-muted-foreground">AlgarveOfficial Admin</p> : null}
      </div>
    </aside>
  );
}
