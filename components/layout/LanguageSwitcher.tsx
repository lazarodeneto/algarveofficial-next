import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { ensureLocaleLoaded } from "@/i18n";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧", prefix: "/en" },
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

const LANG_PREFIXES = ["/en", "/pt-pt", "/fr", "/de", "/es", "/it", "/nl", "/sv", "/no", "/da"];

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
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const nextSearchParams = useSearchParams();

  const currentLangFromUrl = (() => {
    for (const lang of languages) {
      if (pathname === lang.prefix || pathname.startsWith(lang.prefix + "/")) {
        return lang.code;
      }
    }
    return null;
  })();
  const currentLanguage = languages.find((l) => l.code === (currentLangFromUrl || i18n.language)) || languages[0];

  const changeLanguage = (langCode: string) => {
    const lang = languages.find((l) => l.code === langCode);
    if (!lang) return;

    const barePath = stripLangPrefix(pathname);
    const nextPath = barePath || "/";
    const searchValue = nextSearchParams?.toString() ?? "";
    const search = searchValue ? `?${searchValue}` : "";
    const hash = typeof window !== "undefined" ? window.location.hash || "" : "";

    void (async () => {
      await ensureLocaleLoaded(langCode);
      if (typeof i18n.changeLanguage !== "function") return;
      await i18n.changeLanguage(langCode);
      localStorage.setItem("algarve-language", langCode);
      localStorage.setItem("algarve-language-chosen", "true");

      const newPath = lang.prefix ? `${lang.prefix}${nextPath}` : nextPath;
      router.push(`${newPath}${search}${hash}`);
    })();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 rounded-full px-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-[#C7A35A]/10 hover:text-[#C7A35A] dark:text-white dark:hover:text-[#C7A35A] focus-visible:ring-2 focus-visible:ring-[#C7A35A]/50"
        >
          <span className="inline-flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#C7A35A]" />
            <span className="hidden sm:inline">{currentLanguage.code === "pt-pt" ? "PT" : currentLanguage.code.toUpperCase()}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "z-[1000] min-w-[180px] rounded-2xl border border-black/10 bg-white/98 p-1.5 shadow-xl backdrop-blur-2xl dark:border-white/12 dark:bg-[hsl(var(--background)/0.95)] transition-all duration-200"
        )}
      >
        {languages.map((lang) => {
          const isActive = (() => {
            for (const l of languages) {
              if ((pathname === l.prefix || pathname.startsWith(l.prefix + "/")) && l.code === lang.code) {
                return true;
              }
            }
            return false;
          })();
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                "group cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ease-out",
                isActive
                  ? "bg-gradient-to-r from-[#C7A35A]/15 to-[#C7A35A]/10 text-[#C7A35A] font-semibold"
                  : "hover:bg-[#C7A35A]/8 text-foreground/80 hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {isActive && (
                  <Check className="h-4 w-4 text-[#C7A35A] transition-transform duration-200 scale-100" />
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
