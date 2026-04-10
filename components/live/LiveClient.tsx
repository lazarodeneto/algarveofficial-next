"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useHydrated } from "@/hooks/useHydrated";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

const LivePage = dynamic(() => import("@/legacy-pages/public/Live"), {
  loading: () => <div className="min-h-screen bg-background" aria-hidden="true" />,
});

export interface LiveClientProps {
  initialGlobalSettings: GlobalSetting[];
}

const LIVE_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
].sort();

export default function LiveClient({ initialGlobalSettings }: LiveClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

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
    <LivePage />
  );
}
