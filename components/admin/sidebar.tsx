"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Inbox,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Newspaper,
  Settings2,
  Sparkles,
  Tags,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LocaleLink } from "@/components/navigation/LocaleLink";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Badge } from "@/components/ui/badge";
import { useInboxUrgentCount } from "@/hooks/useInboxUrgentCount";
import { useLocalePath } from "@/hooks/useLocalePath";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  aliases?: string[];
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface LocalizedNavItem extends NavItem {
  href: string;
  aliases: string[];
}

interface LocalizedNavGroup {
  id: string;
  label: string;
  items: LocalizedNavItem[];
}

function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isItemActive(pathname: string, item: LocalizedNavItem): boolean {
  if (isActivePath(pathname, item.href, item.exact)) {
    return true;
  }

  return item.aliases.some((alias) => isActivePath(pathname, alias));
}

export function Sidebar() {
  const pathname = usePathname();
  const l = useLocalePath();

  const { data: inboxCounts } = useInboxUrgentCount();
  const urgentCount = inboxCounts?.urgentCount ?? 0;
  const soonCount = inboxCounts?.soonCount ?? 0;
  const inboxBadge = urgentCount > 0 ? urgentCount : soonCount > 0 ? soonCount : undefined;

  const navGroups = useMemo<NavGroup[]>(
    () => [
      {
        id: "workspace",
        label: "WORKSPACE",
        items: [
          {
            id: "overview",
            label: "Overview",
            href: "/admin",
            icon: LayoutDashboard,
            exact: true,
          },
          {
            id: "inbox",
            label: "Inbox",
            href: "/admin/inbox",
            icon: Inbox,
            badge: inboxBadge,
          },
          {
            id: "analytics",
            label: "Analytics",
            href: "/admin/analytics",
            icon: BarChart3,
          },
        ],
      },
      {
        id: "hubs",
        label: "HUBS",
        items: [
          {
            id: "owners",
            label: "Owners",
            href: "/admin/crm",
            aliases: ["/admin/owners"],
            icon: Building2,
          },
          {
            id: "listings",
            label: "Listings",
            href: "/admin/listings",
            icon: Newspaper,
          },
          {
            id: "categories",
            label: "Categories",
            href: "/admin/categories",
            icon: Tags,
          },
        ],
      },
      {
        id: "growth",
        label: "GROWTH",
        items: [
          {
            id: "marketing",
            label: "Marketing",
            href: "/admin/email",
            icon: Megaphone,
          },
          {
            id: "ai-image-gen",
            label: "AI Image Gen",
            href: "/admin/images",
            icon: Sparkles,
          },
        ],
      },
      {
        id: "content",
        label: "CONTENT",
        items: [
          {
            id: "blog",
            label: "Blog",
            href: "/admin/blog",
            icon: FileText,
          },
          {
            id: "events",
            label: "Events",
            href: "/admin/content/events",
            aliases: ["/admin/events"],
            icon: CalendarDays,
          },
          {
            id: "regions-cities",
            label: "Regions / Cities",
            href: "/admin/content/regions",
            aliases: ["/admin/content/cities"],
            icon: MapPinned,
          },
        ],
      },
      {
        id: "system",
        label: "SYSTEM",
        items: [
          {
            id: "settings",
            label: "Settings",
            href: "/admin/settings",
            icon: Settings2,
          },
        ],
      },
    ],
    [inboxBadge],
  );

  const groups = useMemo<LocalizedNavGroup[]>(
    () =>
      navGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          href: l(item.href),
          aliases: (item.aliases ?? []).map((alias) => l(alias)),
        })),
      })),
    [navGroups, l],
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.map((group) => [group.id, true])),
  );

  useEffect(() => {
    setOpenGroups((current) => {
      let changed = false;
      const next = { ...current };

      for (const group of groups) {
        const hasActiveItem = group.items.some((item) => isItemActive(pathname, item));
        if (hasActiveItem && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [groups, pathname]);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border/70 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.22)_100%)]">
      <div className="border-b border-border/70 px-4 py-4">
        <LocaleLink href="/admin" className="inline-flex items-center">
          <BrandLogo size="sm" showIcon showText className="gap-2" />
        </LocaleLink>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/85">
          Admin Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <section key={group.id}>
            <button
              type="button"
              onClick={() =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.id]: !current[group.id],
                }))
              }
              className="flex w-full items-center justify-between px-1 py-1 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90"
              aria-expanded={openGroups[group.id]}
              aria-controls={`admin-sidebar-group-${group.id}`}
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  openGroups[group.id] ? "rotate-180" : "rotate-0",
                )}
              />
            </button>

            {openGroups[group.id] ? (
              <ul id={`admin-sidebar-group-${group.id}`} className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const active = isItemActive(pathname, item);
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <LocaleLink
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                          "hover:border-border/80 hover:bg-muted/40 hover:text-foreground",
                          active
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-transparent text-muted-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground/80",
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <Badge
                            variant={urgentCount > 0 ? "destructive" : "secondary"}
                            className="h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        ) : null}
                      </LocaleLink>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        ))}
      </nav>

      <div className="border-t border-border/70 px-3 py-3">
        <p className="text-xs text-muted-foreground">AlgarveOfficial Admin</p>
      </div>
    </aside>
  );
}
