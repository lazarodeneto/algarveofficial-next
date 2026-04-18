"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useHydrated } from "@/hooks/useHydrated";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

const BeachesPage = dynamic(() => import("@/legacy-pages/public/Beaches"), {
  loading: () => <div className="min-h-screen bg-background" aria-hidden="true" />,
});

export interface BeachesClientProps {
  initialGlobalSettings: GlobalSetting[];
}

const BEACHES_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
].sort();

export default function BeachesClient({ initialGlobalSettings }: BeachesClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["global-settings", BEACHES_CMS_KEYS], initialGlobalSettings);
    const serverShell = document.getElementById("beaches-server-shell");
    if (serverShell) {
      serverShell.remove();
    }
  }, [initialGlobalSettings, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <BeachesPage />
  );
}
