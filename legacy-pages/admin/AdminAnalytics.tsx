import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  List,
  Users,
  DollarSign,
  MapPin,
  Crown,
  TrendingUp,
  Heart,
  MessageSquare,
  CheckCircle2,
  Clock,
  BarChart3,
  Eye,
  Shield,
  UserCheck,
  Building,
  Percent,
  Activity,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { TimeRangeSelector } from "@/components/admin/analytics/TimeRangeSelector";
import { AnalyticsCard } from "@/components/admin/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/admin/analytics/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { TimeRange } from "@/components/admin/analytics/TimeRangeSelector";
import {
  useOverviewKPIs,
  useTierDistribution,
  useStatusDistribution,
  useTopListings,
  useListingsAnalytics,
  useUsersAnalytics,
  useMonetizationAnalytics,
  useGeographyAnalytics,
  useCuratedAnalytics,
  useConversionsAnalytics,
} from "@/hooks/useAdminAnalytics";
import { format } from "date-fns";
import { useSiteColors } from "@/hooks/useSiteSettings";

const DEFAULT_GA_LIVE_URL =
  "https://analytics.google.com/analytics/web/#/a369334075p506131770/reports/intelligenthome?params=_u..nav%3Dmaui";

const CATEGORY_RENAMES: Record<string, string> = {
  "Luxury Accommodation": "Accommodation",
  "Fine Dining & Michelin": "Gastronomy",
  "Luxury Experience": "Algarve Experience",
  "Luxury Experiences": "Algarve Experience",
};

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const normalizeCategoryLabel = (name: string) => CATEGORY_RENAMES[name] || name;

const normalizeNamedSeries = <T extends { name: string }>(series: T[]) =>
  series.map((item) => ({
    ...item,
    name: normalizeCategoryLabel(item.name),
  }));

