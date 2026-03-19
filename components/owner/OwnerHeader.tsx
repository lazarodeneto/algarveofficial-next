import { Link } from "@/components/router/nextRouterCompat";
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
import { useTranslation } from "react-i18next";

export function OwnerHeader() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const isAdminViewing = user?.role === 'admin';
  const { data: listings = [] } = useOwnerListings();
  const { data: unreadCount = 0 } = useOwnerUnreadMessagesCount();
  const { data: pendingCount = 0 } = usePendingReviewCount();

  // Count pending listings for this owner
  const pendingListingsCount = listings.filter((l: { status?: string | null }) => l.status === "pending_review").length;

  // Total notifications = unread messages + pending listings
  const totalNotifications = unreadCount + pendingListingsCount;

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
    <header className="h-16 border-b border-white/10 glass-header px-4 lg:px-6 flex items-center justify-between">
      {/* Left side - Breadcrumb */}
      <div className="flex items-center gap-4 pl-12 lg:pl-0">
        <DashboardBreadcrumb />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* View Public Site */}
        <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground hover:text-foreground [&>svg]:hover:text-foreground">
          <Link href="/" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 transition-colors" />
            {t('common.viewSite')}
          </Link>
        </Button>

        {/* Notifications - links to messages page */}
        <Button variant="ghost" size="icon" asChild className="relative text-muted-foreground hover:text-foreground group">
          <Link href="/owner/messages">
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
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
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
                  <Link href="/admin" className="cursor-pointer flex items-center">
                    <span className="w-4 mr-2" />
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t('common.adminDashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/owner" className="cursor-pointer flex items-center">
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
                  <Link href="/dashboard" className="cursor-pointer flex items-center">
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
              <Link href="/owner/membership" className="flex items-center gap-2 cursor-pointer">
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
    </header>
  );
}
