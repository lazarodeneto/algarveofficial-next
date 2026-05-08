import { type ComponentProps } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
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

  const isActive = (href: string) => {
    const fullHref = l(href);
    if (href === '/') return pathname === '/' || pathname === l('/') || pathname === `${l('/')}/`;
    return pathname.startsWith(fullHref);
  };

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
            >
              <Icon className="bottom-nav__icon" />
              <span className="bottom-nav__label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
