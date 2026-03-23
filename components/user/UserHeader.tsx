import Link from "next/link";
import { Bell, User, LogOut, Settings, ChevronDown, ExternalLink, Heart, LayoutDashboard, Building2, Check, UserCheck } from "lucide-react";
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
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseFavoritesCount } from "@/hooks/useSupabaseFavoritesCount";
import { useUserUnreadMessagesCount } from "@/hooks/useUserUnreadMessagesCount";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/lib/i18n/locale-context";

export function UserHeader() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const locale = useLocale();
  const isAdminViewing = user?.role === 'admin';
  const { data: favoritesCount = 0 } = useSupabaseFavoritesCount();
  const { data: unreadCount = 0 } = useUserUnreadMessagesCount();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const displayName = fullName || user?.email?.split('@')[0] || t('common.user');
  const displayEmail = user?.email || '';

  return (
    <header className="border-b border-white/10 glass-header px-3 py-2 sm:px-4 lg:px-6">
      {/* Left side - Breadcrumb */}
      <div className="flex min-h-12 items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex flex-1 items-center gap-4 pl-12 lg:pl-0">
          <div className="min-w-0">
            <DashboardBreadcrumb />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Explore Site */}
          <Button variant="ghost" size="sm" asChild className="hidden xl:flex text-muted-foreground hover:text-foreground [&>svg]:hover:text-foreground">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 transition-colors" />
              {t('common.explore')}
            </Link>
          </Button>

          {/* Favorites Quick Access */}
          <Button variant="ghost" size="icon" asChild className="relative text-muted-foreground hover:text-foreground group">
            <Link href="/dashboard/favorites">
              <Heart className="h-5 w-5 transition-colors group-hover:text-foreground" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground px-1">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Notifications - links to messages */}
          <Button variant="ghost" size="icon" asChild className="relative text-muted-foreground hover:text-foreground group">
            <Link href="/dashboard/messages">
              <Bell className="h-5 w-5 transition-colors group-hover:text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
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
                <span className="hidden text-sm font-medium text-foreground group-hover:text-primary xl:block">
                  {displayName.split(' ')[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
                      <span className="w-4 mr-2" />
                      <Building2 className="h-4 w-4 mr-2" />
                      {t('common.ownerDashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <UserCheck className="h-4 w-4 mr-2" />
                      {t('common.userDashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* User-specific items */}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/favorites" className="flex items-center gap-2 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  {t('dashboard.overview.myFavorites')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  {t('common.profileSettings')}
                </Link>
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
