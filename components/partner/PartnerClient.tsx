"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { PartnerSettings } from "@/hooks/usePartnerSettings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useHydrated } from "@/hooks/useHydrated";
import { hideServerShell } from "@/lib/dom/server-shell";

const PartnerPage = dynamic(() => import("@/legacy-pages/public/Partner"), {
  loading: () => <div className="min-h-screen bg-background" aria-hidden="true" />,
});

export interface PartnerClientProps {
  initialPartnerSettings: PartnerSettings | null;
}

export default function PartnerClient({
  initialPartnerSettings,
}: PartnerClientProps) {
  const queryClient = useQueryClient();
  const locale = useCurrentLocale();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["partner-settings", locale], initialPartnerSettings);
    return hideServerShell("partner-server-shell");
  }, [initialPartnerSettings, locale, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <PartnerPage />
  );
}
