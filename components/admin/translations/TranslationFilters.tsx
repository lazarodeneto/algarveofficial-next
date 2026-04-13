"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
      params.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const activeCount = [
    filters.status,
    filters.city,
    filters.category,
    filters.tier,
    filters.target_lang,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
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
          {filters.status && (
            <FilterPill label={`Status: ${STATUS_LABELS[filters.status as TranslationStatus]}`} onRemove={() => updateFilter("status", undefined)} />
          )}
          {filters.tier && (
            <FilterPill label={`Tier: ${filters.tier}`} onRemove={() => updateFilter("tier", undefined)} />
          )}
          {filters.target_lang && (
            <FilterPill label={`Lang: ${filters.target_lang.toUpperCase()}`} onRemove={() => updateFilter("target_lang", undefined)} />
          )}
          {filters.city && (
            <FilterPill label={`City: ${filters.city}`} onRemove={() => updateFilter("city", undefined)} />
          )}
          {filters.category && (
            <FilterPill label={`Category: ${filters.category}`} onRemove={() => updateFilter("category", undefined)} />
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 pr-1 text-xs font-normal border border-border/60"
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