const toPercent = (value: number, total: number) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [showEmbeddedGa, setShowEmbeddedGa] = useState(false);
  const settings = useSiteColors();

  const gaDashboardUrl = settings?.ga_dashboard_url?.trim() || DEFAULT_GA_LIVE_URL;
  const hasCustomGaUrl = Boolean(settings?.ga_dashboard_url?.trim());

  // Fetch real data from Supabase
  const { data: kpis, isLoading: kpisLoading } = useOverviewKPIs();
  const { data: tierData, isLoading: tierLoading } = useTierDistribution();
  const { data: statusData, isLoading: statusLoading } = useStatusDistribution();
  const { data: topListings, isLoading: topListingsLoading } = useTopListings(5);
  const { data: listingsAnalytics, isLoading: listingsLoading } = useListingsAnalytics();
  const { data: usersAnalytics, isLoading: usersLoading } = useUsersAnalytics();
  const { data: monetizationAnalytics, isLoading: monetizationLoading } = useMonetizationAnalytics();
  const { data: geographyAnalytics, isLoading: geographyLoading } = useGeographyAnalytics();
  const { data: curatedAnalytics, isLoading: curatedLoading } = useCuratedAnalytics();
  const { data: conversionsAnalytics, isLoading: conversionsLoading } = useConversionsAnalytics();

  const overviewKPIs = kpis || {
    totalListings: 0,
    publishedListings: 0,
    pendingReview: 0,
    totalUsers: 0,
    vipMembers: 0,
    activeOwners: 0,
    totalFavorites: 0,
    totalMessages: 0,
    curatedListings: 0,
  };

  const conversionMetrics = conversionsAnalytics?.conversionMetrics || {
    totalInquiries: 0,
    totalFavorites: 0,
    totalViews: 0,
    favoriteRate: 0,
  };

  const tierChartData = tierData || [
    { name: "Signature", value: 0 },
    { name: "Verified", value: 0 },
    { name: "Unverified", value: 0 },
  ];

  const statusChartData = statusData || [
    { name: "Published", value: 0 },
    { name: "Pending Review", value: 0 },
    { name: "Draft", value: 0 },
    { name: "Rejected", value: 0 },
  ];

  const listingsByCategory = useMemo(
    () => normalizeNamedSeries(listingsAnalytics?.byCategory || []),
    [listingsAnalytics?.byCategory],
  );

  const curatedByCategory = useMemo(
    () => normalizeNamedSeries(curatedAnalytics?.curatedByCategory || []),
    [curatedAnalytics?.curatedByCategory],
  );

  const publicationRate = toPercent(overviewKPIs.publishedListings, overviewKPIs.totalListings);
  const pendingRate = toPercent(overviewKPIs.pendingReview, overviewKPIs.totalListings);
  const curatedShare = toPercent(overviewKPIs.curatedListings, overviewKPIs.totalListings);

  const tabMetrics = [
    { value: "overview", label: "Overview", icon: LayoutDashboard, count: overviewKPIs.totalListings },
    { value: "listings", label: "Listings", icon: List, count: listingsAnalytics?.recentListings?.length || 0 },
    { value: "users", label: "Users", icon: Users, count: overviewKPIs.totalUsers },
    {
      value: "monetization",
      label: "Monetization",
      icon: DollarSign,
      count: monetizationAnalytics?.totalActiveSubscriptions || 0,
    },
    { value: "geography", label: "Geography", icon: MapPin, count: geographyAnalytics?.topCities?.length || 0 },
    { value: "curated", label: "Selected", icon: Crown, count: overviewKPIs.curatedListings },
    { value: "conversions", label: "Conversions", icon: TrendingUp, count: conversionMetrics.totalInquiries },
  ] as const;

  const openGaDashboard = () => {
    window.open(gaDashboardUrl, "_blank", "noopener,noreferrer");
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "signature":
        return "bg-primary/20 text-primary border-primary/30";
      case "verified":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "pending_review":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "draft":
        return "bg-muted text-muted-foreground border-border";
      case "rejected":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-medium text-foreground">Analytics</h1>
            <p className="mt-1 text-muted-foreground">
              Compact command center for platform performance, with instant access to live GA telemetry.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live analytics link {hasCustomGaUrl ? "configured" : "using default URL"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={openGaDashboard} className="gap-2">
              <Activity className="h-4 w-4" />
              Open Live Analytics
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Live Snapshot
              </CardTitle>
              <CardDescription>
                Real-time operational pulse from platform data with direct Google Analytics access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="mt-1 text-xl font-semibold">{compactNumber.format(conversionMetrics.totalViews)}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Favorites</p>
                  <p className="mt-1 text-xl font-semibold">{compactNumber.format(conversionMetrics.totalFavorites)}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Inquiries</p>
                  <p className="mt-1 text-xl font-semibold">{compactNumber.format(conversionMetrics.totalInquiries)}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <p className="text-xs text-muted-foreground">Active Subs</p>
                  <p className="mt-1 text-xl font-semibold">
                    {compactNumber.format(monetizationAnalytics?.totalActiveSubscriptions || 0)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowEmbeddedGa((v) => !v)}>
                  <BarChart3 className="h-4 w-4" />
                  {showEmbeddedGa ? "Hide Embedded Preview" : "Preview Embedded GA"}
                </Button>
                <span className="text-xs text-muted-foreground">{gaDashboardUrl}</span>
              </div>

              {showEmbeddedGa && (
                <div className="rounded-xl border border-border/70 overflow-hidden">
                  <iframe
                    title="Google Analytics Live"
                    src={gaDashboardUrl}
                    className="h-[360px] w-full bg-background"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border/70">
                    If Google blocks embedding in-browser, use "Open Live Analytics" above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Operational Health</CardTitle>
              <CardDescription>Fast-read conversion and publishing quality indicators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Publication Rate</span>
                  <span className="font-medium text-foreground">{publicationRate}%</span>
                </div>
                <Progress value={publicationRate} className="h-2" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pending Review Share</span>
                  <span className="font-medium text-foreground">{pendingRate}%</span>
                </div>
                <Progress value={pendingRate} className="h-2" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Favorite Rate</span>
                  <span className="font-medium text-foreground">{conversionMetrics.favoriteRate}%</span>
                </div>
                <Progress value={Math.min(Number(conversionMetrics.favoriteRate || 0), 100)} className="h-2" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Curated Share</span>
                  <span className="font-medium text-foreground">{curatedShare}%</span>
                </div>
                <Progress value={curatedShare} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-border/70 bg-card/70 p-1">
          {tabMetrics.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[10px]">
                  {compactNumber.format(tab.count)}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <AnalyticsCard
              title="Total Listings"
              value={overviewKPIs.totalListings}
              icon={<List className="h-4 w-4" />}
              loading={kpisLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Published"
              value={overviewKPIs.publishedListings}
              icon={<CheckCircle2 className="h-4 w-4" />}
              loading={kpisLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Pending"
              value={overviewKPIs.pendingReview}
              icon={<Clock className="h-4 w-4" />}
              loading={kpisLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Total Users"
              value={overviewKPIs.totalUsers}
              icon={<Users className="h-4 w-4" />}
              loading={kpisLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="VIP Members"
              value={overviewKPIs.vipMembers}
              icon={<Crown className="h-4 w-4" />}
              loading={kpisLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AnalyticsCard
              title="Active Owners"
              value={overviewKPIs.activeOwners}
              description="Managing listings"
              size="sm"
              loading={kpisLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Favorites"
              value={overviewKPIs.totalFavorites}
              icon={<Heart className="h-4 w-4" />}
              size="sm"
              loading={kpisLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Messages"
              value={overviewKPIs.totalMessages}
              icon={<MessageSquare className="h-4 w-4" />}
              size="sm"
              loading={kpisLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Signature Selection"
              value={overviewKPIs.curatedListings}
              icon={<Crown className="h-4 w-4" />}
              size="sm"
              loading={kpisLoading}
              className="rounded-xl border-border/70"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Tier Distribution"
              data={tierChartData}
              type="pie"
              dataKey="value"
              xAxisKey="name"
              height={260}
              loading={tierLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsChart
              title="Status Distribution"
              data={statusChartData}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={260}
              loading={statusLoading}
              className="rounded-xl border-border/70"
            />
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Top Performing Listings</CardTitle>
              <CardDescription>Highest engagement based on views and favorites.</CardDescription>
            </CardHeader>
            <CardContent>
              {topListingsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : topListings && topListings.length > 0 ? (
                <div className="space-y-2">
                  {topListings.map((listing, index) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-xs text-muted-foreground">#{index + 1}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-sm">{listing.name}</p>
                          <Badge variant="outline" className={`text-[10px] capitalize ${getTierBadgeColor(listing.tier)}`}>
                            {listing.tier}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{compactNumber.format(listing.viewCount)}</span>
                        <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{compactNumber.format(listing.favoriteCount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <BarChart3 className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  No listing data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Listings by Category"
              data={listingsByCategory}
              type="pie"
              dataKey="value"
              xAxisKey="name"
              height={380}
              loading={listingsLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsChart
              title="Listings by City"
              data={listingsAnalytics?.byCity || []}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={listingsLoading}
              className="rounded-xl border-border/70"
            />
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Recent Listings</CardTitle>
              <CardDescription>Newest additions to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {listingsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : listingsAnalytics?.recentListings && listingsAnalytics.recentListings.length > 0 ? (
                <div className="space-y-2">
                  {listingsAnalytics.recentListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{listing.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(listing.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] capitalize ${getStatusBadgeColor(listing.status)}`}>
                          {listing.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] capitalize ${getTierBadgeColor(listing.tier)}`}>
                          {listing.tier}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <List className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  No listings yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AnalyticsCard
              title="Admins"
              value={usersAnalytics?.totalAdmins || 0}
              icon={<Shield className="h-4 w-4" />}
              loading={usersLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Editors"
              value={usersAnalytics?.totalEditors || 0}
              icon={<UserCheck className="h-4 w-4" />}
              loading={usersLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Owners"
              value={usersAnalytics?.totalOwners || 0}
              icon={<Building className="h-4 w-4" />}
              loading={usersLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="VIP Viewers"
              value={usersAnalytics?.totalViewers || 0}
              icon={<Crown className="h-4 w-4" />}
              loading={usersLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Users by Role"
              data={usersAnalytics?.byRole || []}
              type="pie"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={usersLoading}
              className="rounded-xl border-border/70"
            />

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Recent Users</CardTitle>
                <CardDescription>Newest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                ) : usersAnalytics?.recentUsers && usersAnalytics.recentUsers.length > 0 ? (
                  <div className="space-y-2">
                    {usersAnalytics.recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                      >
                        <div>
                          <p className="font-medium text-sm">{user.displayName || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 h-10 w-10 opacity-30" />
                    No users yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AnalyticsCard
              title="Active Subscriptions"
              value={monetizationAnalytics?.totalActiveSubscriptions || 0}
              icon={<DollarSign className="h-4 w-4" />}
              loading={monetizationLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Subscription Momentum"
              value={compactNumber.format(monetizationAnalytics?.monthlyRecurring || 0)}
              description="Active paid members"
              icon={<TrendingUp className="h-4 w-4" />}
              loading={monetizationLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Subscriptions by Tier"
              data={monetizationAnalytics?.subscriptionsByTier || []}
              type="pie"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={monetizationLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsChart
              title="Subscriptions by Status"
              data={monetizationAnalytics?.subscriptionsByStatus || []}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={monetizationLoading}
              className="rounded-xl border-border/70"
            />
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Listings by Region"
              data={geographyAnalytics?.listingsByRegion || []}
              type="pie"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={geographyLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsChart
              title="Listings by City"
              data={geographyAnalytics?.listingsByCity || []}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={geographyLoading}
              className="rounded-xl border-border/70"
            />
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Top Cities</CardTitle>
              <CardDescription>Cities with the highest listing and view concentration.</CardDescription>
            </CardHeader>
            <CardContent>
              {geographyLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : geographyAnalytics?.topCities && geographyAnalytics.topCities.length > 0 ? (
                <div className="space-y-2">
                  {geographyAnalytics.topCities.slice(0, 5).map((city, index) => (
                    <div
                      key={city.name}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                        <p className="font-medium text-sm">{city.name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><List className="h-3.5 w-3.5" />{city.listingCount}</span>
                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{compactNumber.format(city.viewCount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <MapPin className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  No city data yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curated" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AnalyticsCard
              title="Total Selected"
              value={curatedAnalytics?.totalCurated || 0}
              icon={<Crown className="h-4 w-4" />}
              loading={curatedLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Categories Covered"
              value={curatedByCategory.length || 0}
              icon={<List className="h-4 w-4" />}
              loading={curatedLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Selected by Category"
              data={curatedByCategory}
              type="pie"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={curatedLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsChart
              title="Selected by Region"
              data={curatedAnalytics?.curatedByRegion || []}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={curatedLoading}
              className="rounded-xl border-border/70"
            />
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Signature Selection Listings</CardTitle>
              <CardDescription>Premium listings currently featured in the VIP showcase.</CardDescription>
            </CardHeader>
            <CardContent>
              {curatedLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : curatedAnalytics?.curatedListings && curatedAnalytics.curatedListings.length > 0 ? (
                <div className="space-y-2">
                  {curatedAnalytics.curatedListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Crown className="h-4 w-4 text-primary shrink-0" />
                        <p className="font-medium text-sm line-clamp-1">{listing.name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="outline" className={`text-[10px] capitalize ${getTierBadgeColor(listing.tier)}`}>
                          {listing.tier}
                        </Badge>
                        <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{compactNumber.format(listing.viewCount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Crown className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  No curated listings yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AnalyticsCard
              title="Total Views"
              value={conversionMetrics.totalViews}
              icon={<Eye className="h-4 w-4" />}
              loading={conversionsLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Total Favorites"
              value={conversionMetrics.totalFavorites}
              icon={<Heart className="h-4 w-4" />}
              loading={conversionsLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Total Inquiries"
              value={conversionMetrics.totalInquiries}
              icon={<MessageSquare className="h-4 w-4" />}
              loading={conversionsLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
            <AnalyticsCard
              title="Favorite Rate"
              value={`${conversionMetrics.favoriteRate}%`}
              icon={<Percent className="h-4 w-4" />}
              loading={conversionsLoading}
              size="sm"
              className="rounded-xl border-border/70"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsChart
              title="Top Listings by Inquiries"
              data={conversionsAnalytics?.inquiriesByListing || []}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={conversionsLoading}
              className="rounded-xl border-border/70"
            />
            <AnalyticsChart
              title="Top Listings by Favorites"
              data={conversionsAnalytics?.favoritesByListing || []}
              type="bar"
              dataKey="value"
              xAxisKey="name"
              height={300}
              loading={conversionsLoading}
              className="rounded-xl border-border/70"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
