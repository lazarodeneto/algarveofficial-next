import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ensureLocaleLoaded } from "@/i18n";

const STORAGE_KEY = "algarve-language-chosen";
const LANG_PREFIXES = ["/pt-pt", "/fr", "/de", "/es", "/it", "/nl", "/sv", "/no", "/da"];

/** All supported languages with display names and URL prefixes */
const SUPPORTED_LANGS: Record<string, { code: string; name: string; path: string }> = {
  pt: { code: "pt-pt", name: "Português", path: "/pt-pt/" },
  de: { code: "de", name: "Deutsch", path: "/de/" },
  fr: { code: "fr", name: "Français", path: "/fr/" },
  es: { code: "es", name: "Español", path: "/es/" },
  it: { code: "it", name: "Italiano", path: "/it/" },
  nl: { code: "nl", name: "Nederlands", path: "/nl/" },
  sv: { code: "sv", name: "Svenska", path: "/sv/" },
  no: { code: "no", name: "Norsk", path: "/no/" },
  da: { code: "da", name: "Dansk", path: "/da/" },
  en: { code: "en", name: "English", path: "/" },
  nb: { code: "no", name: "Norsk", path: "/no/" },
  nn: { code: "no", name: "Norsk", path: "/no/" },
};

function stripLangPrefix(pathname: string): string {
  for (const prefix of LANG_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }
  return pathname || "/";
}

export function LanguageSuggestionBanner() {
  const { i18n, t } = useTranslation();
  const [suggestion, setSuggestion] = useState<{ code: string; name: string; path: string } | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") return;

    const browserLang = navigator.language?.toLowerCase() || "";
    const prefix = browserLang.split("-")[0];

    const match = SUPPORTED_LANGS[prefix];
    if (!match) return; // unsupported language — no suggestion

    // Normalise current language for comparison (pt-pt → pt-pt, en → en)
    const current = i18n.language?.toLowerCase();
    if (match.code === current) return; // already viewing the right language

    setSuggestion(match);
  }, [i18n.language]);

  if (!suggestion) return null;

  const accept = () => {
    void (async () => {
      await ensureLocaleLoaded(suggestion.code, { force: true });
      if (typeof i18n.changeLanguage !== "function") return;
      await i18n.changeLanguage(suggestion.code);
      localStorage.setItem("algarve-language", suggestion.code);
      localStorage.setItem(STORAGE_KEY, "true");
      setSuggestion(null);

      // Preserve current route when switching language instead of forcing homepage.
      const currentPath = window.location.pathname;
      const barePath = stripLangPrefix(currentPath);
      const targetPrefix = suggestion.path === "/" ? "" : suggestion.path.replace(/\/$/, "");
      const targetPath = targetPrefix
        ? `${targetPrefix}${barePath === "/" ? "" : barePath}`
        : barePath;
      const nextUrl = `${targetPath || "/"}${window.location.search}${window.location.hash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextUrl !== currentUrl) {
        window.location.assign(nextUrl);
      }
    })();
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setSuggestion(null);
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-lg w-full bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-lg px-5 py-3.5 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
        <p className="text-sm text-foreground flex-1">
          {t("languageSuggestion.viewIn", {
            language: suggestion.name,
            defaultValue: "View this page in {{language}}?",
          })}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="gold" onClick={accept}>
            {suggestion.name}
          </Button>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t("languageSuggestion.dismiss", "Stay in English")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
