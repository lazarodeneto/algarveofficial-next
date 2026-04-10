"use client";

import Link, { type LinkProps } from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  buildLocalizedPath,
  isPassthroughHref,
  type LocalizedPathInput,
} from "@/lib/i18n/localized-routing";

type LocaleLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Omit<LinkProps, "href"> & {
    href: LocalizedPathInput;
    locale?: string;
    children: ReactNode;
  };

const isExternalHref = (href: string) =>
  href.startsWith("http://") ||
  href.startsWith("https://") ||
  href.startsWith("mailto:") ||
  href.startsWith("tel:") ||
  href.startsWith("//") ||
  href.startsWith("#");

export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  ({ href, locale, children, prefetch = false, ...props }, ref) => {
    const currentLocale = useCurrentLocale();

    if (typeof href === "string" && isExternalHref(href)) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      );
    }

    const finalHref =
      typeof href === "string" && isPassthroughHref(href)
        ? href
        : buildLocalizedPath(locale || currentLocale, href);

    return (
      <Link ref={ref} href={finalHref} prefetch={prefetch} {...props}>
        {children}
      </Link>
    );
  }
);

LocaleLink.displayName = "LocaleLink";
