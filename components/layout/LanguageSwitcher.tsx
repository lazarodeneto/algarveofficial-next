import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check, ChevronDown } from "lucide-react";
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
          className="group h-9 px-3 rounded-full text-[13px] font-medium text-foreground/80 hover:text-foreground transition-all duration-200 ease-out gap-1.5 dark:text-white/80 dark:hover:text-white"
        >
          <Globe className="h-[15px] w-[15px] text-[#C7A35A] group-hover:scale-110 transition-transform duration-200" />
          <span className="hidden sm:inline tracking-wide uppercase">
            {currentLanguage.code === "pt-pt" ? "PT" : currentLanguage.code.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-80 transition-all duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[1000] min-w-[200px] rounded-2xl border border-black/5 bg-white/80 backdrop-blur-2xl p-1.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[hsl(var(--background)/0.9)]"
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
                "group/item relative flex items-center rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 ease-out focus:outline-none",
                isActive
                  ? "bg-gradient-to-r from-[#C7A35A]/15 via-[#C7A35A]/10 to-transparent border border-[#C7A35A]/30"
                  : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              )}
            >
              <span className="flex items-center gap-4 w-full">
                <span 
                  className={cn(
                    "text-[15px] tracking-wide transition-colors duration-200",
                    isActive ? "text-[#C7A35A] font-medium" : "text-foreground/70 group-hover/item:text-foreground"
                  )}
                >
                  {lang.name}
                </span>
                {isActive && (
                  <Check className="h-4 w-4 text-[#C7A35A] ml-auto" />
                )}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
