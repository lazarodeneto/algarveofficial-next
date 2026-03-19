import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown,
  Edit,
  Image,
  TrendingUp,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TierBadgeOwner } from "@/components/owner/TierBadgeOwner";
import { StatusBadgeOwner } from "@/components/owner/StatusBadgeOwner";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function OwnerOverview() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Fetch owner's listings
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['owner-listings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          category:categories(name),
          city:cities(name)
        `)
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const publishedCount = listings.filter(l => l.status === 'published').length;
  const pendingCount = listings.filter(l => l.status === 'pending_review').length;
  const draftCount = listings.filter(l => l.status === 'draft').length;
  const hasCurated = listings.some(l => l.is_curated);
  const hasSignature = listings.some(l => l.tier === 'signature');

  // Most recent listing
  const recentListing = listings[0];
  const welcomeName = user?.firstName || user?.email?.split('@')[0] || t('owner.overview.owner');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">
          {t('owner.overview.welcomeBack', { name: welcomeName })}
        </h1>
        <p className="text-muted-foreground">
          {t('owner.overview.subtitle')}
        </p>
      </motion.div>

      {/* Alerts */}
      <div className="space-y-3">
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
          >
            <Clock className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-200">
              {t('owner.overview.pendingReviewAlert', { count: pendingCount })}
            </p>
          </motion.div>
        )}
        
        {hasSignature && !hasCurated && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <Crown className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-200">
                {t('owner.overview.signatureEligible')}
              </p>
              <p className="text-xs text-amber-400/70 mt-1">
                {t('owner.overview.signatureEligibleNote')}
              </p>
            </div>
          </motion.div>
        )}
        
        {hasCurated && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20"
          >
            <Star className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-primary">
              {t('owner.overview.curatedCongrats')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('owner.overview.totalListings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{listings.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              {t('owner.overview.published')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{publishedCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              {t('owner.overview.underReview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('owner.overview.curated')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {listings.filter(l => l.is_curated).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('owner.overview.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" asChild className="justify-start h-auto py-3">
            <Link to="/owner/listings" className="flex items-center gap-3">
              <Edit className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">{t('owner.overview.editListings')}</p>
                <p className="text-xs text-muted-foreground">{t('owner.overview.updateContent')}</p>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="justify-start h-auto py-3">
            <Link to="/owner/media" className="flex items-center gap-3">
              <Image className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">{t('owner.overview.uploadPhotos')}</p>
                <p className="text-xs text-muted-foreground">{t('owner.overview.manageGallery')}</p>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="justify-start h-auto py-3">
            <Link to="/owner/membership" className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-400" />
              <div className="text-left">
                <p className="font-medium">{t('owner.overview.upgradePlan')}</p>
                <p className="text-xs text-muted-foreground">{t('owner.overview.increaseVisibility')}</p>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="justify-start h-auto py-3">
            <Link to="/owner/support" className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">{t('owner.overview.getHelp')}</p>
                <p className="text-xs text-muted-foreground">{t('owner.overview.contactSupport')}</p>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Listing */}
      {recentListing && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{t('owner.overview.mostRecentUpdate')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/owner/listings" className="flex items-center gap-1">
                  {t('owner.overview.viewAll')} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <ImageWithFallback
                src={recentListing.featured_image_url}
                alt={recentListing.name}
                containerClassName="w-full sm:w-32 h-32 rounded-lg flex-shrink-0"
                fallbackIconSize={32}
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{recentListing.name}</h3>
                  <TierBadgeOwner tier={recentListing.tier} size="sm" />
                  <StatusBadgeOwner status={recentListing.status as "draft" | "pending_review" | "published" | "rejected"} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {recentListing.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{recentListing.city?.name || t('owner.overview.unknownCity')}</span>
                  <span>•</span>
                  <span>{recentListing.category?.name || t('owner.overview.unknownCategory')}</span>
                  <span>•</span>
                  <span>{t('owner.overview.updated')} {new Date(recentListing.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <Button size="sm" asChild>
                    <Link to={`/owner/listings/${recentListing.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('owner.overview.editListing')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Selection Info */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-primary/5 border-amber-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Crown className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t('owner.overview.curatedExcellence')}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  {t('owner.overview.curatedExcellenceDesc')}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-amber-500/30 hover:bg-amber-500/10">
              <Link to="/owner/membership">{t('owner.overview.learnMore')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
