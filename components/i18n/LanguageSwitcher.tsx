"use client";

import { useId, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocaleRouter } from "@/hooks/useLocaleRouter";
import { LOCALE_CONFIGS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type LanguageSwitcherProps = {
  containerClassName?: string;
  selectClassName?: string;
  localeSwitchPaths?: Record<string, string>;
  localePathByLocale?: Partial<Record<Locale, string>>;
};

export function LanguageSwitcher({
  containerClassName,
  selectClassName,
  localeSwitchPaths,
  localePathByLocale,
}: LanguageSwitcherProps = {}) {
  const { t } = useTranslation();
  const currentLocale = useCurrentLocale();
  const { switchLocale } = useLocaleRouter();
  const [isPending, startTransition] = useTransition();
  const languageLabel = t("common.language", "Language");
  const switcherId = useId();
  const resolvedLocaleSwitchPaths = localeSwitchPaths ?? localePathByLocale;
  const switchPathsByLocale = resolvedLocaleSwitchPaths as
    | Record<string, string>
    | undefined;

  return (
    <div className={cn("flex items-center gap-2", containerClassName)}>
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
            switchLocale(nextLocale, switchPathsByLocale?.[nextLocale]);
          });
        }}
        className={cn("rounded-md border pl-3 pr-8 py-2", selectClassName)}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_CONFIGS[locale].name}
          </option>
        ))}
      </select>
    </div>
  );
}
