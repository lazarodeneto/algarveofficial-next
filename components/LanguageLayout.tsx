"use client";

import { useEffect } from "react";
import { Outlet, useLocation, useParams } from "@/components/router/nextRouterCompat";
import { useTranslation } from "react-i18next";
import { ensureLocaleLoaded } from "@/i18n";

const SUPPORTED_LANGS = ["pt-pt", "fr", "de", "es", "it", "nl", "sv", "no", "da"];

/**
 * Wrapper that reads the optional :lang URL param,
 * syncs i18n language, and renders child routes via <Outlet />.
 */
export function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

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
  }, [lang, i18n, location.pathname]);

  return <Outlet />;
}
