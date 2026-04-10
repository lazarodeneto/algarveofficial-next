"use client";

import { useState, useEffect, useRef, useCallback, type ComponentProps } from "react";
import NextLink from "next/link";
import { useLocalePath } from "@/hooks/useLocalePath";
import type { Locale } from "@/lib/i18n/config";
import { AnimatePresence, m } from "framer-motion";
import {
  AlignJustify,
  X,
  User,
  Heart,
  Search,
  Settings2,
  BedDouble,
  Binoculars,
  Home,
  MapPin,
  BookOpen,
  MessageSquare,
  Plane,
  HouseHeart,
  Hotel,
  Utensils,
  Compass,
  Palmtree,
  Trophy,
  FlagTriangleRight,
  Dumbbell,
  Users,
  ShoppingBag,
  Building2,
  Calendar,
  ChefHat,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { CommandSearch } from "@/components/ui/command-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/ui/brand-logo";
import { HeaderNav } from "./HeaderNav";
import { MobileBottomNav } from "./MobileBottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

interface HeaderProps {
  localeSwitchPaths?: Record<string, string>;
}

export default function Header({ localeSwitchPaths }: HeaderProps = {}) {
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const { t } = useTranslation();
  const l = useLocalePath();

  const directoryPath = l("/stay?category=places-to-stay");
  const experiencesPath = l("/experiences");
  const propertiesPath = l("/properties");
  const golfPath = l("/golf");
  const realEstatePath = l("/real-estate");
  const homePath = l("/");
  const destinationsPath = l("/destinations");
  const mapPath = l("/map");
  const blogPath = l("/blog");
  const loginPath = l("/login");
  const favoritesPath = isAuthenticated ? l("/dashboard/favorites") : loginPath;
  const accountPath = isAuthenticated && user ? getDashboardPath(user.role) : loginPath;
  const tripsPath = isAuthenticated ? l("/dashboard/trips") : loginPath;
  const messagesPath = isAuthenticated ? l("/dashboard/messages") : loginPath;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const userInitial = (fullName.charAt(0) || user?.email?.trim().charAt(0) || "U").toUpperCase();
  const accountAccentButtonClass =
    "rounded-full border border-primary/25 bg-primary/12 text-primary hover:bg-primary/18 dark:border-primary/30 dark:bg-primary/18";
  const accountInitialButtonClass =
    "rounded-full border border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-18px_hsla(43,74%,49%,0.8)] hover:bg-primary/90 dark:border-primary dark:bg-primary dark:text-primary-foreground";
  const buildDirectoryCategoryPath = (category: string) =>
    l(`/stay?category=${category}`);

  // Search modal state (local to Header)
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mirror mobile menu state to DOM for CSS failsafe (production caching workaround)
  useEffect(() => {
    document.documentElement.dataset.mobileMenuOpen = mobileMenuOpen ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.mobileMenuOpen;
    };
  }, [mobileMenuOpen]);

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

  // Show header border only after user scrolls
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <header className="site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 lg:left-20">
        <div
          className={`absolute inset-0 transition-all duration-300 ${isScrolled
            ? "border-b border-black/8 bg-[hsl(var(--background)/0.96)] shadow-[0_18px_48px_-38px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-white/10 dark:bg-[hsl(var(--background)/0.78)]"
            : "border-b border-transparent bg-[hsl(var(--background)/0.88)] backdrop-blur-xl dark:bg-[hsl(var(--background)/0.55)]"
            }`}
        />

        <nav className="relative mx-auto max-w-[1680px] px-3 sm:px-5 lg:px-4 xl:pr-8 xl:pl-11 2xl:pr-10 2xl:pl-14">
          <div className="flex h-[4.5rem] sm:h-20 items-center gap-2 sm:gap-3 lg:gap-2.5 xl:gap-5">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0 overflow-hidden lg:max-w-[10.25rem] xl:mr-3 xl:max-w-[14.5rem] 2xl:mr-5 2xl:max-w-none">
              <div className="lg:hidden">
                <BrandLogo size="md" showIcon className="whitespace-nowrap" />
              </div>
              <div className="hidden items-center justify-center lg:flex xl:hidden">
                <BrandLogo
                  size="sm"
                  showIcon
                  className="whitespace-nowrap gap-1.5"
                  iconClassName="h-5 w-5"
                />
              </div>
              <div className="hidden xl:block">
                <BrandLogo size="md" className="whitespace-nowrap" />
              </div>
            </div>

            {/* Primary Navigation */}
            <div className="hidden lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:justify-center xl:justify-start">
              <HeaderNav />
            </div>

            {/* Laptop Actions (1024-1279): compact utility row */}
            <div className="hidden lg:flex xl:hidden items-center gap-0.5 rounded-full border border-black/10 bg-white/82 px-1 py-1 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10">
              <Link href={favoritesPath}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">{t("nav.saved")}</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary"
                onClick={() => setSearchOpen(true)}
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
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 transition-colors ${accountInitialButtonClass}`}
                  >
                    <span className="text-xs font-semibold leading-none">{userInitial}</span>
                    <span className="sr-only">{t("nav.account")}</span>
                  </Button>
                </Link>
              ) : (
                <Link href={loginPath}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 transition-colors ${accountAccentButtonClass}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="sr-only">{t("nav.account")}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden xl:flex xl:items-center xl:gap-2 2xl:gap-3 xl:shrink-0">
              {/* Saved */}
              <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/82 px-2 py-1.5 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10">
                <Link href={favoritesPath}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary"
                  >
                    <Heart className="h-4.5 w-4.5" />
                    <span className="sr-only">{t("nav.saved")}</span>
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-foreground transition-colors hover:bg-black/5 hover:text-primary dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-primary"
                  onClick={() => setSearchOpen(true)}
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
                          className="h-9 w-9 rounded-full border border-primary/25 bg-primary/12 text-primary hover:bg-primary/18 dark:border-primary/30 dark:bg-primary/18"
                          aria-label="Admin Dashboard"
                        >
                          <Settings2 className="h-4.5 w-4.5" />
                        </Button>
                      </Link>
                    )}

                    <Link href={getDashboardPath(user.role)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 transition-colors ${accountInitialButtonClass}`}
                      >
                        <span className="text-sm font-semibold leading-none">{userInitial}</span>
                        <span className="sr-only">{t("nav.account")}</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href={loginPath}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 transition-colors ${accountAccentButtonClass}`}
                    >
                      <User className="h-4.5 w-4.5" />
                      <span className="sr-only">{t("nav.account")}</span>
                    </Button>
                  </Link>
                )}

                <ThemeToggle variant="header" />
              </div>
            </div>

            {/* Laptop menu button */}
            <div className="hidden lg:flex xl:hidden items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-black/10 bg-white/80 text-foreground shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10 dark:text-white/85"
                aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <AlignJustify className="h-6 w-6" />}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden ml-auto flex items-center gap-1 sm:gap-3">
              <Link href={favoritesPath}>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-black/10 bg-white/80 text-foreground shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10 dark:text-white/85">
                  <Heart className="h-5 w-5 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-black/10 bg-white/80 text-foreground shadow-[0_12px_32px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/14 dark:bg-white/10 dark:text-white/85"
                aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-7 w-7 sm:h-8 sm:w-8" /> : <AlignJustify className="h-7 w-7 sm:h-8 sm:w-8" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="xl:hidden fixed inset-0 lg:left-20 z-[130] bg-black/50 backdrop-blur-sm"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-hidden="true"
                />

                {/* Mobile menu panel */}
                <m.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  data-mobile-menu-expanded="true"
                  className="xl:hidden fixed top-0 right-0 bottom-0 left-0 lg:left-20 z-[140] overflow-y-auto bg-background/95 text-foreground backdrop-blur-2xl dark:bg-background/70 touch-pan-y"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                <div className="px-4 pt-4 pb-6 space-y-4">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/75 dark:border-white/20 dark:bg-white/10"
                      aria-label={t("nav.closeMenu")}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex min-h-full flex-col">
                    <div className="mb-4 rounded-2xl border border-black/10 bg-white/70 p-3 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-white/12 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {t("common.theme")}
                        </div>
                        <ThemeToggle />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {t("common.language")}
                        </div>
                        <LanguageSwitcher
                          localeSwitchPaths={localeSwitchPaths}
                          containerClassName="min-w-0"
                          selectClassName="h-10 w-[10rem] rounded-full border-black/12 bg-white px-4 py-2 text-sm text-black shadow-none dark:border-white/12 dark:bg-white dark:text-black"
                        />
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full rounded-2xl border border-black/10 bg-white/66 px-2 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-white/12 dark:bg-white/5">
                    <div className="mx-3">
                      <Link
                        href={homePath}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-4 text-xl font-bold uppercase tracking-widest"
                      >
                        <Home className="h-6 w-6 text-primary" />
                        {t("nav.home")}
                      </Link>
                    </div>

                    {/* VISIT */}
                    <AccordionItem value="visit">
                      <div className="flex items-center">
                        <Link href={directoryPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <BedDouble className="h-6 w-6 text-primary" />
                            {t("nav.stay")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="mb-1 flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={buildDirectoryCategoryPath("places-to-stay")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Hotel className="h-4 w-4" /> {t("categoryNames.places-to-stay")}</Link>
                          <Link href={buildDirectoryCategoryPath("restaurants")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Utensils className="h-4 w-4" /> {t("categoryNames.restaurants")}</Link>
                          <Link href={buildDirectoryCategoryPath("beaches-clubs")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Palmtree className="h-4 w-4" /> {t("categoryNames.beaches-clubs")}</Link>
                          <Link href={buildDirectoryCategoryPath("wellness-spas")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Dumbbell className="h-4 w-4" /> {t("categoryNames.wellness-spas")}</Link>
                          <Link href={buildDirectoryCategoryPath("algarve-services")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Users className="h-4 w-4" /> {t("categoryNames.algarve-services")}</Link>
                          <Link href={buildDirectoryCategoryPath("things-to-do")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Compass className="h-4 w-4" /> {t("categoryNames.things-to-do")}</Link>
                          <Link href={buildDirectoryCategoryPath("whats-on")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Calendar className="h-4 w-4" /> {t("categoryNames.whats-on")}</Link>
                          <Link href={buildDirectoryCategoryPath("shopping-boutiques")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> {t("categoryNames.shopping-boutiques")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* EXPERIENCES */}
                    <AccordionItem value="experiences">
                      <div className="flex items-center">
                        <Link href={experiencesPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <Binoculars className="h-6 w-6 text-primary" />
                            {t("nav.experiences")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="mb-1 flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={buildDirectoryCategoryPath("wellness-spas")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Dumbbell className="h-4 w-4" /> {t("categoryNames.wellness-spas")}</Link>
                          <Link href={buildDirectoryCategoryPath("restaurants")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChefHat className="h-4 w-4" /> {t("categoryNames.restaurants")}</Link>
                          <Link href={buildDirectoryCategoryPath("algarve-services")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Users className="h-4 w-4" /> {t("categoryNames.algarve-services")}</Link>
                          <Link href={buildDirectoryCategoryPath("whats-on")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Calendar className="h-4 w-4" /> {t("categoryNames.whats-on")}</Link>
                          <Link href={buildDirectoryCategoryPath("shopping-boutiques")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> {t("categoryNames.shopping-boutiques")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* PROPERTIES */}
                    <AccordionItem value="properties">
                      <div className="flex items-center">
                        <Link href={propertiesPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <HouseHeart className="h-6 w-6 text-primary" />
                            {t("nav.properties")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="mb-1 flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={realEstatePath} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Building2 className="h-4 w-4" /> {t("realEstate.title")}</Link>
                          <Link href={mapPath} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><MapPin className="h-4 w-4" /> {t("nav.map")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* GOLF */}
                    <AccordionItem value="golf">
                      <div className="flex items-center">
                        <Link href={golfPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <FlagTriangleRight className="h-6 w-6 text-primary" />
                            {t("nav.golf")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="mb-1 flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={buildDirectoryCategoryPath("golf")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Trophy className="h-4 w-4" /> {t("categoryNames.golf")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <div className="mx-3 border-t border-primary/15">
                      <Link
                        href={destinationsPath}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-4 text-xl font-bold uppercase tracking-widest"
                      >
                        <Compass className="h-6 w-6 text-primary" />
                        {t("nav.destinations")}
                      </Link>
                    </div>

                    <div className="mx-3 border-t border-primary/15">
                      <Link
                        href={mapPath}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-4 text-xl font-bold uppercase tracking-widest"
                      >
                        <MapPin className="h-6 w-6 text-primary" />
                        {t("nav.map")}
                      </Link>
                    </div>

                    <div className="mx-3 border-t border-primary/15">
                      <Link
                        href={blogPath}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-4 text-xl font-bold uppercase tracking-widest"
                      >
                        <BookOpen className="h-6 w-6 text-primary" />
                        {t("nav.blog")}
                      </Link>
                    </div>
                  </Accordion>

                    <div className="mt-4 rounded-2xl border border-black/10 bg-white/66 p-3 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.45)] backdrop-blur-md dark:border-white/12 dark:bg-white/5">
                      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {t("nav.yourSpace")}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        <Link href={accountPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/85 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <User className="h-4 w-4 text-primary" />
                          {t("nav.account")}
                        </Link>
                        <Link href={tripsPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/85 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <Plane className="h-4 w-4 text-primary" />
                          {t("nav.myTrip")}
                        </Link>
                        <Link href={favoritesPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/85 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
                          <Heart className="h-4 w-4 text-primary" />
                          {t("dashboard.favorites.title")}
                        </Link>
                        <Link href={messagesPath} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/85 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary dark:border-white/10 dark:bg-white/10">
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
                </m.div>
              </>
            )}
          </AnimatePresence>
      </header>
      <MobileBottomNav />
    </>
  );
}

// Named export for components that import { Header }
export { Header };
