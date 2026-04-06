import Link from "next/link";
import { Bell, User, LogOut, Settings, ChevronDown, ExternalLink, ShieldCheck, LayoutDashboard, Building2, Check, UserCheck, Crown } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { useOwnerListings } from "@/hooks/useOwnerListings";
import { useOwnerUnreadMessagesCount } from "@/hooks/useOwnerUnreadMessagesCount";
import { usePendingReviewCount } from "@/hooks/usePendingReviewCount";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";

export function OwnerHeader() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const l = useLocalePath();
  const isAdminViewing = user?.role === 'admin';
  const { data: listings = [] } = useOwnerListings();
  const { data: unreadCount = 0 } = useOwnerUnreadMessagesCount();
  const { data: pendingCount = 0 } = usePendingReviewCount();

  // Bell badge reflects unread messages only.
  const totalNotifications = unreadCount;

  // Get the highest tier among owner's listings
  const getTierBadge = () => {
    if (listings.some((l: { tier?: string | null }) => l.tier === "signature")) return "Signature";
    if (listings.some((l: { tier?: string | null }) => l.tier === "verified")) return "Verified";
    return "Free";
  };

  const tierBadge = getTierBadge();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const displayName = fullName || user?.email?.split('@')[0] || t('common.owner');
  const displayEmail = user?.email || '';

  return (
    <header className="border-b border-white/10 glass-header px-3 py-2 sm:px-4 lg:px-6">
      {/* Left side - Breadcrumb */}
      <div className="flex min-h-12 items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex flex-1 items-center gap-4 pl-12 xl:pl-0">
          <div className="min-w-0">
            <DashboardBreadcrumb />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher
            containerClassName="min-w-0"
            selectClassName="h-9 w-[8.25rem] rounded-full border-border/80 bg-background/80 px-3 py-1 text-sm shadow-none"
          />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* View Public Site */}
          <Button variant="ghost" size="sm" asChild className="hidden xl:flex text-muted-foreground hover:text-foreground [&>svg]:hover:text-foreground">
            <Link href={l("/")} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 transition-colors" />
              {t('common.viewSite')}
            </Link>
          </Button>

          {/* Notifications - links to messages page */}
          <Button variant="ghost" size="icon" asChild className="relative text-muted-foreground hover:text-foreground group">
            <Link href={l("/owner/messages")}>
              <Bell className="h-5 w-5 transition-colors group-hover:text-foreground" />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground px-1">
                  {totalNotifications > 99 ? '99+' : totalNotifications}
                </span>
              )}
            </Link>
          </Button>

          {/* Unified User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-1.5 pr-2 sm:pl-2 sm:pr-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden items-center gap-1.5 xl:flex">
                  <>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">{displayName}</span>
                    {(tierBadge === 'Verified' || tierBadge === 'Signature') && (
                      <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-box border border-white/20">
              {/* User Info */}
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{displayEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Dashboard Navigation - Admin only */}
              {isAdminViewing && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    {t('common.switchDashboard')}
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={l("/admin")} className="cursor-pointer flex items-center">
                      <span className="w-4 mr-2" />
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t('common.adminDashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={l("/owner")} className="cursor-pointer flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <Building2 className="h-4 w-4 mr-2" />
                      {t('common.ownerDashboard')}
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-[10px] h-5 px-1.5">
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={l("/dashboard")} className="cursor-pointer flex items-center">
                      <span className="w-4 mr-2" />
                      <UserCheck className="h-4 w-4 mr-2" />
                      {t('common.userDashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Owner-specific items */}
              <DropdownMenuItem asChild>
                <Link href={l("/owner/membership")} className="flex items-center gap-2 cursor-pointer">
                  <Crown className="h-4 w-4" />
                  <span>{t('owner.sidebar.membership')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                {t('common.accountSettings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Sign Out */}
              <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
