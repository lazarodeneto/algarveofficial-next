"use client";

import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { FOOTER_NAV_ITEMS } from "@/lib/navigation/nav-items";

export function FooterNav() {
  const { t } = useTranslation();
  const ariaLabel = t("nav.footerNavigation", "Footer navigation");

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-4">
      {FOOTER_NAV_ITEMS.map((item) => (
        <LocaleLink key={item.href} href={item.href} className="hover:underline">
          {t(item.labelKey, item.fallbackLabel)}
        </LocaleLink>
      ))}
    </nav>
  );
}
