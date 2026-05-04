"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { ContactSettings } from "@/hooks/useContactSettings";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useHydrated } from "@/hooks/useHydrated";
import { hideServerShell } from "@/lib/dom/server-shell";

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
  const locale = useCurrentLocale();
  const mounted = useHydrated();

  useEffect(() => {
    queryClient.setQueryData(["contact-settings", locale], initialContactSettings);
    return hideServerShell("contact-server-shell");
  }, [initialContactSettings, locale, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <ContactPage />
  );
}
