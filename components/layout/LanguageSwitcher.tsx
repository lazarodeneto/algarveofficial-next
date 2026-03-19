import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { ensureLocaleLoaded } from "@/i18n";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const nextSearchParams = useSearchParams();

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    const lang = languages.find((l) => l.code === langCode);
    if (!lang) return;

    const barePath = stripLangPrefix(pathname);
    const currentHasLegacyPrefix = barePath !== pathname;
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

      // Keep users on the working App Router route while locale-prefixed
      // routes are still being migrated. If they are already on a legacy
      // prefixed URL, strip it back to the equivalent bare path.
      if (currentHasLegacyPrefix) {
        router.replace(`${nextPath}${search}${hash}`);
      }
    })();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 rounded-full px-2.5 text-sm font-semibold text-foreground hover:bg-transparent hover:text-primary dark:text-white dark:hover:text-primary"
        >
          <span className="inline-flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>{currentLanguage.code === "pt-pt" ? "PT" : currentLanguage.code.toUpperCase()}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "z-[1000] min-w-[160px] rounded-2xl border border-black/10 bg-white/95 p-2 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:border-white/12 dark:bg-[hsl(var(--background)/0.9)]",
        )}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-colors ${
              i18n.language === lang.code
                ? "bg-primary/15 text-primary font-semibold"
                : "hover:bg-black/5 dark:hover:bg-white/8"
            }`}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
