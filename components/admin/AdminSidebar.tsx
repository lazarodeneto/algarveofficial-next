import {
  BarChart3,
  CalendarDays,
  FileText,
  Footprints,
  Gem,
  HelpCircle,
  Home,
  Image,
  Inbox as InboxIcon,
  Languages,
  Layers,
  List,
  Mail,
  MapPin,
  Menu,
  Mountain,
  PanelLeft,
  PenSquare,
  PieChart,
  Send,
  Settings,
  Tags,
  Upload,
  Users,
  Zap,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ExpandableSidebar,
  type SidebarNavItem,
  type SidebarNavSection,
} from "@/components/navigation/ExpandableSidebar";
import { useInboxUrgentCount } from "@/hooks/useInboxUrgentCount";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const { t } = useTranslation();
  const l = useLocalePath();

  const { data: inboxCounts } = useInboxUrgentCount();
  const urgentCount = inboxCounts?.urgentCount ?? 0;
  const soonCount = inboxCounts?.soonCount ?? 0;

  const inboxBadge = urgentCount > 0 ? urgentCount : soonCount > 0 ? soonCount : undefined;
  const inboxBadgeTone = urgentCount > 0 ? "destructive" : ("warning" as const);

  const mainItems: SidebarNavItem[] = [
    { label: t("admin.sidebar.overview"), href: "/admin", icon: Home, end: true },
    {
      label: "Inbox",
      href: "/admin/inbox",
      icon: InboxIcon,
      badge: inboxBadge,
      badgeTone: inboxBadgeTone,
    },
    { label: t("admin.sidebar.analytics"), href: "/admin/analytics", icon: BarChart3 },
  ];

  const ownerChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.ownerCrm"), href: "/admin/crm", icon: Users },
    { label: t("admin.sidebar.subscriptions"), href: "/admin/subscriptions", icon: CreditCard },
  ];

  const listingChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.importListings"), href: "/admin/import", icon: Upload },
    { label: t("admin.sidebar.curatedExcellence"), href: "/admin/curated", icon: Gem },
    { label: t("admin.sidebar.categories"), href: "/admin/categories", icon: Tags },
  ];

  const contentChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.pageBuilder"), href: "/admin/content/page-builder", icon: Layers },
    { label: t("admin.sidebar.homePage"), href: "/admin/content/home", icon: Home },
    { label: t("admin.sidebar.partnerPage"), href: "/admin/content/partner", icon: Users },
    { label: t("admin.sidebar.supportPage"), href: "/admin/content/support", icon: HelpCircle },
    { label: t("admin.sidebar.contactPage"), href: "/admin/content/contact", icon: Mail },
    { label: t("admin.sidebar.events"), href: "/admin/content/events", icon: CalendarDays },
    { label: t("admin.sidebar.regions"), href: "/admin/content/regions", icon: Mountain },
    { label: t("admin.sidebar.cities"), href: "/admin/content/cities", icon: MapPin },
    { label: t("admin.sidebar.categories"), href: "/admin/content/categories", icon: Tags },
    { label: t("admin.sidebar.mediaLibrary"), href: "/admin/content/media", icon: Image },
    {
      label: t("admin.sidebar.translations"),
      href: "/admin/content/translations",
      icon: Languages,
    },
    { label: t("admin.sidebar.headerMenu"), href: "/admin/content/header", icon: Menu },
    { label: t("admin.sidebar.leftMenu"), href: "/admin/content/left-menu", icon: PanelLeft },
    { label: t("admin.sidebar.footerMenu"), href: "/admin/content/footer", icon: Footprints },
    { label: t("admin.sidebar.termsOfService"), href: "/admin/content/terms", icon: FileText },
    { label: t("admin.sidebar.privacyPolicy"), href: "/admin/content/privacy", icon: FileText },
    { label: t("admin.sidebar.cookiePolicy"), href: "/admin/content/cookies", icon: FileText },
  ];

  const growthChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.overview"), href: "/admin/email", icon: BarChart3, end: true },
    { label: t("admin.sidebar.campaigns"), href: "/admin/email/campaigns", icon: Send },
    { label: t("admin.sidebar.automations"), href: "/admin/email/automations", icon: Zap },
    { label: t("admin.sidebar.contacts"), href: "/admin/email/contacts", icon: Users },
    { label: t("admin.sidebar.segments"), href: "/admin/email/segments", icon: Tags },
    { label: t("admin.sidebar.templates"), href: "/admin/email/templates", icon: FileText },
    { label: t("admin.sidebar.reports"), href: "/admin/email/reports", icon: PieChart },
    { label: t("admin.sidebar.settings"), href: "/admin/email/settings", icon: Settings },
    { label: t("admin.sidebar.allPosts"), href: "/admin/blog", icon: FileText, end: true },
    { label: t("admin.sidebar.newPost"), href: "/admin/blog/new", icon: PenSquare },
    { label: t("admin.sidebar.comments"), href: "/admin/blog/comments", icon: MessageSquare },
  ];

  const platformChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.settings"), href: "/admin/settings", icon: Settings },
    { label: t("admin.sidebar.usersRoles"), href: "/admin/users", icon: Users },
  ];

  const sections: SidebarNavSection[] = [
    { id: "admin-main", title: t("admin.sidebar.workspace"), items: mainItems },
    {
      id: "admin-hubs",
      title: t("admin.sidebar.hubs"),
      items: [
        {
          id: "owner-ops",
          label: t("admin.sidebar.ownerOps"),
          href: "/admin/crm",
          icon: Users,
          children: ownerChildren,
        },
        {
          id: "listing-ops",
          label: t("admin.sidebar.listingOps"),
          href: "/admin/listings",
          icon: List,
          children: listingChildren,
        },
        {
          id: "growth",
          label: t("admin.sidebar.growth"),
          href: "/admin/email",
          icon: Mail,
          children: growthChildren,
        },
        {
          id: "content",
          label: t("admin.sidebar.contentStudio"),
          href: "/admin/content/page-builder",
          icon: Layers,
          children: contentChildren,
        },
        {
          id: "platform",
          label: t("admin.sidebar.platform"),
          href: "/admin/settings",
          icon: Settings,
          children: platformChildren,
        },
      ],
    },
  ];

  const localizeItems = (items: SidebarNavItem[]): SidebarNavItem[] =>
    items.map((item) => ({
      ...item,
      href: item.href ? l(item.href) : undefined,
      children: item.children ? localizeItems(item.children) : undefined,
    }));

  const localizedSections = sections.map((section) => ({
    ...section,
    items: localizeItems(section.items),
  }));

  return (
    <ExpandableSidebar
      collapsed={collapsed}
      onToggle={onToggle}
      density="compact"
      logo={<BrandLogo size="sm" showIcon={collapsed} showText className="gap-2" />}
      desktopBreakpoint="2xl"
      sectionVariant="cards"
      childIndentStyle="soft"
      sections={localizedSections}
      footerText={
        collapsed
          ? undefined
          : urgentCount > 0
            ? `${urgentCount} urgent · Inbox`
            : `${t("admin.footer")}`
      }
      desktopExpandedWidthClass="w-[17.5rem]"
      desktopCollapsedWidthClass="w-[4.25rem]"
      footerSections={
        collapsed
          ? [
              {
                id: "admin-summary",
                items: [
                  {
                    id: "inbox-summary",
                    label: "Inbox",
                    icon: InboxIcon,
                    badge: inboxBadge,
                    badgeTone: inboxBadgeTone,
                  },
                ],
              },
            ]
          : undefined
      }
    />
  );
}
