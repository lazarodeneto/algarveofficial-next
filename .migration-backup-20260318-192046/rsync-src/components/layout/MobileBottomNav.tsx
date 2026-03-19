import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@/components/router/nextRouterCompat";
import { Home, Binoculars, Building2, TrendingUp, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLangPrefix, buildLangPath } from "@/hooks/useLangPrefix";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { useTranslation } from "react-i18next";

const navItems = [
  { name: "nav.home", href: "/", icon: Home },
  { name: "nav.visit", href: "/destinations", icon: Binoculars },
  { name: "nav.live", href: "/live", icon: Building2 },
  { name: "nav.invest", href: "/invest", icon: TrendingUp },
  { name: "nav.directory", href: "/directory", icon: List },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { mobileMenuOpen } = useMobileMenu();
  const langPrefix = useLangPrefix();
  const { t } = useTranslation();
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const isActive = (href: string) => {
    const fullHref = buildLangPath(langPrefix, href);
    if (href === '/') return location.pathname === '/' || location.pathname === langPrefix || location.pathname === langPrefix + "/";
    return location.pathname.startsWith(fullHref);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsUserScrolling(false);
      }, 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Hide when mobile menu is open
  if (mobileMenuOpen) {
    return null;
  }

  return (
    <nav
      className={cn(
        "bottom-nav xl:hidden transition-transform duration-200 ease-out",
        isUserScrolling && "translate-y-[calc(100%+env(safe-area-inset-bottom))]"
      )}
      style={{ display: mobileMenuOpen ? 'none' : undefined }}
    >
      <div className="flex items-center justify-around w-full h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={buildLangPath(langPrefix, item.href)}
              className={cn(
                "flex items-center justify-center p-3 rounded-full transition-colors tap-target",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={t(item.name)}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
