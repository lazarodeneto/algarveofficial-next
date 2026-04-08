import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { Filter, LayoutDashboard, MapPin, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { TimeRangeSelector, type TimeRange } from "@/components/admin/analytics/TimeRangeSelector";
import { AnalyticsOverviewSection } from "@/components/admin/analytics/AnalyticsOverviewSection";
import { ContentPerformanceSection } from "@/components/admin/analytics/ContentPerformanceSection";
import { PlacementPerformanceSection } from "@/components/admin/analytics/PlacementPerformanceSection";
import { MonetizationInsightsSection } from "@/components/admin/analytics/MonetizationInsightsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
      source: "mock" as const,
      isGaConnected: false,
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

  return (
    <div className="space-y-5">
      <m.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-medium text-foreground lg:text-4xl">Platform Analytics</h1>
            <p className="mt-1 text-muted-foreground">
              Visibility, engagement, and monetization intelligence powered by CMS block behavior and tier-driven placement.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Business decision dashboard
            </div>
          </div>

          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        <Card className="mt-4 border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">City</p>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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

              <div className="flex items-end gap-2">
                <Badge variant="outline" className="gap-1">
                  <Filter className="h-3 w-3" />
                  {timeRange}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedCityId === "all" ? "All cities" : "Filtered city"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {selectedTier}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </m.section>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-xl font-serif">A. Traffic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsOverviewSection loading={isLoading} data={dashboardData.trafficOverview} />
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-xl font-serif">B. Content Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentPerformanceSection
            loading={isLoading}
            topCities={dashboardData.contentPerformance.topCities}
            topCategories={dashboardData.contentPerformance.topCategories}
            topListings={dashboardData.contentPerformance.topListings}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-xl font-serif">C. Placement Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <PlacementPerformanceSection
            loading={isLoading}
            blockPerformance={dashboardData.placementPerformance.blockPerformance}
            positionPerformance={dashboardData.placementPerformance.positionPerformance}
            selectionModePerformance={dashboardData.placementPerformance.selectionModePerformance}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-xl font-serif">D. Monetization Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <MonetizationInsightsSection
            loading={isLoading}
            byTier={dashboardData.monetizationInsights.byTier}
          />
        </CardContent>
      </Card>
    </div>
  );
}
