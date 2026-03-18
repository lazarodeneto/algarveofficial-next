"use client";

import type { ComponentProps, ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NavigationType, Router, createPath, type To } from "react-router";

type BridgeNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

export type LegacySearchParamsUpdater = (
  nextParams: URLSearchParams,
  options?: { replace?: boolean },
) => void;

export function resolveLegacyTo(to: To) {
  return typeof to === "string" ? to : createPath(to);
}

export function useLegacyRouterBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();
  const search = nextSearchParams.toString();

  const location = {
    pathname,
    search: search ? `?${search}` : "",
    hash: "",
    state: null,
    key: `${pathname}${search ? `?${search}` : ""}`,
  };

  const navigator: BridgeNavigator = {
    createHref: (to) => resolveLegacyTo(to),
    go: (delta) => {
      window.history.go(delta);
    },
    push: (to) => {
      router.push(resolveLegacyTo(to));
    },
    replace: (to) => {
      router.replace(resolveLegacyTo(to));
    },
  };

  return {
    router,
    pathname,
    nextSearchParams,
    location,
    navigator,
  };
}

export function useLegacySearchParams(): [URLSearchParams, LegacySearchParamsUpdater] {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const params = new URLSearchParams(nextSearchParams.toString());

  const setParams: LegacySearchParamsUpdater = (updatedParams, options) => {
    const query = updatedParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    if (options?.replace) {
      router.replace(href);
      return;
    }
    router.push(href);
  };

  return [params, setParams];
}

export function LegacyRouterProvider({ children }: { children: ReactNode }) {
  const { location, navigator } = useLegacyRouterBridge();

  return (
    <Router location={location as never} navigator={navigator as never} navigationType={NavigationType.Pop}>
      {children}
    </Router>
  );
}

type LegacyLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  to: To;
};

export function LegacyLink({ to, ...props }: LegacyLinkProps) {
  return <Link href={resolveLegacyTo(to) as LinkProps["href"]} {...props} />;
}
