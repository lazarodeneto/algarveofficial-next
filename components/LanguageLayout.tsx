"use client";

import type { ReactNode } from "react";
import { I18nLocaleSync } from "@/components/i18n/I18nLocaleSync";

/**
 * Legacy wrapper kept for backward compatibility.
 * Locale is now driven by the URL and synchronized by I18nLocaleSync.
 */
export function LanguageLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <I18nLocaleSync />
      {children ?? null}
    </>
  );
}
