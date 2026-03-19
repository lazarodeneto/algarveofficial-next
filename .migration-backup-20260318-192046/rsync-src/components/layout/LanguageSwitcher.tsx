import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "@/components/router/nextRouterCompat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { ensureLocaleLoaded } from "@/i18n";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧", prefix: "" },
  { code: "pt-pt", name: "Português", flag: "🇵🇹", prefix: "/pt-pt" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", prefix: "/de" },
  { code: "fr", name: "Français", flag: "🇫🇷", prefix: "/fr" },
  { code: "es", name: "Español", flag: "🇪🇸", prefix: "/es" },
  { code: "it", name: "Italiano", flag: "🇮🇹", prefix: "/it" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱", prefix: "/nl" },
  { code: "sv", name: "Svenska", flag: "🇸🇪", prefix: "/sv" },
  { code: "no", name: "Norsk", flag: "🇳🇴", prefix: "/no" },
  { code: "da", name: "Dansk", flag: "🇩🇰", prefix: "/da" },
];

const LANG_PREFIXES = ["/pt-pt", "/fr", "/de", "/es", "/it", "/nl", "/sv", "/no", "/da"];

/** Strip any language prefix from a pathname to get the bare path */
function stripLangPrefix(pathname: string): string {
  for (const prefix of LANG_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return pathname.slice(prefix.length) || "/";
    }
  }
  return pathname;
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    const lang = languages.find((l) => l.code === langCode);
    if (!lang) return;

    // Get the bare path (without language prefix)
    const barePath = stripLangPrefix(location.pathname);

    // Build the new path
    const newPath = lang.prefix
      ? `${lang.prefix}${barePath === "/" ? "" : barePath}`
      : barePath;

    void (async () => {
      await ensureLocaleLoaded(langCode, { force: true });
      if (typeof i18n.changeLanguage !== "function") return;
      await i18n.changeLanguage(langCode);
      localStorage.setItem("algarve-language", langCode);
      localStorage.setItem("algarve-language-chosen", "true");

      // Navigate to the new language-prefixed URL
      navigate(newPath || "/", { replace: true });
    })();
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2 text-sm">
            {currentLanguage.code === "pt-pt" ? "PT" : currentLanguage.code.toUpperCase()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="z-[1000] min-w-[140px] glass-box border border-white/20 p-2 space-y-1"
        >
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`cursor-pointer rounded-md px-3 py-2.5 text-sm transition-colors ${
                i18n.language === lang.code 
                  ? "bg-primary/20 text-primary font-medium" 
                  : "hover:bg-white/10"
              }`}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
