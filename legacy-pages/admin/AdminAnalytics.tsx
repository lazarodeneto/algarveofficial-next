import { type ReactNode, useMemo, useState } from "react";
import { m } from "framer-motion";
import {
  BarChart3,
  CircleDollarSign,
  Filter,
  Layers3,
  MapPin,
  MousePointerClick,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { TimeRangeSelector, type TimeRange } from "@/components/admin/analytics/TimeRangeSelector";
import { AnalyticsOverviewSection } from "@/components/admin/analytics/AnalyticsOverviewSection";
import { ContentPerformanceSection } from "@/components/admin/analytics/ContentPerformanceSection";
import { PlacementPerformanceSection } from "@/components/admin/analytics/PlacementPerformanceSection";
import { MonetizationInsightsSection } from "@/components/admin/analytics/MonetizationInsightsSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";

function AnalyticsSectionPanel({
  children,
  description,
  icon,
  index,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: ReactNode;
  index: number;
  title: string;
}) {
  return (
    <m.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.08 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="glass-box rounded-[1.5rem] border-border/40 p-4 shadow-soft-surface sm:p-5 lg:p-6 [&>*]:relative [&>*]:z-10"
    >
      <div className="mb-4 flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {icon}
            Analytics
          </div>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </m.section>
  );
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedCityId, setSelectedCityId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<"all" | "signature" | "verified" | "unverified">("all");

  const { data: cities = [] } = useQuery({
    queryKey: ["admin-analytics-filter-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-analytics-filter-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const filters = useMemo(
    () => ({
      timeRange,
      cityId: selectedCityId === "all" ? undefined : selectedCityId,
      categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
      tier: selectedTier,
    }),
    [timeRange, selectedCityId, selectedCategoryId, selectedTier],
  );

  const { data, isLoading } = usePlatformAnalytics(filters);

  const fallbackData = {
    trafficOverview: {
      source: "none" as const,
      isGaConnected: false,
      gaError: null,
      totalUsers: 0,
      sessions: 0,
      pageViews: 0,
      avgSessionDurationSec: 0,
      topPages: [],
      topCities: [],
      topCategories: [],
    },
    contentPerformance: {
      topCities: [],
      topCategories: [],
      topListings: [],
    },
    placementPerformance: {
      blockPerformance: [],
      positionPerformance: [],
      selectionModePerformance: [],
    },
    monetizationInsights: {
      byTier: [],
    },
  };

  const dashboardData = data ?? fallbackData;
  const selectedCityLabel =
    selectedCityId === "all"
      ? "All cities"
      : (cities.find((city) => city.id === selectedCityId)?.name ?? "Filtered city");
  const selectedCategoryLabel =
    selectedCategoryId === "all"
      ? "All categories"
      : (categories.find((category) => category.id === selectedCategoryId)?.name ?? "Filtered category");
  const activeFilterCount = [
    selectedCityId !== "all",
    selectedCategoryId !== "all",
    selectedTier !== "all",
  ].filter(Boolean).length;

  return (
    <div className="relative isolate space-y-5 overflow-hidden">
      <m.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-box rounded-[1.75rem] border-border/40 p-4 shadow-soft-surface sm:p-5 lg:p-6 [&>*]:relative [&>*]:z-10"
      >
        <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Live command center
            </div>
            <h1 className="text-3xl font-serif font-semibold text-foreground lg:text-4xl">
              Platform Analytics
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Visibility, engagement, and monetization intelligence powered by visitor behavior,
              CMS block response, and tier-driven placement.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-sm border border-border/50 bg-background/30 px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Window</p>
                <p className="font-semibold text-foreground">{timeRange}</p>
              </div>
              <div className="rounded-sm border border-border/50 bg-background/30 px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Filters</p>
                <p className="font-semibold text-foreground">{activeFilterCount || "None active"}</p>
              </div>
              <div className="rounded-sm border border-border/50 bg-background/30 px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Source</p>
                <p className="font-semibold text-foreground">
                  {dashboardData.trafficOverview.isGaConnected ? "Google Analytics" : "In-app data"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row 2xl:flex-col 2xl:items-end">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/35 px-3 py-2 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Refetches as filters change
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-border/50 bg-background/30 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] backdrop-blur-xl">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filters
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Narrow the analytics without leaving the dashboard.
              </p>
            </div>
            <Badge variant="outline" className="w-fit gap-1 rounded-full border-primary/30 bg-primary/10 text-primary">
              <Filter className="h-3 w-3" />
              {activeFilterCount} active
            </Badge>
          </div>

          <div className="grid min-w-0 gap-3 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_1fr_auto] [&>*]:min-w-0">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">City</p>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger className="glass-button-subtle w-full min-w-0 border-border/60 bg-background/35">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Category</p>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="glass-button-subtle w-full min-w-0 border-border/60 bg-background/35">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tier</p>
                <Select
                  value={selectedTier}
                  onValueChange={(value) =>
                    setSelectedTier(
                      value === "signature" || value === "verified" || value === "unverified"
                        ? value
                        : "all",
                    )
                  }
                >
                  <SelectTrigger className="glass-button-subtle w-full min-w-0 border-border/60 bg-background/35">
                    <SelectValue placeholder="All tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tiers</SelectItem>
                    <SelectItem value="signature">Signature</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-end gap-2 lg:col-span-2 2xl:col-span-1 2xl:justify-end">
                <Badge variant="outline" className="glass-tag gap-1 rounded-full border-border/60 bg-background/35">
                  <Filter className="h-3 w-3" />
                  {timeRange}
                </Badge>
                <Badge variant="outline" className="glass-tag max-w-[11rem] gap-1 rounded-full border-border/60 bg-background/35">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{selectedCityLabel}</span>
                </Badge>
                <Badge variant="outline" className="glass-tag max-w-[11rem] gap-1 rounded-full border-border/60 bg-background/35">
                  <Tag className="h-3 w-3" />
                  <span className="truncate">
                    {selectedCategoryId === "all" ? selectedTier : selectedCategoryLabel}
                  </span>
                </Badge>
              </div>
          </div>
        </div>
      </m.section>

      <AnalyticsSectionPanel
        index={0}
        title="Traffic Overview"
        description="Audience reach, session depth, and route visibility for the selected period."
        icon={<BarChart3 className="h-3.5 w-3.5" />}
      >
        <AnalyticsOverviewSection loading={isLoading} data={dashboardData.trafficOverview} />
      </AnalyticsSectionPanel>

      <AnalyticsSectionPanel
        index={1}
        title="Content Performance"
        description="Compare cities, categories, and listings by views, clicks, CTR, and engagement."
        icon={<Layers3 className="h-3.5 w-3.5" />}
      >
        <ContentPerformanceSection
          loading={isLoading}
          topCities={dashboardData.contentPerformance.topCities}
          topCategories={dashboardData.contentPerformance.topCategories}
          topListings={dashboardData.contentPerformance.topListings}
        />
      </AnalyticsSectionPanel>

      <AnalyticsSectionPanel
        index={2}
        title="Placement Performance"
        description="Understand how CMS blocks, positions, and selection modes convert attention into clicks."
        icon={<MousePointerClick className="h-3.5 w-3.5" />}
      >
        <PlacementPerformanceSection
          loading={isLoading}
          blockPerformance={dashboardData.placementPerformance.blockPerformance}
          positionPerformance={dashboardData.placementPerformance.positionPerformance}
          selectionModePerformance={dashboardData.placementPerformance.selectionModePerformance}
        />
      </AnalyticsSectionPanel>

      <AnalyticsSectionPanel
        index={3}
        title="Monetization Insights"
        description="See visibility share, click share, and tier efficiency across commercial listing tiers."
        icon={<CircleDollarSign className="h-3.5 w-3.5" />}
      >
        <MonetizationInsightsSection
          loading={isLoading}
          byTier={dashboardData.monetizationInsights.byTier}
        />
      </AnalyticsSectionPanel>
    </div>
  );
}
