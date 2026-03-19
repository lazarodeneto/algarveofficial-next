import { useCallback, useMemo, useState } from "react";
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
import { buildLangPath, useLangPrefix } from "@/hooks/useLangPrefix";
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
  const { isAuthenticated, getDashboardPath, user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const langPrefix = useLangPrefix();

  const withLang = useCallback((path: string) => buildLangPath(langPrefix, path), [langPrefix]);
  const loginPath = withLang("/login");
  const resolveHref = useCallback(
    (href: string) => {
      if (/^(https?:\/\/|mailto:|tel:|#)/i.test(href)) return href;
      const normalizedPath = href.startsWith("/") ? href : `/${href}`;
      return withLang(normalizedPath);
    },
    [withLang],
  );

  const memberDashboardPath = isAuthenticated && user ? getDashboardPath(user.role) : loginPath;
  const tripsPath = isAuthenticated ? "/dashboard/trips" : loginPath;
  const favoritesPath = isAuthenticated ? "/dashboard/favorites" : loginPath;
  const messagesPath = isAuthenticated ? "/dashboard/messages" : loginPath;

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
      href: resolveHref(item.href),
      icon: getMenuIcon(item.icon),
      end: Boolean(item.end),
    }));
  }, [resolveHref, t]);

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

  return (
    <ExpandableSidebar
      collapsed={collapsed}
      onToggle={() => setCollapsed((prev) => !prev)}
      logo={<BrandLogo size="sm" showText={!collapsed} className="gap-2" />}
      showHeader={false}
      sections={sections}
      hideSeparators
      desktopExpandedWidthClass="w-72"
      desktopCollapsedWidthClass="w-16"
      mobileToggleClassName="top-24"
      className="lg:!fixed lg:!inset-y-0 lg:!left-0 lg:!h-[100dvh] lg:!max-h-[100dvh] lg:!bg-card lg:!backdrop-blur-none lg:z-[90]"
    />
  );
}
