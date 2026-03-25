"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import i18n from "@/lib/i18n/i18n";
import {
  Heart,
  LayoutDashboard,
  MessageSquare,
  Plane,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ExpandableSidebar, type SidebarNavSection } from "@/components/navigation/ExpandableSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { getMenuIcon } from "@/lib/menu-icons";

const fallbackPrimaryItems = [
  { label: "Home", href: "/", icon: "Home", end: true },
  { label: "Visit", href: "/directory", icon: "Binoculars" },
  { label: "Live", href: "/live", icon: "Link" },
  { label: "Invest", href: "/invest", icon: "TrendingUp" },
  { label: "Destinations", href: "/destinations", icon: "Compass" },
  { label: "Map", href: "/map", icon: "MapPin" },
  { label: "Blog", href: "/blog", icon: "BookOpen" },
  { label: "Events", href: "/events", icon: "Calendar" },
];

export function PublicSiteSidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, getDashboardPath, user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const l = useLocalizedHref();

  // ✅ Extract locale from URL (source of truth)
  const pathname = usePathname();
  const locale = pathname?.split("/")[1];

  // ✅ CRITICAL: Force i18n to sync with URL locale
  // This prevents stale i18n.language causing sidebar desync on back/forward/fast navigation
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  const loginPath = l("/login");
  const memberDashboardPath = isAuthenticated && user ? getDashboardPath(user.role) : loginPath;
  const tripsPath = isAuthenticated ? l("/dashboard/trips") : loginPath;
  const favoritesPath = isAuthenticated ? l("/dashboard/favorites") : loginPath;
  const messagesPath = isAuthenticated ? l("/dashboard/messages") : loginPath;

  const primaryItems = useMemo(() => {
    return fallbackPrimaryItems.map((item) => ({
      label:
        item.label === "Home" ? t("nav.home", "Home")
        : item.label === "Visit" ? t("nav.visit", "Visit")
        : item.label === "Live" ? t("nav.live", "Live")
        : item.label === "Invest" ? t("nav.invest", "Invest")
        : item.label === "Destinations" ? t("nav.destinations", "Destinations")
        : item.label === "Map" ? t("nav.map", "Map")
        : item.label === "Blog" ? t("nav.blog", "Blog")
        : item.label === "Events" ? t("nav.events", "Events")
        : item.label,
      href: l(item.href),
      icon: getMenuIcon(item.icon),
      end: Boolean(item.end),
    }));
  }, [l, t]);

  const sections: SidebarNavSection[] = useMemo(
    () => [
      {
        id: "public-nav",
        items: [
          ...primaryItems,
          { label: t("nav.account", "Account"), href: memberDashboardPath, icon: LayoutDashboard },
          { label: t("nav.myTrip", "My Trips"), href: tripsPath, icon: Plane },
          {
            label: t("dashboard.favorites.title", "Favorites"),
            href: favoritesPath,
            icon: Heart,
          },
          {
            label: t("nav.messages", "Messages"),
            href: messagesPath,
            icon: MessageSquare,
          },
        ],
      },
    ],
    [t, primaryItems, memberDashboardPath, tripsPath, favoritesPath, messagesPath],
  );

  const prefetchHrefs = useMemo(
    () =>
      sections
        .flatMap((section) => section.items.map((item) => item.href))
        .filter((href): href is string => typeof href === "string" && href.startsWith("/")),
    [sections],
  );

  useEffect(() => {
    const uniqueHrefs = Array.from(new Set(prefetchHrefs));
    uniqueHrefs.forEach((href) => {
      router.prefetch(href);
    });
  }, [prefetchHrefs, router]);

  return (
    <ExpandableSidebar
      collapsed={collapsed}
      onToggle={() => setCollapsed((prev) => !prev)}
      logo={<BrandLogo size="sm" showText={!collapsed} className="gap-2" />}
      showHeader={false}
      disableMobile
      desktopBreakpoint="xl"
      sections={sections}
      hideSeparators
      disableCollapsedTooltips
      desktopExpandedWidthClass="w-72"
      desktopCollapsedWidthClass="w-16"
      mobileToggleClassName="top-24"
      className="lg:!fixed lg:!inset-y-0 lg:!top-0 lg:!left-0 lg:!h-screen lg:!min-h-screen lg:!max-h-none lg:!border-y-0 lg:!rounded-none lg:!bg-background lg:!backdrop-blur-none lg:!shadow-none lg:z-[120]"
    />
  );
}
