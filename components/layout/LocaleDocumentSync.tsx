"use client";

import { useEffect } from "react";

interface LocaleDocumentSyncProps {
  lang: string;
  locale: string;
}

export function LocaleDocumentSync({ lang, locale }: LocaleDocumentSyncProps) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.locale = locale;
  }, [lang, locale]);

  return null;
}
