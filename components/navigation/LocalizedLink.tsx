"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createLocalizedHref } from "@/lib/i18n/navigation";

type LocalizedLinkProps = Omit<LinkProps, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

/**
 * Drop-in replacement for next/link that automatically prepends the
 * current locale prefix. Uses LocaleContext (derived from URL params)
 * as the single source of truth.
 *
 * Usage:
 *   <LocalizedLink href="/directory">Visit</LocalizedLink>
 *   // Renders: /en/directory, /pt-pt/directory, etc.
 *
 * Paths starting with /api or /auth are
 * passed through without locale prefix.
 */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const locale = useLocale();
    const localizedHref = createLocalizedHref(href, locale);

    return <Link ref={ref} href={localizedHref} {...props} />;
  }
);
