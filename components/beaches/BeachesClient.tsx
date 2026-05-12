"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useHydrated } from "@/hooks/useHydrated";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { hideServerShell } from "@/lib/dom/server-shell";
import { globalSettingsQueryKey } from "@/lib/query-keys";

const BeachesPage = dynamic(() => import("@/legacy-pages/public/Beaches"), {
  loading: () => <div className="min-h-screen bg-background" aria-hidden="true" />,
});

export interface BeachesClientProps {
  initialGlobalSettings: GlobalSetting[];
  locale: string;
}

const BEACHES_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
].sort();

export default function BeachesClient({ initialGlobalSettings, locale }: BeachesClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(
      globalSettingsQueryKey(BEACHES_CMS_KEYS, locale),
      initialGlobalSettings,
    );
    return hideServerShell("beaches-server-shell");
  }, [initialGlobalSettings, locale, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <BeachesPage />
  );
}
