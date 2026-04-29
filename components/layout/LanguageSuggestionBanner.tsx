"use client";

import { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { useLocaleRouter } from "@/hooks/useLocaleRouter";

const STORAGE_KEY = "algarve-language-chosen";

/** All supported languages with display names and URL prefixes */
const SUPPORTED_LANGS: Record<string, { code: string; name: string }> = {
  pt: { code: "pt-pt", name: "Português" },
  de: { code: "de", name: "Deutsch" },
  fr: { code: "fr", name: "Français" },
  es: { code: "es", name: "Español" },
  it: { code: "it", name: "Italiano" },
  nl: { code: "nl", name: "Nederlands" },
  sv: { code: "sv", name: "Svenska" },
  no: { code: "no", name: "Norsk" },
  da: { code: "da", name: "Dansk" },
  en: { code: "en", name: "English" },
  nb: { code: "no", name: "Norsk" },
  nn: { code: "no", name: "Norsk" },
};

export function LanguageSuggestionBanner() {
  const { t } = useTranslation();
  const currentLocale = useCurrentLocale();
  const { switchLocale } = useLocaleRouter();
  const [dismissed, setDismissed] = useState(false);
  const [browserLang, setBrowserLang] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setDismissed(true);
    }
    setBrowserLang(navigator.language?.toLowerCase() ?? "");
  }, []);

  const suggestion = useMemo(() => {
    if (dismissed) return null;
    if (!browserLang) return null;

    const prefix = browserLang.split("-")[0];
    const match = SUPPORTED_LANGS[prefix];
    if (!match) return null;

    if (match.code === currentLocale) return null;

    return match;
  }, [currentLocale, dismissed, browserLang]);

  if (!suggestion) return null;

  const accept = () => {
    localStorage.setItem("algarve-language", suggestion.code);
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
    switchLocale(suggestion.code);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-lg w-full bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-lg px-5 py-3.5 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
        <p className="text-sm text-foreground flex-1">
          {t("languageSuggestion.viewIn", { language: suggestion.name })}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="gold" onClick={accept}>
            {suggestion.name}
          </Button>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t("languageSuggestion.dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
