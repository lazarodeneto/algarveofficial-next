"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { NavigationType, Router, createPath, type To } from "react-router";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

import PartnerPage from "@/legacy-pages/public/Partner";
import type { PartnerSettings } from "@/hooks/usePartnerSettings";
import { useHydrated } from "@/hooks/useHydrated";

type LegacyNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

export interface PartnerClientProps {
  initialPartnerSettings: PartnerSettings | null;
}

function resolveToPath(to: To) {
  return typeof to === "string" ? to : createPath(to);
}

export default function PartnerClient({
  initialPartnerSettings,
}: PartnerClientProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const mounted = useHydrated();

  const search = nextSearchParams?.toString() ?? "";

  const location = useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: "",
      state: null,
      key: `${pathname}${search ? `?${search}` : ""}`,
    }),
    [pathname, search],
  );

  const navigator = useMemo<LegacyNavigator>(
    () => ({
      createHref: (to) => resolveToPath(to),
      go: (delta) => {
        window.history.go(delta);
      },
      push: (to) => {
        router.push(resolveToPath(to));
      },
      replace: (to) => {
        router.replace(resolveToPath(to));
      },
    }),
    [router],
  );

  useEffect(() => {
    queryClient.setQueryData(["partner-settings"], initialPartnerSettings);
    const serverShell = document.getElementById("partner-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [initialPartnerSettings, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <HelmetProvider>
      <Router
        location={location as never}
        navigator={navigator as never}
        navigationType={NavigationType.Pop}
      >
        <PartnerPage />
      </Router>
    </HelmetProvider>
  );
}
