import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingReviewCount } from "@/hooks/usePendingReviewCount";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import { usePendingClaimsCount } from "@/hooks/useListingClaims";
import { usePendingEventsCount } from "@/hooks/useEvents";
import { usePendingListingReviewCount } from "@/hooks/useListingReviews";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";

export function AdminHeader() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const router = useRouter();
  const l = useLocalePath();
  const { data: pendingCount = 0 } = usePendingReviewCount();
  const { data: pendingListingReviewsCount = 0 } = usePendingListingReviewCount();
  const { data: unreadMessagesCount = 0 } = useUnreadMessagesCount();
  const { data: pendingClaimsCount = 0 } = usePendingClaimsCount();
  const { data: pendingEventsCount = 0 } = usePendingEventsCount();
  const [quickJump, setQuickJump] = useState("");
  const adminName = user?.firstName || t("common.admin");
  const adminEmail = user?.email || "";
  const adminInitial = (adminName.trim().charAt(0) || adminEmail.trim().charAt(0) || "A").toUpperCase();

  const totalNotifications = pendingCount + pendingListingReviewsCount + pendingClaimsCount + pendingEventsCount;

  const quickJumpOptions = useMemo(
    () => [
      { label: t("admin.sidebar.overview", "Overview"), value: l("/admin") },
      { label: t("admin.sidebar.listings", "Listings"), value: l("/admin/listings") },
      { label: t("admin.overview.createListing", "Create Listing"), value: l("/admin/listings/new") },
      { label: t("admin.sidebar.moderationQueue", "Moderation Queue"), value: l("/admin/moderation") },
      { label: t("admin.sidebar.reviewModeration", "Review Moderation"), value: l("/admin/reviews") },
      { label: t("admin.sidebar.messages", "Messages"), value: l("/admin/messages") },
      { label: t("admin.sidebar.translations", "Translations"), value: l("/admin/content/translations") },
      { label: t("admin.sidebar.pageBuilder", "Full Page Builder"), value: l("/admin/content/page-builder") },
      { label: t("admin.sidebar.homePage", "Home Page"), value: l("/admin/content/home") },
      { label: t("admin.sidebar.events", "Events"), value: l("/admin/content/events") },
      { label: t("admin.sidebar.mediaLibrary", "Media Library"), value: l("/admin/content/media") },
      { label: t("admin.sidebar.settings", "Settings"), value: l("/admin/settings") },
      { label: t("admin.sidebar.usersRoles", "Users"), value: l("/admin/users") },
    ],
    [l, t],
  );

  const quickActionLinks = useMemo(
    () => [
      {
        label: t("admin.overview.createListing", "Create Listing"),
        href: l("/admin/listings/new"),
      },
      {
        label: t("admin.sidebar.moderationQueue", "Moderation Queue"),
        href: l("/admin/moderation"),
        badge: pendingCount || undefined,
      },
      {
        label: t("admin.sidebar.reviewModeration", "Review Moderation"),
        href: l("/admin/reviews"),
        badge: pendingListingReviewsCount || undefined,
      },
      {
        label: t("admin.sidebar.translations", "Translations"),
        href: l("/admin/content/translations"),
      },
    ],
    [l, pendingCount, pendingListingReviewsCount, t],
  );

  const handleQuickJumpSubmit = (event: FormEvent) => {
    event.preventDefault();

    const normalized = quickJump.trim().toLowerCase();
    if (!normalized) return;

    const exactMatch = quickJumpOptions.find(
      (option) =>
        option.value.toLowerCase() === normalized
        || option.label.toLowerCase() === normalized,
    );

    const fuzzyMatch = quickJumpOptions.find((option) =>
      option.label.toLowerCase().includes(normalized)
      || option.value.toLowerCase().includes(normalized),
    );

    const target = exactMatch?.value ?? fuzzyMatch?.value;
    if (!target) return;

    router.push(target);
    setQuickJump("");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
      <div className="flex min-h-14 items-center justify-between gap-2 px-2.5 py-2 sm:min-h-16 sm:px-3 lg:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-11 sm:pl-12 md:gap-3 xl:pl-0 xl:gap-4">
          <div className="min-w-0 flex-1">
            <DashboardBreadcrumb />
          </div>

          <form onSubmit={handleQuickJumpSubmit} className="relative hidden w-full max-w-sm 2xl:block 2xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              list="admin-quick-jump"
              value={quickJump}
              onChange={(event) => setQuickJump(event.target.value)}
              placeholder={t("admin.header.quickJump", "Quick jump: listings, translations, users...")}
              className="h-9 rounded-full border-border/80 bg-background/80 pl-10 pr-10 text-sm"
            />
            <datalist id="admin-quick-jump">
              {quickJumpOptions.map((option) => (
                <option key={option.value} value={option.label} />
              ))}
            </datalist>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
              aria-label={t("admin.header.go", "Go")}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div className="hidden 2xl:flex items-center gap-1">
            {quickActionLinks.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className="h-8 rounded-full border border-border/70 bg-background/70 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <Link href={item.href}>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              </Button>
            ))}
          </div>

          <Button variant="ghost" size="icon" asChild className="hidden h-9 w-9 text-muted-foreground hover:text-foreground group xl:inline-flex">
            <Link href={l("/")}>
              <Home className="h-5 w-5 transition-colors group-hover:text-foreground" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 text-muted-foreground hover:text-foreground group">
            <Link href={l("/admin/moderation")}>
              <Bell className="h-5 w-5 transition-colors group-hover:text-foreground" />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {totalNotifications > 99 ? "99+" : totalNotifications}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 text-muted-foreground hover:text-foreground group">
            <Link href={l("/admin/messages")}>
              <MessageSquare className="h-5 w-5 transition-colors group-hover:text-foreground" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                </span>
              )}
            </Link>
          </Button>

          <LanguageSwitcher
            containerClassName="min-w-0"
            selectClassName="h-9 w-[8.5rem] rounded-full border-border/80 bg-background/80 px-3 py-1 text-sm shadow-none"
          />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full px-2.5 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30">
                  <span className="text-sm font-semibold leading-none text-primary">{adminInitial}</span>
                </div>
                <span className="hidden text-sm font-medium text-foreground group-hover:text-primary 2xl:block">
                  {t("common.admin")}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-box border border-white/20">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{t("common.adminUser")}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email || "admin@algarveofficial.com"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {t("common.switchDashboard")}
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={l("/admin")} className="flex cursor-pointer items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t("common.adminDashboard")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={l("/owner")} className="flex cursor-pointer items-center">
                  <span className="mr-2 w-4" />
                  <Building2 className="mr-2 h-4 w-4" />
                  {t("common.ownerDashboard")}
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={l("/dashboard")} className="flex cursor-pointer items-center">
                  <span className="mr-2 w-4" />
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t("common.userDashboard")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={l("/admin/settings")} className="flex cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("admin.sidebar.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t border-border/60 px-2.5 py-2 sm:px-3 2xl:hidden">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <form onSubmit={handleQuickJumpSubmit} className="relative min-w-0 w-full lg:flex-1 lg:min-w-[16rem]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              list="admin-quick-jump-mobile"
              value={quickJump}
              onChange={(event) => setQuickJump(event.target.value)}
              placeholder={t("admin.header.quickJump", "Quick jump: listings, translations, users...")}
              className="h-8 rounded-full border-border/80 bg-background/80 pl-9 pr-9 text-xs sm:text-sm"
            />
            <datalist id="admin-quick-jump-mobile">
              {quickJumpOptions.map((option) => (
                <option key={option.value} value={option.label} />
              ))}
            </datalist>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
              aria-label={t("admin.header.go", "Go")}
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickActionLinks.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className="h-8 shrink-0 rounded-full border border-border/70 bg-background/70 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <Link href={item.href} className="inline-flex max-w-full items-center">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
