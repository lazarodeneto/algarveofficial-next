"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentProps,
  type ComponentType,
} from "react";
import NextLink from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useLocalePath } from "@/hooks/useLocalePath";
import {
  AlignJustify,
  X,
  User,
  Heart,
  Search,
  Settings2,
  MessageSquare,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContextBase";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/ui/brand-logo";
import { HeaderWeatherPill, type HeaderWeatherLocation } from "./HeaderWeatherPill";
import { MobileBottomNav } from "./MobileBottomNav";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { useMobileChromeScrollState } from "@/hooks/useMobileChromeScrollState";

type HeaderMegaMenuComponent = ComponentType<{ overHero?: boolean }>;
type MobileMegaMenuSectionsComponent = ComponentType<{ onNavigate: () => void }>;

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

const CommandSearch = dynamic(
  () => import("@/components/ui/command-search").then((module) => module.CommandSearch),
  { ssr: false },
);

function useViewportMatch(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const syncMatch = () => setMatches(mediaQuery.matches);

    syncMatch();
    mediaQuery.addEventListener("change", syncMatch);
    return () => mediaQuery.removeEventListener("change", syncMatch);
  }, [query]);

  return matches;
}

interface HeaderProps {
  localeSwitchPaths?: Record<string, string>;
}

const SIDEBAR_EXCLUDED_PREFIXES = ["/admin", "/owner", "/dashboard"];

