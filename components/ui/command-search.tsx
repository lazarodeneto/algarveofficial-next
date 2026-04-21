import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGlobalSearch, SearchResult } from "@/hooks/useGlobalSearch";
import { Building2, Grid3X3, MapPin, Search, Clock, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "./button";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useTranslation } from "react-i18next";

const getIcon = (type: SearchResult["type"]) => {
  switch (type) {
    case "listing":
      return <Sparkles className="h-4 w-4 text-primary" />;
    case "category":
      return <Grid3X3 className="h-4 w-4 text-blue-400" />;
    case "city":
      return <Building2 className="h-4 w-4 text-green-400" />;
    case "region":
      return <MapPin className="h-4 w-4 text-purple-400" />;
  }
};

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function CommandSearch({ open, onOpenChange, initialQuery }: CommandSearchProps) {
  const router = useRouter();
  const l = useLocalePath();
  const { t } = useTranslation();
  const { query, setQuery, results, recentSearches, addToRecent, clearRecent } = useGlobalSearch();

  const handleSelect = (result: SearchResult) => {
    addToRecent(result);
    setQuery("");
    onOpenChange(false);
    router.push(l(result.href));
  };

  // Pre-fill query when dialog opens with initialQuery
  useEffect(() => {
    if (open && initialQuery) {
      setQuery(initialQuery);
    }
    if (!open) {
      setQuery("");
    }
  }, [open, initialQuery, setQuery]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border-none shadow-2xl">
        <CommandInput
          placeholder={t("hero.aiPlannerPlaceholder")}
          value={query}
          onValueChange={setQuery}
          className="h-14 text-lg"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t("search.noResults")}</p>
            <p className="text-sm text-muted-foreground/70">{t("search.noResultsHint")}</p>
          </CommandEmpty>

          {/* Search Results */}
          {results.length > 0 && (
            <CommandGroup heading={t("search.results")}>
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.title} ${result.subtitle ?? ""}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">
                    {result.type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <>
              <CommandGroup heading={
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {t("search.recent")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecent();
                    }}
                    className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("search.clear")}
                  </Button>
                </div>
              }>
                {recentSearches.map((result) => (
                  <CommandItem
                    key={`recent-${result.type}-${result.id}`}
                    value={`recent ${result.title} ${result.subtitle ?? ""}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                  >
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Quick Links */}
          {query.length === 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t("search.quickLinks")}>
                <CommandItem
                  value="directory browse all listings"
                  onSelect={() => {
                    onOpenChange(false);
                    router.push(l("/stay"));
                  }}
                  className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                >
                  <Grid3X3 className="h-4 w-4 text-primary" />
                  <span>{t("search.browseAll")}</span>
                </CommandItem>
                <CommandItem
                  value="destinations regions explore"
                  onSelect={() => {
                    onOpenChange(false);
                    router.push(l("/destinations"));
                  }}
                  className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{t("search.exploreRegions")}</span>
                </CommandItem>
                <CommandItem
                  value="map explorer listings"
                  onSelect={() => {
                    onOpenChange(false);
                    router.push(l("/map"));
                  }}
                  className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{t("search.openMapExplorer")}</span>
                </CommandItem>
                <CommandItem
                  value="invest market strategy"
                  onSelect={() => {
                    onOpenChange(false);
                    router.push(l("/invest"));
                  }}
                  className="flex items-center gap-3 py-3 px-4 cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>{t("search.investmentInsights")}</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Footer with keyboard hints */}
        <div className="border-t border-border p-3 flex items-center justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 inline-flex">
                ↑↓
              </kbd>
              {t("search.navigate")}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 inline-flex">
                ↵
              </kbd>
              {t("search.select")}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 inline-flex">
                esc
              </kbd>
              {t("search.close")}
            </span>
          </div>
        </div>
      </Command>
    </CommandDialog>
  );
}

// Search trigger button for the header
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground"
      aria-label={t("common.search")}
    >
      <Search className="h-5 w-5" />
      <span className="sr-only">{t("common.search")}</span>
    </Button>
  );
}
