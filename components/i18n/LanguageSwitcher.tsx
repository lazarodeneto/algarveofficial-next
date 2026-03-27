"use client";

import { useId, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocaleRouter } from "@/hooks/useLocaleRouter";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

const LABELS: Record<string, string> = {
  en: "English",
  "pt-pt": "Português",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const currentLocale = useCurrentLocale();
  const { switchLocale } = useLocaleRouter();
  const [isPending, startTransition] = useTransition();
  const languageLabel = t("common.language", "Language");
  const switcherId = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={switcherId} className="sr-only">
        {languageLabel}
      </label>

      <select
        id={switcherId}
        value={currentLocale}
        disabled={isPending}
        onChange={(e) => {
          const nextLocale = e.target.value;
          if (nextLocale === currentLocale) return;

          startTransition(() => {
            switchLocale(nextLocale);
          });
        }}
        className="rounded-md border px-3 py-2"
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LABELS[locale] || locale}
          </option>
        ))}
      </select>
    </div>
  );
}
