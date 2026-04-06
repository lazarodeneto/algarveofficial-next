"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import InvestPage from "@/legacy-pages/public/Invest";
import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useHydrated } from "@/hooks/useHydrated";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";

export interface InvestClientProps {
  initialGlobalSettings: GlobalSetting[];
}

const INVEST_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
].sort();

export default function InvestClient({
  initialGlobalSettings,
}: InvestClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    // Seed the same cache key used by useGlobalSettings inside the CMS provider.
    queryClient.setQueryData(["global-settings", INVEST_CMS_KEYS], initialGlobalSettings);
    const serverShell = document.getElementById("invest-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [initialGlobalSettings, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <InvestPage />
  );
}
