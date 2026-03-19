"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { NavigationType, Router, createPath, type To } from "react-router";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

import LivePage from "@/legacy-pages/public/Live";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useHydrated } from "@/hooks/useHydrated";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

type LegacyNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

export interface LiveClientProps {
  initialGlobalSettings: GlobalSetting[];
}

const LIVE_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
].sort();

function resolveToPath(to: To) {
  return typeof to === "string" ? to : createPath(to);
}

export default function LiveClient({ initialGlobalSettings }: LiveClientProps) {
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
    queryClient.setQueryData(["global-settings", LIVE_CMS_KEYS], initialGlobalSettings);
    const serverShell = document.getElementById("live-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [initialGlobalSettings, queryClient]);

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
        <LivePage />
      </Router>
    </HelmetProvider>
  );
}
