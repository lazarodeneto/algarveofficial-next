"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  buildLocalizedPath,
  switchLocaleInPathname,
} from "@/lib/i18n/routing";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { isValidLocale, type Locale } from "@/lib/i18n/config";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function persistLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function useLocaleRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useCurrentLocale();

  const currentQueryString = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `?${qs}` : "";
  }, [searchParams]);

  return {
    locale,
    pathname,
    push: (href: string) => {
      const target = buildLocalizedPath(locale, href);
      router.push(target);
    },
    replace: (href: string) => {
      const target = buildLocalizedPath(locale, href);
      router.replace(target);
    },
    pushWithQuery: (href: string) => {
      const target = buildLocalizedPath(locale, href);
      router.push(`${target}${currentQueryString}`);
    },
    replaceWithQuery: (href: string) => {
      const target = buildLocalizedPath(locale, href);
      router.replace(`${target}${currentQueryString}`);
    },
    switchLocale: (nextLocale: string) => {
      if (!isValidLocale(nextLocale)) {
        return;
      }

      persistLocaleCookie(nextLocale);
      const nextPath = switchLocaleInPathname(pathname || "/", nextLocale);
      router.push(`${nextPath}${currentQueryString}`);
    },
  };
}
