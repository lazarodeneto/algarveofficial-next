"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AlertCircle, RefreshCcw, ShieldAlert, Star, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  "missing", "queued", "auto", "reviewed", "edited", "failed",
];

export function TranslationFilters({ filters, options, totalJobs }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const toggleFlag = useCallback(
    (key: string, currentValue: boolean | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (currentValue) params.delete(key);
      else params.set(key, "true");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const toggleSignatureOnly = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.tier === "signature") params.delete("tier");
    else params.set("tier", "signature");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams, filters.tier]);

  const clearAll = useCallback(() => router.push(pathname), [router, pathname]);

  const activeCount = [
    filters.status,
    filters.city,
    filters.category,
    filters.tier,
    filters.target_lang,
    filters.needs_attention ? true : undefined,
    filters.sla_breach ? true : undefined,
    filters.outdated ? true : undefined,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">

      {/* ── Quick presets ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Quick
        </span>

        <PresetButton
          label="Needs Attention"
          icon={<AlertCircle className="h-3 w-3" />}
          active={!!filters.needs_attention}
          onClick={() => toggleFlag("needs_attention", filters.needs_attention)}
          color="orange"
        />

        <PresetButton
          label="SLA Risk"
          icon={<ShieldAlert className="h-3 w-3" />}
          active={!!filters.sla_breach}
          onClick={() => toggleFlag("sla_breach", filters.sla_breach)}
          color="red"
        />

        <PresetButton
          label="Signature Only"
          icon={<Star className="h-3 w-3" />}
          active={filters.tier === "signature"}
          onClick={toggleSignatureOnly}
          color="amber"
        />

        <PresetButton
          label="Outdated"
          icon={<RefreshCcw className="h-3 w-3" />}
          active={!!filters.outdated}
          onClick={() => toggleFlag("outdated", filters.outdated)}
          color="violet"
        />
      </div>

      {/* ── Dropdowns row ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Status */}
        <Select
          value={filters.status === "" ? "all" : filters.status}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="h-8 w-[130px] border-border/60 bg-card/80 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tier */}
        <Select
          value={filters.tier === "" ? "all" : filters.tier}
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
            value={filters.target_lang === "" ? "all" : filters.target_lang}
            onValueChange={(v) => updateFilter("target_lang", v)}
          >
            <SelectTrigger className="h-8 w-[120px] border-border/60 bg-card/80 text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {options.languages.map((l) => (
                <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* City */}
        {options.cities.length > 0 && (
          <Select
            value={filters.city === "" ? "all" : filters.city}
            onValueChange={(v) => updateFilter("city", v)}
          >
            <SelectTrigger className="h-8 w-[130px] border-border/60 bg-card/80 text-sm">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {options.cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Category */}
        {options.categories.length > 0 && (
          <Select
            value={filters.category === "" ? "all" : filters.category}
            onValueChange={(v) => updateFilter("category", v)}
          >
            <SelectTrigger className="h-8 w-[140px] border-border/60 bg-card/80 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {options.categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear all */}
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

        {/* Job count */}
        <span className="ml-auto text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totalJobs.toLocaleString()}</span> jobs
        </span>
      </div>

      {/* ── Active filter pills ──────────────────────────────────────────────── */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.needs_attention && (
            <FilterPill
              label="Needs Attention"
              onRemove={() => updateFilter("needs_attention", undefined)}
              color="orange"
            />
          )}
          {filters.sla_breach && (
            <FilterPill
              label="SLA Risk"
              onRemove={() => updateFilter("sla_breach", undefined)}
              color="red"
            />
          )}
          {filters.outdated && (
            <FilterPill
              label="Outdated"
              onRemove={() => updateFilter("outdated", undefined)}
              color="violet"
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
              label={`Tier: ${filters.tier.charAt(0).toUpperCase() + filters.tier.slice(1)}`}
              onRemove={() => updateFilter("tier", undefined)}
              color={filters.tier === "signature" ? "amber" : undefined}
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

// ─── Preset Button ────────────────────────────────────────────────────────────

const PRESET_ACTIVE: Record<string, string> = {
  orange: "border-orange-500/40 bg-orange-500/15 text-orange-300",
  red:    "border-red-500/40 bg-red-500/15 text-red-300",
  amber:  "border-amber-500/40 bg-amber-500/15 text-amber-300",
  violet: "border-violet-500/40 bg-violet-500/15 text-violet-300",
};

const PRESET_IDLE = "border-border/60 bg-card/80 text-muted-foreground hover:border-border hover:text-foreground";

function PresetButton({
  label,
  icon,
  active,
  onClick,
  color = "orange",
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        active ? PRESET_ACTIVE[color] : PRESET_IDLE,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────

const PILL_COLORS: Record<string, string> = {
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  red:    "border-red-500/30 bg-red-500/10 text-red-300",
  amber:  "border-amber-500/30 bg-amber-500/10 text-amber-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
};

function FilterPill({
  label,
  onRemove,
  color,
}: {
  label: string;
  onRemove: () => void;
  color?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border pr-1 text-xs font-normal",
        color ? PILL_COLORS[color] : "border-border/60",
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
