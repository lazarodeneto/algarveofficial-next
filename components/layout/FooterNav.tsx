"use client";

import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { FOOTER_NAV_ITEMS } from "@/lib/navigation/nav-items";

export function FooterNav() {
  const { t } = useTranslation();
  const ariaLabel = t("nav.footerNavigation");

  return (
    <nav
      aria-label={ariaLabel}
      className="flex w-full flex-wrap justify-center gap-x-5 gap-y-3 text-center sm:justify-start sm:text-left"
    >
      {FOOTER_NAV_ITEMS.map((item) => (
        <LocaleLink
          key={item.href}
          href={item.href}
          className="text-body-sm text-foreground/90 transition-colors hover:text-primary hover:underline"
        >
          {t(item.labelKey, item.fallbackLabel)}
        </LocaleLink>
      ))}
    </nav>
  );
}
