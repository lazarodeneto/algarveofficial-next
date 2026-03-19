"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react";
import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

type ClassNameValue =
  | string
  | ((state: { isActive: boolean; isPending: boolean }) => string | undefined);

type NextHref = ComponentProps<typeof NextLink>["href"];

export interface LinkProps extends Omit<ComponentProps<typeof NextLink>, "href"> {
  href?: NextHref;
  to?: NextHref;
}

export interface NavLinkProps
  extends Omit<ComponentProps<typeof NextLink>, "className" | "href"> {
  href?: NextHref;
  to?: NextHref;
  className?: ClassNameValue;
  end?: boolean;
}

export interface NavigateProps {
  href?: string;
  to?: string;
  replace?: boolean;
  state?: unknown;
}

export interface LocationLike {
  pathname: string;
  search: string;
  hash: string;
  href: string;
}

type URLSearchParamsInit =
  | string
  | string[][]
  | Record<string, string | string[]>
  | URLSearchParams;

type SetURLSearchParams = (
  nextInit: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
  navigateOpts?: { replace?: boolean; state?: unknown }
) => void;

export const Link = forwardRef<
  HTMLAnchorElement,
  LinkProps
>(function Link({ href, to, ...props }, ref) {
  const resolvedHref = href ?? to ?? "/";
  return <NextLink ref={ref} href={resolvedHref} {...props} />;
});

export function MemoryRouter({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function Outlet() {
  return null;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  const params = useNextParams<Record<string, string | string[] | undefined>>();

  return useMemo(() => {
    const normalized: Record<string, string | undefined> = {};

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        normalized[key] = value[0];
        return;
      }

      normalized[key] = value;
    });

    return normalized as T;
  }, [params]);
}

export function useLocation(): LocationLike {
  const pathname = usePathname() || "";
  const searchParams = useNextSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => {
      setHash(window.location.hash || "");
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  const searchValue = searchParams?.toString() || "";
  const search = searchValue ? `?${searchValue}` : "";

  return useMemo(
    () => ({
      pathname,
      search,
      hash,
      href: `${pathname}${search}${hash}`,
    }),
    [hash, pathname, search]
  );
}

function toUrlSearchParams(init: URLSearchParamsInit): URLSearchParams {
  if (typeof init === "string" || Array.isArray(init) || init instanceof URLSearchParams) {
    return new URLSearchParams(init);
  }

  const params = new URLSearchParams();
  Object.entries(init).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }

    params.set(key, value);
  });

  return params;
}

export function useSearchParams(defaultInit?: URLSearchParamsInit): [URLSearchParams, SetURLSearchParams] {
  const router = useRouter();
  const pathname = usePathname() || "";
  const nextParams = useNextSearchParams();

  const params = useMemo(() => {
    const existing = nextParams?.toString();
    if (existing && existing.length > 0) {
      return new URLSearchParams(existing);
    }

    return defaultInit ? toUrlSearchParams(defaultInit) : new URLSearchParams();
  }, [defaultInit, nextParams]);

  const setParams: SetURLSearchParams = useCallback(
    (nextInit, navigateOpts) => {
      const nextValue =
        typeof nextInit === "function" ? nextInit(new URLSearchParams(params.toString())) : nextInit;
      const serialized = toUrlSearchParams(nextValue).toString();
      const href = serialized ? `${pathname}?${serialized}` : pathname;

      if (navigateOpts?.replace) {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [params, pathname, router]
  );

  return [params, setParams];
}

export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === "number") {
        window.history.go(to);
        return;
      }

      if (options?.replace) {
        router.replace(to);
        return;
      }

      router.push(to);
    },
    [router]
  );
}

export function useNavigationType(): "POP" | "PUSH" {
  return "PUSH";
}

export function Navigate({ href, to, replace }: NavigateProps) {
  const navigate = useNavigate();
  const target = href ?? to ?? "/";

  useEffect(() => {
    navigate(target, { replace });
  }, [navigate, replace, target]);

  return null;
}

export const NavLink = forwardRef<
  HTMLAnchorElement,
  NavLinkProps
>(function NavLink({ className, end, href, to, ...props }, ref) {
  const targetHref = href ?? to ?? "/";
  const { pathname } = useLocation();
  const hrefValue = typeof targetHref === "string" ? targetHref : targetHref.toString();
  const isActive = end ? pathname === hrefValue : pathname.startsWith(hrefValue);
  const resolvedClassName =
    typeof className === "function"
      ? className({ isActive, isPending: false })
      : className;

  return (
    <NextLink
      ref={ref}
      href={targetHref}
      className={resolvedClassName}
      {...props}
    />
  );
});
