import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  ArrowRight,
  Star,
  Crown,
  Sparkles,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePublishedListings } from "@/hooks/useListings";
import { useFeaturedRegions } from "@/hooks/useReferenceData";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { useSavedDestinations } from "@/hooks/useSavedDestinations";
import { useTranslation } from "react-i18next";
import { getRegionImageSet } from "@/lib/regionImages";
import ListingImage from "@/components/ListingImage";

function resolveRegionImageSrc(value: string | { src: string } | null | undefined) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.src;
}

export default function UserOverview() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { favoriteListingIds, favoriteListings } = useFavoriteListings();
  const { savedCityIds, savedRegionIds } = useSavedDestinations();
  
  // Fetch published listings
  const { data: allListings = [], isLoading: listingsLoading } = usePublishedListings();
  
  // Fetch featured regions from Supabase
  const { data: featuredRegions = [], isLoading: regionsLoading } = useFeaturedRegions();
  
  // Get user's favorite listings
  const userFavoriteListings = allListings.filter(l => 
    favoriteListingIds.includes(l.id)
  ).slice(0, 3);
  
  // Get display name from AuthContext user
  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  
  const isLoading = listingsLoading || regionsLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl lg:text-4xl font-serif font-semibold text-foreground">
          {t("dashboard.overview.welcomeBack", { name: displayName })}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("dashboard.overview.discoverFinest")}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{favoriteListings.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.overview.favorites")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <MapPin className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedCityIds.length + savedRegionIds.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.overview.savedPlaces")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allListings.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.overview.listingsAvailable")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Link to="/dashboard/profile">
            <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Star className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("dashboard.overview.vipMember")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.overview.viewProfile")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold">{t("dashboard.overview.signatureDestinations")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.overview.exclusivePremium")}</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 flex-1">
                {t("dashboard.overview.signatureDescription")}
              </p>
              <Button asChild className="w-fit">
                <Link to="/destinations">
                  {t("dashboard.overview.exploreDestinations")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30 h-full">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold">{t("dashboard.overview.curatedExcellence")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dashboard.overview.vipOnlySelection")}</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 flex-1">
                {t("dashboard.overview.curatedDescription")}
              </p>
              <Button asChild variant="outline" className="w-fit border-amber-500/30 hover:bg-amber-500/10">
                <Link to="/">
                  {t("dashboard.overview.viewVipSelection")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Featured Regions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold">{t("dashboard.overview.featuredRegions")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/destinations" className="flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {regionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : featuredRegions.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("dashboard.overview.noFeaturedRegions")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredRegions.slice(0, 3).map((region, index) => {
              const mappedRegionImage = getRegionImageSet(region.slug);
              const regionImageSrc =
                resolveRegionImageSrc(mappedRegionImage?.image) ||
                region.image_url ||
                region.hero_image_url ||
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
              return (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link to={`/destinations/${region.slug}`}>
                  <Card className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={regionImageSrc}
                        alt={region.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-serif text-lg font-semibold text-white">{region.name}</h3>
                        <p className="text-sm text-white/70 line-clamp-1">{region.short_description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* My Favorites Preview */}
      {userFavoriteListings.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t("dashboard.overview.myFavorites")}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/favorites" className="flex items-center gap-1">
                {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {userFavoriteListings.map((listing) => (
              <div key={listing.id}>
                <Card className="bg-card border-border overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <ListingImage
                      src={listing.featured_image_url}
                      category={listing.category?.slug}
                      categoryImageUrl={listing.category?.image_url}
                      listingId={listing.id}
                      alt={listing.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/40 hover:border-red-400/30"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                    {listing.tier === 'signature' && (
                      <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-semibold rounded bg-gradient-to-r from-[hsl(43,74%,49%)] to-[hsl(43,80%,35%)] text-black flex items-center gap-1.5 uppercase tracking-wider">
                        <Crown className="h-3 w-3" />
                        SIGNATURE
                      </span>
                    )}
                    {listing.tier === 'verified' && (
                      <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-semibold rounded bg-green-600 text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="h-3 w-3" />
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-1">{listing.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.city?.name || 'Algarve'} • {listing.category?.name || 'Experience'}
                    </p>
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link to={`/listing/${listing.slug || listing.id}`}>{t("dashboard.overview.viewDetails")}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </motion.section>
      )}
      
      {/* Empty favorites state */}
      {!isLoading && userFavoriteListings.length === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t("dashboard.overview.myFavorites")}
            </h2>
          </div>
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-4">{t("dashboard.overview.noFavoritesYet")}</p>
              <Button asChild>
                <Link to="/directory">
                  {t("dashboard.overview.exploreListings")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </div>
  );
}
