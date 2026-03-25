import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  List,
  Crown,
  ClipboardCheck,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  Star,
  RefreshCw,
  StopCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/admin/StatsCard";
import { TierBadge } from "@/components/admin/TierBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useGoogleRatingsSync } from "@/hooks/useGoogleRatingsSync";
import { format } from "date-fns";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

export default function AdminOverview() {
  const l = useLocalizedHref();
  // Google Ratings Sync
  const {
    syncStatus,
    isLoading: ratingsLoading,
    lastRefresh,
    progress,
    initRefresh,
    isInitializing,
    stopRefresh,
    isStopping,
  } = useGoogleRatingsSync();

  const getStatusBadge = () => {
    if (!syncStatus) return null;
    switch (syncStatus.status) {
      case "idle":
        return <Badge variant="secondary">Idle</Badge>;
      case "running":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Running {progress}%</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Completed</Badge>;
      default:
        return null;
    }
  };

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [totalRes, publishedRes, pendingRes, unverifiedRes, nullTierRes, verifiedRes, signatureRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact' }).limit(1),
        supabase.from('listings').select('id', { count: 'exact' }).eq('status', 'published').limit(1),
        supabase.from('listings').select('id', { count: 'exact' }).eq('status', 'pending_review').limit(1),
        supabase.from('listings').select('id', { count: 'exact' }).eq('tier', 'unverified').limit(1),
        supabase.from('listings').select('id', { count: 'exact' }).is('tier', null).limit(1),
        supabase.from('listings').select('id', { count: 'exact' }).eq('tier', 'verified').limit(1),
        supabase.from('listings').select('id', { count: 'exact' }).eq('tier', 'signature').limit(1),
      ]);

      return {
        totalListings: totalRes.count || 0,
        publishedListings: publishedRes.count || 0,
        pendingReview: pendingRes.count || 0,
        tierDistribution: {
          // Treat legacy NULL tier rows as unverified/free.
          unverified: (unverifiedRes.count || 0) + (nullTierRes.count || 0),
          verified: verifiedRes.count || 0,
          signature: signatureRes.count || 0,
        }
      };
    },
  });

  // Fetch recent listings
  const { data: recentListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['admin-recent-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, name, tier, status, city:cities(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = statsLoading || listingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to AlgarveOfficial CMS
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={l("/admin/listings/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Listings"
          value={stats?.totalListings || 0}
          icon={<List className="h-6 w-6" />}
          description="Across all categories"
        />
        <StatsCard
          title="Published"
          value={stats?.publishedListings || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          description="Live on the site"
        />
        <StatsCard
          title="Pending Review"
          value={stats?.pendingReview || 0}
          icon={<ClipboardCheck className="h-6 w-6" />}
          description="Awaiting approval"
        />
      </div>

      {/* Tier Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Tier Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Link
              href={`${l("/admin/listings")}?tier=unverified`}
              className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer block"
            >
              <p className="text-3xl font-serif font-semibold text-muted-foreground">
                {stats?.tierDistribution.unverified || 0}
              </p>
              <TierBadge tier="unverified" size="sm" />
            </Link>
            <Link
              href={`${l("/admin/listings")}?tier=verified`}
              className="text-center p-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors cursor-pointer block"
            >
              <p className="text-3xl font-serif font-semibold text-green-400">
                {stats?.tierDistribution.verified || 0}
              </p>
              <TierBadge tier="verified" size="sm" />
            </Link>
            <Link
              href={`${l("/admin/listings")}?tier=signature`}
              className="text-center p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer block"
            >
              <p className="text-3xl font-serif font-semibold text-primary">
                {stats?.tierDistribution.signature || 0}
              </p>
              <TierBadge tier="signature" size="sm" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Google Ratings Sync */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <CardTitle className="font-serif text-xl">Google Ratings Sync</CardTitle>
            </div>
            {ratingsLoading ? (
              <Badge variant="outline">Loading...</Badge>
            ) : (
              getStatusBadge()
            )}
          </div>
          <CardDescription>
            Bulk update Google ratings for all listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Last Refresh and Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {lastRefresh?.completed_at ? (
                <>Last refresh: {format(new Date(lastRefresh.completed_at), "MMM d, yyyy HH:mm")}</>
              ) : (
                <>No previous refresh</>
              )}
            </span>
            {syncStatus && (
              <span className="text-muted-foreground">
                {syncStatus.processed_count} / {syncStatus.total_listings} listings
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {syncStatus && syncStatus.total_listings > 0 && (
            <Progress value={progress} className="h-2" />
          )}

          {/* Stats when running or completed */}
          {syncStatus && (syncStatus.status === "running" || syncStatus.status === "completed") && (
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400 inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                {syncStatus.success_count} successful
              </span>
              {(syncStatus.failure_count ?? 0) > 0 && (
                <span className="text-red-400 inline-flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" />
                  {syncStatus.failure_count} failed
                </span>
              )}
            </div>
          )}

          <Separator />

          {/* Info and Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Auto-refresh: Mondays at 3:00 AM UTC
            </p>
            <div className="flex items-center gap-2">
              {syncStatus?.status === "running" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => stopRefresh()}
                  disabled={isStopping}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  {isStopping ? "Stopping..." : "Stop"}
                </Button>
              )}
              <Button
                onClick={() => initRefresh()}
                disabled={isInitializing || syncStatus?.status === "running"}
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : syncStatus?.status === "running" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Fetch All Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={l("/admin/listings/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Listing
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={l("/admin/moderation")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Review Pending ({stats?.pendingReview || 0})
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={l("/admin/curated")}>
                <Crown className="h-4 w-4 mr-2" />
                Manage Signature Selection
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">Recent Listings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={l("/admin/listings")}>
                View All <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentListings.map((listing: any) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {listing.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {listing.city?.name || 'No city'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <TierBadge tier={listing.tier} size="sm" />
                    <StatusBadge status={listing.status} size="sm" />
                  </div>
                </div>
              ))}
              {recentListings.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No listings yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
