"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  buildLocalizedPath,
  switchLocaleInPathname,
} from "@/lib/i18n/routing";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";

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
      const nextPath = switchLocaleInPathname(pathname || "/", nextLocale);
      router.push(`${nextPath}${currentQueryString}`);
    },
  };
}
