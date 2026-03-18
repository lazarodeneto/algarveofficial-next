import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  MessageSquare,
  User,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ExpandableSidebar, type SidebarNavSection } from "@/components/navigation/ExpandableSidebar";
import { useSupabaseFavoritesCount } from "@/hooks/useSupabaseFavoritesCount";
import { useUserUnreadMessagesCount } from "@/hooks/useUserUnreadMessagesCount";
import { useTranslation } from "react-i18next";

interface UserSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function UserSidebar({ collapsed, onToggle }: UserSidebarProps) {
  const { t } = useTranslation();
  const { data: unreadMessagesCount = 0 } = useUserUnreadMessagesCount();
  const { data: favoritesCount = 0 } = useSupabaseFavoritesCount();

  const sections: SidebarNavSection[] = [
    {
      id: "user-main",
      items: [
        { label: t("dashboard.sidebar.overview"), href: "/dashboard", icon: LayoutDashboard, end: true },
        { label: t("dashboard.sidebar.tripPlanner"), href: "/dashboard/trips", icon: CalendarDays },
        {
          label: t("dashboard.sidebar.favorites"),
          href: "/dashboard/favorites",
          icon: Heart,
          badge: favoritesCount > 0 ? favoritesCount : undefined,
          badgeTone: "primary",
        },
        {
          label: t("dashboard.sidebar.messages"),
          href: "/dashboard/messages",
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          badgeTone: "primary",
        },
        { label: t("dashboard.sidebar.profile"), href: "/dashboard/profile", icon: User },
      ],
    },
  ];

  return (
    <ExpandableSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      logo={<BrandLogo size="sm" showIcon={collapsed} showText={!collapsed} className="gap-2" />}
      sections={sections}
      footerText={t("dashboard.footer")}
    />
  );
}
