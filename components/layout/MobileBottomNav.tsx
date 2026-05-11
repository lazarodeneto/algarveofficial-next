import {
  type ComponentProps,
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { useMobileChromeScrollState } from "@/hooks/useMobileChromeScrollState";
import { useTranslation } from "react-i18next";
import { PUBLIC_NAV_ICONS } from "@/components/layout/public-nav-icons";
import { PUBLIC_SIDEBAR_NAV_ITEMS } from "@/lib/navigation/nav-items";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { mobileMenuOpen } = useMobileMenu();
  const l = useLocalePath();
  const { t } = useTranslation();
  const { isUserScrolling } = useMobileChromeScrollState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    isOverflowing: false,
    progress: 0,
  });

  const updateScrollState = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const isOverflowing = maxScroll > 4;
    const scrollLeft = Math.max(0, scroller.scrollLeft);

    setScrollState({
      canScrollLeft: isOverflowing && scrollLeft > 4,
      canScrollRight: isOverflowing && scrollLeft < maxScroll - 4,
      isOverflowing,
      progress: isOverflowing ? Math.min(1, scrollLeft / maxScroll) : 0,
    });
  }, []);

  const isActive = (href: string) => {
    const fullHref = l(href);
    if (href === '/') return pathname === '/' || pathname === l('/') || pathname === `${l('/')}/`;
    return pathname.startsWith(fullHref);
  };

  const scrollByPage = useCallback((direction: "previous" | "next") => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const distance = scroller.clientWidth * 0.72 * (direction === "next" ? 1 : -1);

    scroller.scrollBy({
      left: distance,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let frameId = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleUpdate)
        : null;
    resizeObserver?.observe(scroller);

    return () => {
      window.cancelAnimationFrame(frameId);
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const activeLink = scroller?.querySelector<HTMLElement>('[data-active="true"]');
    if (!scroller || !activeLink || typeof activeLink.scrollIntoView !== "function") {
      updateScrollState();
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    activeLink.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    const timeoutId = window.setTimeout(updateScrollState, 260);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, updateScrollState]);

  // Hide when mobile menu is open
  if (mobileMenuOpen) {
    return null;
  }

  const navStyle = {
    "--bottom-nav-scroll-progress": scrollState.progress.toFixed(4),
  } as CSSProperties;

  return (
    <nav
      className={cn(
        "bottom-nav lg:hidden transition-transform duration-200 ease-out",
        isUserScrolling && "translate-y-[calc(100%+env(safe-area-inset-bottom))]"
      )}
      style={navStyle}
      aria-label={t("nav.mobilePrimary")}
      aria-describedby="mobile-bottom-nav-hint"
      data-can-scroll-left={scrollState.canScrollLeft ? "true" : "false"}
      data-can-scroll-right={scrollState.canScrollRight ? "true" : "false"}
      data-overflowing={scrollState.isOverflowing ? "true" : "false"}
    >
      <span id="mobile-bottom-nav-hint" className="sr-only">
        {t("nav.mobileScrollHint", "Swipe horizontally to see more navigation items.")}
      </span>

      <div className="bottom-nav__shell">
        <button
          type="button"
          className="bottom-nav__scroll-button bottom-nav__scroll-button--left"
          onClick={() => scrollByPage("previous")}
          aria-label={t("nav.scrollPrevious", "Previous navigation items")}
          hidden={!scrollState.canScrollLeft}
        >
          <ChevronLeft className="bottom-nav__scroll-icon" aria-hidden="true" />
        </button>

        <div ref={scrollRef} className="bottom-nav__inner">
          {PUBLIC_SIDEBAR_NAV_ITEMS.map((item) => {
            const Icon = PUBLIC_NAV_ICONS[item.labelKey];
            const active = isActive(item.href);
            const label = t(item.labelKey, item.fallbackLabel);

            if (!Icon) return null;

            return (
              <Link
                key={item.href}
                href={l(item.href)}
                title={label}
                className={cn(
                  "bottom-nav__link tap-target",
                  active
                    ? "bottom-nav__link--active"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                data-active={active ? "true" : undefined}
              >
                <Icon className="bottom-nav__icon" />
                <span className="bottom-nav__label">{label}</span>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="bottom-nav__scroll-button bottom-nav__scroll-button--right"
          onClick={() => scrollByPage("next")}
          aria-label={t("nav.scrollNext", "Next navigation items")}
          hidden={!scrollState.canScrollRight}
        >
          <ChevronRight className="bottom-nav__scroll-icon" aria-hidden="true" />
        </button>

        <div className="bottom-nav__progress" aria-hidden="true">
          <span className="bottom-nav__progress-thumb" />
        </div>
      </div>
    </nav>
  );
}
