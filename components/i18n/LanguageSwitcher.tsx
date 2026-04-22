"use client";

import { useId, useTransition } from "react";
import { ChevronDown } from "lucide-react";
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
  const languageLabel = t("common.language");
  const switcherId = useId();
  const resolvedLocaleSwitchPaths = localeSwitchPaths ?? localePathByLocale;
  const switchPathsByLocale = resolvedLocaleSwitchPaths as
    | Record<string, string>
    | undefined;

  return (
    <div className={cn("relative flex items-center", containerClassName)}>
      <label htmlFor={switcherId} className="sr-only">
        {languageLabel}
      </label>

      <select
        id={switcherId}
        data-testid="language-switcher"
        data-test="lang-switcher"
        value={currentLocale}
        disabled={isPending}
        onChange={(e) => {
          const nextLocale = e.target.value;
          if (nextLocale === currentLocale) return;

          startTransition(() => {
            switchLocale(nextLocale, switchPathsByLocale?.[nextLocale]);
          });
        }}
        className={cn(
          "w-full appearance-none rounded-md border py-2 pl-3 pr-10",
          selectClassName,
        )}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LOCALE_CONFIGS[locale].name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 h-4 w-4 text-current/70"
      />
    </div>
  );
}
