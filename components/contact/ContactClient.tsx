"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

import ContactPage from "@/legacy-pages/public/Contact";
import type { ContactSettings } from "@/hooks/useContactSettings";
import { useHydrated } from "@/hooks/useHydrated";

export interface ContactClientProps {
  initialContactSettings: ContactSettings | null;
}

export default function ContactClient({
  initialContactSettings,
}: ContactClientProps) {
  const queryClient = useQueryClient();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["contact-settings"], initialContactSettings);
    const serverShell = document.getElementById("contact-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
  }, [initialContactSettings, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <HelmetProvider>
      <ContactPage />
    </HelmetProvider>
  );
}
