import {
  CalendarDays,
  Crown,
  HelpCircle,
  Image,
  LayoutDashboard,
  List,
  MessageSquare,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ExpandableSidebar, type SidebarNavSection } from "@/components/navigation/ExpandableSidebar";
import { useOwnerUnreadMessagesCount } from "@/hooks/useOwnerUnreadMessagesCount";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";

interface OwnerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function OwnerSidebar({ collapsed, onToggle }: OwnerSidebarProps) {
  const { t } = useTranslation();
  const l = useLocalePath();
  const { data: unreadCount = 0 } = useOwnerUnreadMessagesCount();

  const sections: SidebarNavSection[] = [
    {
      id: "owner-main",
      items: [
        { label: t("owner.sidebar.overview"), href: l("/owner"), icon: LayoutDashboard, end: true },
        { label: t("owner.sidebar.myListings"), href: l("/owner/listings"), icon: List },
        { label: t("owner.sidebar.myEvents"), href: l("/owner/events"), icon: CalendarDays },
        { label: t("owner.sidebar.photosMedia"), href: l("/owner/media"), icon: Image },
        { label: t("owner.sidebar.membership"), href: l("/owner/membership"), icon: Crown },
        {
          label: t("owner.sidebar.messages"),
          href: l("/owner/messages"),
          icon: MessageSquare,
          badge: unreadCount > 0 ? unreadCount : undefined,
          badgeTone: "primary",
        },
        { label: t("owner.sidebar.support"), href: l("/owner/support"), icon: HelpCircle },
      ],
    },
  ];

  return (
    <ExpandableSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      logo={<BrandLogo size="sm" showIcon={collapsed} showText className="gap-2" />}
      desktopBreakpoint="xl"
      sections={sections}
      footerText={t("owner.footer")}
    />
  );
}
