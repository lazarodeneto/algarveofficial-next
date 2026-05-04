"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { GlobalSetting } from "@/hooks/useGlobalSettings";
import { useHydrated } from "@/hooks/useHydrated";
import { CMS_GLOBAL_SETTING_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { hideServerShell } from "@/lib/dom/server-shell";

const ExperiencesPage = dynamic(() => import("@/legacy-pages/public/Experiences"), {
  loading: () => <div className="min-h-screen bg-background" aria-hidden="true" />,
});

export interface ExperiencesClientProps {
  initialGlobalSettings: GlobalSetting[];
}

const EXPERIENCES_CMS_KEYS = [
  CMS_GLOBAL_SETTING_KEYS.textOverrides,
  CMS_GLOBAL_SETTING_KEYS.pageConfigs,
  CMS_GLOBAL_SETTING_KEYS.designTokens,
  CMS_GLOBAL_SETTING_KEYS.customCss,
].sort();

export default function ExperiencesClient({ initialGlobalSettings }: ExperiencesClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["global-settings", EXPERIENCES_CMS_KEYS], initialGlobalSettings);
    return hideServerShell("experiences-server-shell");
  }, [initialGlobalSettings, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <ExperiencesPage />
  );
}