export default function Header({ localeSwitchPaths }: HeaderProps = {}) {
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const { isUserScrolling } = useMobileChromeScrollState();
  const { t } = useTranslation();
  const l = useLocalePath();
  const pathname = usePathname() ?? "/";
  const canRenderDesktopNavigation = useViewportMatch("(min-width: 960px)");
  const [DesktopMegaMenu, setDesktopMegaMenu] = useState<HeaderMegaMenuComponent | null>(null);
  const [MobileMegaMenu, setMobileMegaMenu] = useState<MobileMegaMenuSectionsComponent | null>(null);
  const barePath = stripLocaleFromPathname(pathname);
  const isLeftSidebarActive = !SIDEBAR_EXCLUDED_PREFIXES.some((prefix) =>
    barePath.startsWith(prefix),
  );
  const isHomepage = barePath === "/";
  const headerWeatherLocation: HeaderWeatherLocation = isHomepage ? "algarve" : "faro";

  const loginPath = l("/login");
  const favoritesPath = isAuthenticated ? l("/dashboard/favorites") : loginPath;
  const accountPath = isAuthenticated && user ? getDashboardPath(user.role) : loginPath;
  const tripsPath = isAuthenticated ? l("/dashboard/trips") : loginPath;
  const messagesPath = isAuthenticated ? l("/dashboard/messages") : loginPath;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const userInitial = (fullName.charAt(0) || user?.email?.trim().charAt(0) || "U").toUpperCase();
  const headerIconMotionClass = "hover:translate-y-0 active:translate-y-0";
  const accountGoldButtonClass = `rounded-full ${headerIconMotionClass}`;
  const adminDashboardAriaLabel = "Admin Dashboard";

  // Search modal state (local to Header)
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!canRenderDesktopNavigation || DesktopMegaMenu) return undefined;

    let disposed = false;
    void import("./HeaderMegaMenu").then((module) => {
      if (!disposed) {
        setDesktopMegaMenu(() => module.HeaderMegaMenu);
      }
    });

    return () => {
      disposed = true;
    };
  }, [DesktopMegaMenu, canRenderDesktopNavigation]);

  useEffect(() => {
    if (!mobileMenuOpen || MobileMegaMenu) return undefined;

    let disposed = false;
    void import("./HeaderMegaMenu").then((module) => {
      if (!disposed) {
        setMobileMegaMenu(() => module.MobileMegaMenuSections);
      }
    });

    return () => {
      disposed = true;
    };
  }, [MobileMegaMenu, mobileMenuOpen]);

  // Mirror mobile menu state to DOM for CSS failsafe (production caching workaround)
  useEffect(() => {
    document.documentElement.dataset.mobileMenuOpen = mobileMenuOpen ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.mobileMenuOpen;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const closeWideMenu = () => {
      if (desktopQuery.matches) setMobileMenuOpen(false);
    };

    closeWideMenu();
    desktopQuery.addEventListener("change", closeWideMenu);
    return () => {
      desktopQuery.removeEventListener("change", closeWideMenu);
    };
  }, [setMobileMenuOpen]);

  // Body scroll lock when mobile menu is open (fixes Opera Mobile viewport quirks)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Swipe-down gesture to close mobile menu
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 80; // pixels needed to trigger close

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current !== null && touchCurrentY.current !== null) {
      const deltaY = touchCurrentY.current - touchStartY.current;
      // Only close on downward swipe that exceeds threshold
      if (deltaY > SWIPE_THRESHOLD) {
        setMobileMenuOpen(false);
      }
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
  }, [setMobileMenuOpen]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {searchOpen ? <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} /> : null}

      <header
        className={cn(
          "site-header fixed top-0 left-0 right-0 z-50 transition-[transform,background-color,border-color,box-shadow,backdrop-filter] duration-200 ease-out lg:left-20 lg:translate-y-0",
          isUserScrolling && !mobileMenuOpen && "-translate-y-full",
        )}
      >
        <nav className="top-header-nav relative max-w-[1680px] px-3 sm:px-5 lg:px-4 xl:pr-8 xl:pl-11 2xl:pr-10 2xl:pl-14">
          <div className="flex h-[4.5rem] sm:h-20 items-center gap-2 sm:gap-3 lg:gap-2.5 xl:gap-5">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0 overflow-hidden lg:max-w-[10.25rem] min-[1440px]:mr-3 min-[1440px]:max-w-[14.5rem] 2xl:mr-5 2xl:max-w-none">
              <div className="lg:hidden">
                <BrandLogo
                  size="md"
                  showIcon
                  className="whitespace-nowrap"
                />
              </div>
              <div className="hidden items-center justify-center lg:flex min-[1440px]:hidden">
                <BrandLogo
                  size="sm"
                  showIcon={!isLeftSidebarActive}
                  className="whitespace-nowrap gap-1.5"
                  iconClassName="h-5 w-5"
                />
              </div>
              <div className="hidden min-[1440px]:block">
                <BrandLogo size="md" className="whitespace-nowrap" />
              </div>
            </div>

            {/* Primary Navigation */}
            <div className="hidden min-w-0 flex-1 items-center justify-center min-[960px]:flex min-[1280px]:justify-start">
              {canRenderDesktopNavigation && DesktopMegaMenu ? <DesktopMegaMenu /> : null}
            </div>

            {/* Laptop Actions (1024-1359): compact utility row */}
            <div className="ml-auto hidden shrink-0 items-center gap-1.5 min-[1280px]:flex min-[1440px]:hidden">
              <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white/[0.82] px-1 py-1 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10">
                <HeaderWeatherPill
                  compact
                  embedded
                  location={headerWeatherLocation}
                  loadMediaQuery="(min-width: 1280px) and (max-width: 1439.98px)"
                />

                <Link href={favoritesPath}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary ${headerIconMotionClass}`}
                    aria-label={t("nav.saved")}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">{t("nav.saved")}</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary ${headerIconMotionClass}`}
                  onClick={() => setSearchOpen(true)}
                  aria-label={t("nav.search")}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">{t("nav.search")}</span>
                </Button>

                <LanguageSwitcher
                  localeSwitchPaths={localeSwitchPaths}
                  containerClassName="min-w-0"
                  selectClassName="h-8 w-[7.5rem] rounded-full border-black/10 bg-white/70 px-2.5 py-1 text-sm text-black shadow-none dark:border-white/12 dark:bg-white dark:text-black"
                />
                <ThemeToggle variant="header" />

                {isAuthenticated && user ? (
                  <Link href={getDashboardPath(user.role)}>
                    <Button
                      variant="gold"
                      size="icon"
                      className={`h-8 w-8 ${accountGoldButtonClass}`}
                      aria-label={t("nav.account")}
                    >
                      <span className="text-xs font-semibold leading-none">{userInitial}</span>
                      <span className="sr-only">{t("nav.account")}</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href={loginPath}>
                    <Button
                      variant="gold"
                      size="icon"
                      className={`h-8 w-8 ${accountGoldButtonClass}`}
                      aria-label={t("nav.account")}
                    >
                      <User className="h-4 w-4" />
                      <span className="sr-only">{t("nav.account")}</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden min-[1440px]:flex min-[1440px]:shrink-0 min-[1440px]:items-center min-[1440px]:gap-2 2xl:gap-3">
              <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/[0.82] px-2 py-1.5 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10">
                <HeaderWeatherPill
                  embedded
                  location={headerWeatherLocation}
                  loadMediaQuery="(min-width: 1440px)"
                />

                {/* Saved */}
                <Link href={favoritesPath}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary ${headerIconMotionClass}`}
                    aria-label={t("nav.saved")}
                  >
                    <Heart className="h-4.5 w-4.5" />
                    <span className="sr-only">{t("nav.saved")}</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary ${headerIconMotionClass}`}
                  onClick={() => setSearchOpen(true)}
                  aria-label={t("nav.search")}
                >
                  <Search className="h-4.5 w-4.5" />
                  <span className="sr-only">{t("nav.search")}</span>
                </Button>

                <LanguageSwitcher
                  localeSwitchPaths={localeSwitchPaths}
                  selectClassName="h-10 rounded-full border-black/10 bg-white px-4 py-2 text-black shadow-none dark:border-white/12 dark:bg-white dark:text-black"
                />

                {isAuthenticated && user ? (
                  <div className="flex items-center gap-1">
                    {(user.role === "admin" || user.role === "editor") && (
                      <Link href={l("/admin")}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-9 w-9 rounded-full border border-primary/25 bg-primary/12 text-primary hover:bg-primary/18 dark:border-primary/30 dark:bg-primary/18 ${headerIconMotionClass}`}
                          aria-label={adminDashboardAriaLabel}
                        >
                          <Settings2 className="h-4.5 w-4.5" />
                        </Button>
                      </Link>
                    )}

                    <Link href={getDashboardPath(user.role)}>
                      <Button
                        variant="gold"
                        size="icon"
                        className={`h-9 w-9 ${accountGoldButtonClass}`}
                        aria-label={t("nav.account")}
                      >
                        <span className="text-sm font-semibold leading-none">{userInitial}</span>
                        <span className="sr-only">{t("nav.account")}</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={loginPath}>
                    <Button
                      variant="gold"
                      size="icon"
                      className={`h-9 w-9 ${accountGoldButtonClass}`}
                      aria-label={t("nav.account")}
                    >
                      <User className="h-4.5 w-4.5" />
                      <span className="sr-only">{t("nav.account")}</span>
                    </Button>
                  </Link>
                )}

                <ThemeToggle variant="header" />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="ml-auto flex items-center gap-1 sm:gap-3 min-[1280px]:hidden">
              <LanguageSwitcher
                localeSwitchPaths={localeSwitchPaths}
                containerClassName="hidden min-[960px]:flex min-[1280px]:hidden min-w-0"
                selectClassName="h-10 w-[9.25rem] rounded-full border-black/10 bg-white/80 px-3 py-2 text-sm text-black shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white dark:text-black min-[1120px]:w-[10.5rem]"
              />
              <Link href={favoritesPath}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-full border border-black/10 bg-white/80 text-foreground shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10 dark:text-white/85 ${headerIconMotionClass}`}
                  aria-label={t("nav.saved")}
                >
                  <Heart className="h-5 w-5 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className={`h-10 w-10 rounded-full border border-black/10 bg-white/80 text-foreground shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10 dark:text-white/85 ${headerIconMotionClass}`}
                aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-7 w-7 sm:h-8 sm:w-8" /> : <AlignJustify className="h-7 w-7 sm:h-8 sm:w-8" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop overlay */}
              <div
                className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 min-[768px]:bg-transparent min-[768px]:backdrop-blur-0 min-[1280px]:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Mobile menu panel */}
              <div
                data-mobile-menu-expanded="true"
                role="dialog"
                aria-modal="true"
                aria-label={t("nav.mobilePrimary")}
                className="fixed inset-0 z-[140] overflow-y-auto bg-background/95 text-foreground backdrop-blur-2xl dark:bg-background/70 touch-pan-y animate-in fade-in slide-in-from-top-3 duration-200 min-[768px]:inset-auto min-[768px]:right-4 min-[768px]:top-[5.5rem] min-[768px]:w-[min(30rem,calc(100vw-2rem))] min-[768px]:max-h-[calc(100svh-6rem)] min-[768px]:overflow-hidden min-[768px]:rounded-2xl min-[768px]:border min-[768px]:border-black/10 min-[768px]:bg-background/96 min-[768px]:shadow-[0_28px_80px_-35px_rgba(15,23,42,0.55)] min-[768px]:ring-1 min-[768px]:ring-black/5 min-[768px]:dark:border-white/12 min-[768px]:dark:bg-background/90 min-[1280px]:hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="px-4 pt-4 pb-6 space-y-4 min-[768px]:max-h-[calc(100svh-6rem)] min-[768px]:overflow-y-auto min-[768px]:p-3 min-[768px]:space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 rounded-sm border border-black/10 bg-white/70 p-2.5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-white/12 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <ThemeToggle className="w-14 shrink-0" />
                        <LanguageSwitcher
                          localeSwitchPaths={localeSwitchPaths}
                          containerClassName="min-w-0 flex-1"
                          selectClassName="h-10 w-full rounded-full border-black/12 bg-white pl-4 pr-12 text-sm text-black shadow-none dark:border-white/12 dark:bg-white dark:text-black"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/75 dark:border-white/20 dark:bg-white/10"
                      aria-label={t("nav.closeMenu")}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex min-h-full flex-col min-[768px]:min-h-0">

                    {MobileMegaMenu ? (
                      <MobileMegaMenu onNavigate={() => setMobileMenuOpen(false)} />
                    ) : null}

                    <div className="mt-4 rounded-sm border border-black/10 bg-white/66 p-3 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-white/12 dark:bg-white/5">
                      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {t("nav.yourSpace")}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        <Link href={accountPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/[0.85] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <User className="h-4 w-4 text-primary" />
                          {t("nav.account")}
                        </Link>
                        <Link href={tripsPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/[0.85] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <Plane className="h-4 w-4 text-primary" />
                          {t("nav.myTrip")}
                        </Link>
                        <Link href={favoritesPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/[0.85] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <Heart className="h-4 w-4 text-primary" />
                          {t("dashboard.favorites.title")}
                        </Link>
                        <Link href={messagesPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/[0.85] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          {t("nav.messages")}
                        </Link>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      {isAuthenticated && user ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          {t("nav.signOut")}
                        </Button>
                      ) : (
                        <Link href={loginPath} onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            {t("nav.login")}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
      </header>
      <MobileBottomNav />
    </>
  );
}

// Named export for components that import { Header }
export { Header };
