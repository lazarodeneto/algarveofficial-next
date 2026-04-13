"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FilterOptions, TranslationFilters, TranslationStatus } from "@/lib/admin/translations/types";
import { STATUS_LABELS } from "@/lib/admin/translations/types";

interface Props {
  filters: TranslationFilters;
  options: FilterOptions;
  totalJobs: number;
}

const ALL_STATUSES: TranslationStatus[] = [
  "missing",
  "queued",
  "auto",
  "reviewed",
  "edited",
  "failed",
];

export function TranslationFilters({ filters, options, totalJobs }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const toggleNeedsAttention = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.needs_attention) {
      params.delete("needs_attention");
    } else {
      params.set("needs_attention", "true");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams, filters.needs_attention]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const activeCount = [
    filters.status,
    filters.city,
    filters.category,
    filters.tier,
    filters.target_lang,
    filters.needs_attention || undefined,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Needs Attention toggle */}
        <button
          onClick={toggleNeedsAttention}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            filters.needs_attention
              ? "border-orange-500/40 bg-orange-500/15 text-orange-300"
              : "border-border/60 bg-card/80 text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Needs Attention
        </button>

        {/* Status */}
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="h-8 w-[130px] border-border/60 bg-card/80 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tier */}
        <Select
          value={filters.tier || "all"}
          onValueChange={(v) => updateFilter("tier", v)}
        >
          <SelectTrigger className="h-8 w-[120px] border-border/60 bg-card/80 text-sm">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="signature">Signature</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
          </SelectContent>
        </Select>

        {/* Language */}
        {options.languages.length > 0 && (
          <Select
            value={filters.target_lang || "all"}
            onValueChange={(v) => updateFilter("target_lang", v)}
          >
            <SelectTrigger className="h-8 w-[120px] border-border/60 bg-card/80 text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {options.languages.map((l) => (
                <SelectItem key={l} value={l}>
                  {l.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* City */}
        {options.cities.length > 0 && (
          <Select
            value={filters.city || "all"}
            onValueChange={(v) => updateFilter("city", v)}
          >
            <SelectTrigger className="h-8 w-[130px] border-border/60 bg-card/80 text-sm">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {options.cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Category */}
        {options.categories.length > 0 && (
          <Select
            value={filters.category || "all"}
            onValueChange={(v) => updateFilter("category", v)}
          >
            <SelectTrigger className="h-8 w-[140px] border-border/60 bg-card/80 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {options.categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear */}
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear ({activeCount})
          </Button>
        )}

        {/* Result count */}
        <span className="ml-auto text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totalJobs.toLocaleString()}</span> jobs
        </span>
      </div>

      {/* Active filter pills */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.needs_attention && (
            <FilterPill
              label="Needs Attention"
              onRemove={() => updateFilter("needs_attention", undefined)}
              highlight
            />
          )}
          {filters.status && (
            <FilterPill
              label={`Status: ${STATUS_LABELS[filters.status as TranslationStatus]}`}
              onRemove={() => updateFilter("status", undefined)}
            />
          )}
          {filters.tier && (
            <FilterPill
              label={`Tier: ${filters.tier}`}
              onRemove={() => updateFilter("tier", undefined)}
            />
          )}
          {filters.target_lang && (
            <FilterPill
              label={`Lang: ${filters.target_lang.toUpperCase()}`}
              onRemove={() => updateFilter("target_lang", undefined)}
            />
          )}
          {filters.city && (
            <FilterPill
              label={`City: ${filters.city}`}
              onRemove={() => updateFilter("city", undefined)}
            />
          )}
          {filters.category && (
            <FilterPill
              label={`Category: ${filters.category}`}
              onRemove={() => updateFilter("category", undefined)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  onRemove,
  highlight = false,
}: {
  label: string;
  onRemove: () => void;
  highlight?: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 pr-1 text-xs font-normal border",
        highlight
          ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
          : "border-border/60",
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
