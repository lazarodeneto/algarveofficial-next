import { useEffect, useRef, useState, type ComponentProps } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Home, BedDouble, Binoculars, HouseHeart, FlagTriangleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useMobileMenu } from "@/contexts/MobileMenuContext";
import { useTranslation } from "react-i18next";

function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

const navItems = [
  { name: "nav.home", href: "/", icon: Home },
  { name: "nav.experiences", href: "/experiences", icon: Binoculars },
  { name: "nav.stay", href: "/stay?category=places-to-stay", icon: BedDouble },
  { name: "nav.properties", href: "/properties", icon: HouseHeart },
  { name: "nav.golf", href: "/golf", icon: FlagTriangleRight },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const { mobileMenuOpen } = useMobileMenu();
  const l = useLocalePath();
  const { t } = useTranslation();
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const isActive = (href: string) => {
    const fullHref = l(href);
    if (href === '/') return pathname === '/' || pathname === l('/') || pathname === `${l('/')}/`;
    return pathname.startsWith(fullHref);
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
        "bottom-nav lg:hidden transition-transform duration-200 ease-out",
        isUserScrolling && "translate-y-[calc(100%+env(safe-area-inset-bottom))]"
      )}
      style={{ display: mobileMenuOpen ? 'none' : undefined }}
      aria-label={t("nav.mobilePrimary")}
    >
      <div className="bottom-nav__inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={l(item.href)}
              title={t(item.name)}
              className={cn(
                "bottom-nav__link tap-target",
                active
                  ? "bottom-nav__link--active"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={t(item.name)}
            >
              <Icon className="bottom-nav__icon" />
              <span className="bottom-nav__label">{t(item.name)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
