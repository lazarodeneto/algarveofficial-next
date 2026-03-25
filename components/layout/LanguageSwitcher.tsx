"use client";

import { useEffect, useMemo, useState } from "react";
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
import { swapLocaleInPath } from "@/lib/i18n/navigation";
import { SUPPORTED_LOCALES, LOCALE_CONFIGS, type Locale } from "@/lib/i18n/config";

const languages = SUPPORTED_LOCALES.map((code) => ({
  code,
  name: LOCALE_CONFIGS[code].name,
  shortName: LOCALE_CONFIGS[code].shortName,
}));

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  // ✅ SOURCE OF TRUTH = URL
  // Derive locale from pathname ONLY, not from context or cookie
  const currentLocale = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase();
    return SUPPORTED_LOCALES.includes(firstSegment as Locale)
      ? (firstSegment as Locale)
      : ("en" as Locale);
  }, [pathname]);

  // ✅ Sync i18n library to match URL locale
  useEffect(() => {
    if (i18n.language !== currentLocale) {
      void ensureLocaleLoaded(currentLocale).then(() => {
        void i18n.changeLanguage(currentLocale);
      });
    }
  }, [currentLocale, i18n]);

  const currentLanguage =
    languages.find((l) => l.code === currentLocale) || languages[0];

  const changeLanguage = async (newLocale: Locale) => {
    if (newLocale === currentLocale || isPending) return;

    setIsPending(true);

    try {
      // 1. Preload translations for the next locale so the destination route can render immediately.
      await ensureLocaleLoaded(newLocale);

      // 2. Persist preference to cookie (optional, for future visits)
      if (typeof document !== "undefined") {
        document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      }

      // 3. Build new URL: swap locale, preserve path + search + hash
      const newPath = swapLocaleInPath(pathname, newLocale);
      const search = searchParams?.toString() ?? "";
      const hash =
        typeof window !== "undefined" ? window.location.hash || "" : "";
      const fullUrl = `${newPath}${search ? `?${search}` : ""}${hash}`;

      // 4. Navigate. The URL remains the single source of truth; i18n will sync from pathname on the destination route.
      router.push(fullUrl, { scroll: false });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu key={pathname}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          data-test="lang-switcher"
          className="group h-9 px-3 rounded-full text-[13px] font-medium text-foreground/80 hover:text-foreground transition-all duration-200 ease-out gap-1.5 dark:text-white/80 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Globe className="h-[15px] w-[15px] text-[#C7A35A] group-hover:scale-110 transition-transform duration-200" />
          <span className="hidden sm:inline tracking-wide uppercase">
            {currentLanguage.shortName}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-80 transition-all duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[1000] min-w-[200px] rounded-2xl border border-black/5 bg-white/80 backdrop-blur-2xl p-1.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[hsl(var(--background)/0.9)]"
      >
        {languages.map((lang) => {
          const isActive = lang.code === currentLocale;
          return (
            <DropdownMenuItem
              key={lang.code}
              disabled={isPending}
              onClick={() => void changeLanguage(lang.code)}
              className={cn(
                "group/item relative flex items-center rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                isActive
                  ? "bg-gradient-to-r from-[#C7A35A]/15 via-[#C7A35A]/10 to-transparent border border-[#C7A35A]/30"
                  : "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
              )}
            >
              <span className="flex items-center gap-4 w-full">
                <span
                  className={cn(
                    "text-[15px] tracking-wide transition-colors duration-200",
                    isActive
                      ? "text-[#C7A35A] font-medium"
                      : "text-foreground/70 group-hover/item:text-foreground"
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
