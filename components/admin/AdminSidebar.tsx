import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Compass,
  FileText,
  Footprints,
  Gem,
  HelpCircle,
  Home,
  Image,
  Languages,
  Layers,
  List,
  Mail,
  MapPin,
  Menu,
  PanelLeft,
  Mountain,
  PenSquare,
  PieChart,
  Send,
  Settings,
  Sparkles,
  Tags,
  Upload,
  Users,
  Zap,
  CreditCard,
  MessageSquare,
  Star,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  ExpandableSidebar,
  type SidebarNavItem,
  type SidebarNavSection,
} from "@/components/navigation/ExpandableSidebar";
import { usePendingReviewCount } from "@/hooks/usePendingReviewCount";
import { usePendingEventsCount } from "@/hooks/useEvents";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import { usePendingClaimsCount } from "@/hooks/useListingClaims";
import { useTranslationQueueCount } from "@/hooks/useTranslationQueueCount";
import { usePendingListingReviewCount } from "@/hooks/useListingReviews";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const { t } = useTranslation();
  const l = useLocalePath();

  const { data: pendingCount = 0 } = usePendingReviewCount();
  const { data: pendingEventsCount = 0 } = usePendingEventsCount();
  const { data: pendingListingReviewsCount = 0 } = usePendingListingReviewCount();
  const { data: unreadMessagesCount = 0 } = useUnreadMessagesCount();
  const { data: pendingClaimsCount = 0 } = usePendingClaimsCount();
  const translationQueueCount = useTranslationQueueCount();
  const actionCenterCount = unreadMessagesCount + pendingCount + pendingListingReviewsCount + pendingEventsCount + pendingClaimsCount;

  const mainItems: SidebarNavItem[] = [
    { label: t("admin.sidebar.overview"), href: "/admin", icon: Home, end: true },
    { label: t("admin.sidebar.analytics"), href: "/admin/analytics", icon: BarChart3 },
  ];

  const actionCenterItems: SidebarNavItem[] = [
    {
      label: t("admin.sidebar.messages"),
      href: "/admin/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeTone: "destructive",
    },
    {
      label: t("admin.sidebar.moderationQueue"),
      href: "/admin/moderation",
      icon: ClipboardCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeTone: "destructive",
    },
    {
      label: t("admin.sidebar.reviewModeration", "Review Moderation"),
      href: "/admin/reviews",
      icon: Star,
      badge: pendingListingReviewsCount > 0 ? pendingListingReviewsCount : undefined,
      badgeTone: "destructive",
    },
    {
      label: t("admin.sidebar.eventModeration"),
      href: "/admin/content/events/moderation",
      icon: CalendarDays,
      badge: pendingEventsCount > 0 ? pendingEventsCount : undefined,
      badgeTone: "destructive",
    },
    {
      label: t("admin.sidebar.partnerRequests"),
      href: "/admin/claims",
      icon: Users,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
      badgeTone: "destructive",
    },
  ];

  const contentChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.pages"), href: "/admin/content/pages", icon: FileText },
    { label: t("admin.sidebar.pageBuilder", "Full Page Builder"), href: "/admin/content/page-builder", icon: Layers },
    { label: t("admin.sidebar.homePage"), href: "/admin/content/home", icon: Home },
    { label: t("admin.sidebar.partnerPage"), href: "/admin/content/partner", icon: Users },
    { label: t("admin.sidebar.supportPage"), href: "/admin/content/support", icon: HelpCircle },
    { label: t("admin.sidebar.contactPage"), href: "/admin/content/contact", icon: Mail },
    { label: t("admin.sidebar.events"), href: "/admin/content/events", icon: CalendarDays },
    {
      label: t("admin.sidebar.eventModeration"),
      href: "/admin/content/events/moderation",
      icon: ClipboardCheck,
      badge: pendingEventsCount > 0 ? pendingEventsCount : undefined,
      badgeTone: "destructive",
    },
    { label: t("admin.sidebar.newEvent"), href: "/admin/content/events/new", icon: PenSquare },
    { label: t("admin.sidebar.regions"), href: "/admin/content/regions", icon: Mountain },
    { label: t("admin.sidebar.destinations"), href: "/admin/content/destinations", icon: Compass },
    { label: t("admin.sidebar.cities"), href: "/admin/content/cities", icon: MapPin },
    { label: t("admin.sidebar.categories"), href: "/admin/content/categories", icon: Tags },
    { label: t("admin.sidebar.mediaLibrary"), href: "/admin/content/media", icon: Image },
    {
      label: t("admin.sidebar.translations", "Translations"),
      href: "/admin/content/translations",
      icon: Languages,
      badge: translationQueueCount > 0 ? translationQueueCount : undefined,
      badgeTone: "destructive" as const,
    },
    { label: t("admin.sidebar.headerMenu"), href: "/admin/content/header", icon: Menu },
    { label: t("admin.sidebar.leftMenu", "Left Menu"), href: "/admin/content/left-menu", icon: PanelLeft },
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

  const ownerChildren: SidebarNavItem[] = [
    {
      label: t("admin.sidebar.messages"),
      href: "/admin/messages",
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
      badgeTone: "destructive",
    },
    { label: t("admin.sidebar.ownerCrm", "Owner CRM"), href: "/admin/crm", icon: Users },
    { label: t("admin.sidebar.subscriptions"), href: "/admin/subscriptions", icon: CreditCard },
    {
      label: t("admin.sidebar.partnerRequests"),
      href: "/admin/claims",
      icon: Users,
      badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
      badgeTone: "destructive",
    },
  ];

  const listingChildren: SidebarNavItem[] = [
    {
      label: t("admin.sidebar.moderationQueue"),
      href: "/admin/moderation",
      icon: ClipboardCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeTone: "destructive",
    },
    {
      label: t("admin.sidebar.reviewModeration", "Review Moderation"),
      href: "/admin/reviews",
      icon: Star,
      badge: pendingListingReviewsCount > 0 ? pendingListingReviewsCount : undefined,
      badgeTone: "destructive",
    },
    { label: t("admin.sidebar.importListings"), href: "/admin/import", icon: Upload },
    { label: t("admin.sidebar.curatedExcellence"), href: "/admin/curated", icon: Gem },
    { label: t("admin.sidebar.aiImageGen"), href: "/admin/images", icon: Sparkles },
    { label: t("admin.sidebar.categories"), href: "/admin/categories", icon: Tags },
  ];

  const platformChildren: SidebarNavItem[] = [
    { label: t("admin.sidebar.settings"), href: "/admin/settings", icon: Settings },
    { label: t("admin.sidebar.usersRoles"), href: "/admin/users", icon: Users },
  ];

  const sections: SidebarNavSection[] = [
    { id: "admin-main", title: t("admin.sidebar.workspace", "Workspace"), items: mainItems },
    {
      id: "admin-action-center",
      title: t("admin.sidebar.actionCenter", "Action Center"),
      items: actionCenterItems,
    },
    {
      id: "admin-hubs",
      title: t("admin.sidebar.hubs", "Hubs"),
      items: [
        {
          id: "owner-ops",
          label: t("admin.sidebar.ownerOps", "Owners"),
          href: "/admin/crm",
          icon: Users,
          badge: unreadMessagesCount + pendingClaimsCount > 0 ? unreadMessagesCount + pendingClaimsCount : undefined,
          badgeTone: "destructive",
          children: ownerChildren,
        },
        {
          id: "listing-ops",
          label: t("admin.sidebar.listingOps", "Listings"),
          href: "/admin/listings",
          icon: List,
          badge: pendingCount + pendingListingReviewsCount > 0 ? pendingCount + pendingListingReviewsCount : undefined,
          badgeTone: "destructive",
          children: listingChildren,
        },
        {
          id: "growth",
          label: t("admin.sidebar.growth", "Growth"),
          href: "/admin/email",
          icon: Mail,
          children: growthChildren,
        },
        {
          id: "content",
          label: t("admin.sidebar.contentStudio", "Content"),
          href: "/admin/content/pages",
          icon: Layers,
          badge: translationQueueCount + pendingEventsCount > 0 ? translationQueueCount + pendingEventsCount : undefined,
          badgeTone: "destructive",
          children: contentChildren,
        },
        {
          id: "platform",
          label: t("admin.sidebar.platform", "System"),
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
        collapsed ? undefined : `${t("admin.footer")} · ${actionCenterCount} ${t("admin.sidebar.actionCenter", "Action Center").toLowerCase()}`
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
                    id: "pending-summary",
                    label: t("admin.sidebar.actionCenter", "Action Center"),
                    icon: Zap,
                    badge: actionCenterCount || undefined,
                    badgeTone: actionCenterCount > 0 ? "destructive" : "primary",
                  },
                  {
                    id: "translation-summary",
                    label: t("admin.sidebar.translations", "Translations"),
                    icon: Languages,
                    badge: translationQueueCount || undefined,
                    badgeTone: translationQueueCount > 0 ? "destructive" : "primary",
                  },
                ],
              },
            ]
          : [
              {
                id: "admin-summary",
                title: t("admin.sidebar.systemHealth", "Queue"),
                items: [
                  {
                    id: "pending-summary",
                    label: t("admin.sidebar.actionCenter", "Action Center"),
                    icon: Zap,
                    badge: actionCenterCount || undefined,
                    badgeTone: actionCenterCount > 0 ? "destructive" : "primary",
                  },
                  {
                    id: "translation-summary",
                    label: t("admin.sidebar.translations", "Translations"),
                    icon: Languages,
                    badge: translationQueueCount || undefined,
                    badgeTone: translationQueueCount > 0 ? "destructive" : "primary",
                  },
                ],
              },
            ]
      }
    />
  );
}
