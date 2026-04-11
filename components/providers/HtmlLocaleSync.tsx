"use client";

import { useEffect } from "react";

import { toHtmlLang } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/locale-context";

export function HtmlLocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    if (!locale) {
      return;
    }

    const root = document.documentElement;
    root.lang = toHtmlLang(locale);
    root.setAttribute("data-locale", locale);
  }, [locale]);

  return null;
}
