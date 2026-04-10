"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { ContactSettings } from "@/hooks/useContactSettings";
import { useHydrated } from "@/hooks/useHydrated";

const ContactPage = dynamic(() => import("@/legacy-pages/public/Contact"), {
  loading: () => <div className="min-h-screen bg-background" aria-hidden="true" />,
});

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
    <ContactPage />
  );
}
