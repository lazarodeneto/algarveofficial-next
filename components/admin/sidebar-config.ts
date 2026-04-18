import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Newspaper,
  PencilRuler,
  Settings2,
  Tags,
} from "lucide-react";

type NavBadgeKey = "inbox";

export interface AdminNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  exact?: boolean;
  aliases?: string[];
  badgeKey?: NavBadgeKey;
  badgeLabel?: string;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

// Extensible sidebar configuration: add, remove, or reorder groups/items here.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
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
        badgeKey: "inbox",
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
    ],
  },
  {
    id: "content",
    label: "CONTENT",
    items: [
      {
        id: "builder",
        label: "Page Builder",
        href: "/admin/content/page-builder",
        icon: PencilRuler,
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
    id: "growth",
    label: "GROWTH",
    items: [
      {
        id: "marketing",
        label: "Marketing",
        href: "/admin/email",
        icon: Megaphone,
        badgeLabel: "Soon",
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
];
