"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@/components/router/nextRouterCompat";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlignJustify,
  X,
  User,
  Heart,
  Search,
  Settings2,
  Binoculars,
  Home,
  TrendingUp,
  Hotel,
  Utensils,
  Compass,
  Palmtree,
  Trophy,
  Dumbbell,
  Users,
  ShoppingBag,
  Building2,
  Plus,
  Calendar,
  ChefHat,
  Sparkles,
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
import { HeaderCompactNav, HeaderMegaMenu } from "./HeaderMegaMenu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Header() {
  const { mobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const { t } = useTranslation();
  const langPrefix = useLangPrefix();
  const loginPath = buildLangPath(langPrefix, "/login");
  const directoryPath = buildLangPath(langPrefix, "/directory");
  const investPath = buildLangPath(langPrefix, "/invest");
  const realEstatePath = buildLangPath(langPrefix, "/real-estate");
  const partnerPath = buildLangPath(langPrefix, "/partner");
  const favoritesPath = isAuthenticated ? "/dashboard/favorites" : loginPath;
  const buildDirectoryCategoryPath = (category: string) =>
    buildLangPath(langPrefix, `/directory?category=${category}`);

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

      <header className="site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div
          className={`absolute inset-0 bg-[var(--colour-ink)] transition-all duration-300 ${isScrolled ? "border-b border-white/10 shadow-sm" : "border-b border-transparent shadow-none"
            }`}
        />

        <nav className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-6 xl:px-8">
          <div className="flex h-[4.5rem] sm:h-20 items-center gap-2.5 sm:gap-3 lg:gap-3 xl:gap-5">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0 lg:max-w-[13.5rem] xl:max-w-none">
              <BrandLogo size="md" showIcon className="whitespace-nowrap brand-logo-inverse" />
            </div>

            {/* Tablet Navigation */}
            <HeaderCompactNav />

            {/* Desktop Navigation (Mega Menu) */}
            <div className="hidden lg:flex lg:min-w-0 lg:flex-1 lg:items-center lg:justify-center">
              <HeaderMegaMenu />
            </div>

            <div className="hidden md:flex md:items-center md:shrink-0">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="header-icon-button h-11 w-11 xl:h-16 xl:w-16 text-primary hover:text-primary/80 [&_svg]:!size-6 xl:[&_svg]:!size-8"
                    >
                      <Link href={directoryPath}>
                        <ListChecks />
                        <span className="sr-only">{t("nav.directory", "Directory")}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    {t("nav.directory", "Directory")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex lg:items-center lg:gap-1.5 xl:gap-3 lg:shrink-0">
              {/* Saved */}
              <Link href={favoritesPath}>
                <Button variant="ghost" size="icon" className="header-icon-button text-muted-foreground hover:text-primary">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">{t("nav.saved", "Saved")}</span>
                </Button>
              </Link>

              {/* Search Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="header-icon-button text-muted-foreground hover:text-primary"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">{t("nav.search", "Search")}</span>
              </Button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Account / Login */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1.5">
                  {/* Admin Quick Access */}
                  {(user.role === "admin" || user.role === "editor") && (
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="header-icon-button h-9 w-9 rounded-full glass-button-outline bg-primary/90 border border-primary/40 hover:bg-primary hover:border-primary/60 p-0"
                        aria-label="Admin Dashboard"
                      >
                        <Settings2 className="h-5 w-5 text-black" />
                      </Button>
                    </Link>
                  )}

                  <Link href={getDashboardPath(user.role)}>
                    <Button variant="ghost" className="header-icon-button gap-2 hover:bg-primary/10 px-2 xl:px-3">
                      <User className="h-5 w-5" />
                      <span className="hidden xl:inline text-sm font-medium">{t("nav.account")}</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={loginPath} className="ml-2">
                  <Button variant="ghost" className="header-icon-button gap-2 hover:bg-primary/10 px-2 xl:px-3">
                    <User className="h-5 w-5" />
                    <span className="hidden xl:inline text-sm font-medium">{t("nav.account")}</span>
                  </Button>
                </Link>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden ml-auto flex items-center gap-1 sm:gap-3">
              <Link href={favoritesPath}>
                <Button variant="ghost" size="icon" className="header-icon-button h-10 w-10 sm:h-11 sm:w-11">
                  <Heart className="h-5 w-5 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="header-icon-button h-10 w-10 sm:h-11 sm:w-11"
                aria-label={mobileMenuOpen ? t("nav.closeMenu", "Close menu") : t("nav.openMenu", "Open menu")}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="xl:hidden fixed inset-0 top-20 z-[55] bg-black/50 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Mobile menu panel */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "calc(100vh - 5rem)" }}
                style={{ height: 'calc(100dvh - 5rem)' }}
                exit={{ opacity: 0, height: 0 }}
                data-mobile-menu-expanded="true"
                className="xl:hidden fixed left-0 right-0 top-20 z-[60] overflow-y-auto bg-background/95 text-foreground backdrop-blur-2xl border-b border-border dark:bg-background/70 dark:border-white/10 touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="px-4 py-6 space-y-4">

                  <Accordion type="single" collapsible className="w-full">
                    {/* VISIT */}
                    <AccordionItem value="visit">
                      <div className="flex items-center">
                        <Link href={directoryPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <Binoculars className="h-6 w-6 text-primary" />
                            {t("nav.visit")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={buildDirectoryCategoryPath("places-to-stay")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Hotel className="h-4 w-4" /> {t("categoryNames.places-to-stay")}</Link>
                          <Link href={buildDirectoryCategoryPath("restaurants")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Utensils className="h-4 w-4" /> {t("categoryNames.restaurants")}</Link>
                          <Link href={buildDirectoryCategoryPath("golf")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Trophy className="h-4 w-4" /> {t("categoryNames.golf")}</Link>
                          <Link href={buildDirectoryCategoryPath("beaches-clubs")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Palmtree className="h-4 w-4" /> {t("categoryNames.beaches-clubs")}</Link>
                          <Link href={buildDirectoryCategoryPath("wellness-spas")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Dumbbell className="h-4 w-4" /> {t("categoryNames.wellness-spas")}</Link>
                          <Link href={buildDirectoryCategoryPath("algarve-services")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Users className="h-4 w-4" /> {t("categoryNames.algarve-services")}</Link>
                          <Link href={buildDirectoryCategoryPath("things-to-do")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Compass className="h-4 w-4" /> {t("categoryNames.things-to-do")}</Link>
                          <Link href={buildDirectoryCategoryPath("whats-on")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Calendar className="h-4 w-4" /> {t("categoryNames.whats-on")}</Link>
                          <Link href={buildDirectoryCategoryPath("shopping-boutiques")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> {t("categoryNames.shopping-boutiques")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* LIVE */}
                    <AccordionItem value="live">
                      <div className="flex items-center">
                        <Link href={directoryPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <Home className="h-6 w-6 text-primary" />
                            {t("nav.live")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={buildDirectoryCategoryPath("wellness-spas")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Dumbbell className="h-4 w-4" /> {t("categoryNames.wellness-spas")}</Link>
                          <Link href={buildDirectoryCategoryPath("restaurants")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ChefHat className="h-4 w-4" /> {t("categoryNames.restaurants")}</Link>
                          <Link href={buildDirectoryCategoryPath("algarve-services")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Users className="h-4 w-4" /> {t("categoryNames.algarve-services")}</Link>
                          <Link href={buildDirectoryCategoryPath("whats-on")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Calendar className="h-4 w-4" /> {t("categoryNames.whats-on")}</Link>
                          <Link href={buildDirectoryCategoryPath("shopping-boutiques")} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> {t("categoryNames.shopping-boutiques")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* INVEST */}
                    <AccordionItem value="invest">
                      <div className="flex items-center">
                        <Link href={investPath} onClick={() => setMobileMenuOpen(false)} className="flex-grow text-xl font-bold uppercase tracking-widest py-4">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            {t("nav.invest")}
                          </div>
                        </Link>
                        <AccordionTrigger className="w-12 h-12 flex items-center justify-center p-0" />
                      </div>
                      <AccordionContent>
                        <div className="flex flex-col space-y-2 pl-4 border-l-2 border-primary/20 ml-3 mt-2">
                          <Link href={investPath} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><TrendingUp className="h-4 w-4" /> {t("nav.invest", "Invest")}</Link>
                          <Link href={realEstatePath} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Building2 className="h-4 w-4" /> {t("realEstate.title", "Real Estate Directory")}</Link>
                          <Link href={partnerPath} onClick={() => setMobileMenuOpen(false)} className="py-2 pl-4 text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Plus className="h-4 w-4" /> {t("realEstate.addListing", "Add Real Estate Listing")}</Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Mobile Actions */}
                  <div className="pt-6 border-t border-border space-y-3">
                    <Link href={favoritesPath} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-4 text-base">
                        <Heart className="h-5 w-5" />
                        {t("dashboard.favorites.title", "Saved")}
                      </Button>
                    </Link>

                    {isAuthenticated && user ? (
                      <>
                        <Link href={getDashboardPath(user.role)} onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3 text-base">
                            <User className="h-5 w-5" />
                            <span>{t("nav.account")}</span>
                          </Button>
                        </Link>
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
                      </>
                    ) : (
                      <Link href={loginPath} onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-base">
                          <User className="h-5 w-5" />
                          {t("nav.login")}
                        </Button>
                      </Link>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-medium text-muted-foreground pl-2">{t("common.language", "Language")}</span>
                      <LanguageSwitcher />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-medium text-muted-foreground pl-2">{t("common.theme", "Theme")}</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
