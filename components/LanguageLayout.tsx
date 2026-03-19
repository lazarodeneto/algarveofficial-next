"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ensureLocaleLoaded } from "@/i18n";

const SUPPORTED_LANGS = ["pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"];

/**
 * Wrapper that reads the optional :lang URL param,
 * syncs i18n language, and renders optional children.
 */
export function LanguageLayout({ children }: { children?: ReactNode }) {
  const params = useParams<Record<string, string | string[] | undefined>>();
  const lang = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;
  const { i18n } = useTranslation();
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const targetLang = lang && SUPPORTED_LANGS.includes(lang) ? lang : "en";
    if (i18n.language === targetLang) return;

    let cancelled = false;

    void (async () => {
      await ensureLocaleLoaded(targetLang);
      if (cancelled) return;

      if (typeof i18n.changeLanguage !== "function") return;

      await i18n.changeLanguage(targetLang);
      localStorage.setItem("algarve-language", targetLang);
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, i18n, pathname]);

  return <>{children ?? null}</>;
}
