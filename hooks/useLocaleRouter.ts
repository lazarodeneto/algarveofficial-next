"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  buildLocalizedPath,
  switchLocaleInPathname,
  type LocalizedPathInput,
  type LocalizedRouteOptions,
} from "@/lib/i18n/localized-routing";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import {
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/route-rules";

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

  const currentHash =
    typeof window !== "undefined" ? window.location.hash || "" : "";

  function preserveCurrentLocationState(target: string): string {
    const withQuery = target.includes("?") ? target : `${target}${currentQueryString}`;
    return withQuery.includes("#") ? withQuery : `${withQuery}${currentHash}`;
  }

  function buildTarget(
    href: LocalizedPathInput,
    options?: LocalizedRouteOptions,
  ): string {
    return buildLocalizedPath(locale, href, options);
  }

  return {
    locale,
    pathname,
    push: (href: LocalizedPathInput, options?: LocalizedRouteOptions) => {
      const target = buildTarget(href, options);
      router.push(target);
    },
    replace: (href: LocalizedPathInput, options?: LocalizedRouteOptions) => {
      const target = buildTarget(href, options);
      router.replace(target);
    },
    pushWithQuery: (href: LocalizedPathInput, options?: LocalizedRouteOptions) => {
      const target = buildTarget(href, options);
      router.push(`${target}${currentQueryString}`);
    },
    replaceWithQuery: (href: LocalizedPathInput, options?: LocalizedRouteOptions) => {
      const target = buildTarget(href, options);
      router.replace(`${target}${currentQueryString}`);
    },
    switchLocale: (nextLocale: string, targetPath?: LocalizedPathInput) => {
      if (!isValidLocale(nextLocale)) {
        return;
      }

      persistLocaleCookie(nextLocale);
      const nextPath = targetPath
        ? buildLocalizedPath(nextLocale, targetPath)
        : switchLocaleInPathname(pathname || "/", nextLocale);
      router.push(preserveCurrentLocationState(nextPath));
    },
  };
}
