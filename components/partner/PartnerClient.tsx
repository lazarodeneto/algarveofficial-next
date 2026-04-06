"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import PartnerPage from "@/legacy-pages/public/Partner";
import type { PartnerSettings } from "@/hooks/usePartnerSettings";
import { useHydrated } from "@/hooks/useHydrated";

export interface PartnerClientProps {
  initialPartnerSettings: PartnerSettings | null;
}

export default function PartnerClient({
  initialPartnerSettings,
}: PartnerClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

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
    <PartnerPage />
  );
}
