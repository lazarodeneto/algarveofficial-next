import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Search,
  Grid,
  List,
  Trash2,
  MessageSquare,
  ExternalLink,
  Crown,
  ShieldCheck,
  MapPin,
  Mountain,
  Building2,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import ListingImage from "@/components/ListingImage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getRegionImageSet } from "@/lib/regionImages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { TablesInsert } from "@/integrations/supabase/types";

export default function UserFavorites() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [listingToRemove, setListingToRemove] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'regions' | 'cities'>('listings');
  
  const [destRemoveDialogOpen, setDestRemoveDialogOpen] = useState(false);
  const [destToRemove, setDestToRemove] = useState<{ type: 'region' | 'city'; id: string; name: string } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [destSearchQuery, setDestSearchQuery] = useState("");

  // Fetch favorite listings
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          listing_id,
          listing:listings(
            id, name, slug, description, short_description, 
            featured_image_url, tier, is_curated,
            category:categories(id, name, slug, image_url),
            city:cities(id, name)
          )
        `)
        .eq('user_id', user.id)
        .not('listing_id', 'is', null);
      if (error) throw error;
      return data.filter(f => f.listing);
    },
    enabled: !!user?.id,
  });

  // Fetch saved regions
  const { data: savedRegions = [] } = useQuery({
    queryKey: ['user-saved-regions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          region:regions(id, name, slug, short_description, image_url)
        `)
        .eq('user_id', user.id)
        .not('region_id', 'is', null);
      if (error) throw error;
      return data.filter(f => f.region).map(f => f.region);
    },
    enabled: !!user?.id,
  });

  // Fetch saved cities
  const { data: savedCities = [] } = useQuery({
    queryKey: ['user-saved-cities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          city:cities(id, name, slug, short_description, image_url)
        `)
        .eq('user_id', user.id)
        .not('city_id', 'is', null);
      if (error) throw error;
      return data.filter(f => f.city).map(f => f.city);
    },
    enabled: !!user?.id,
  });

  // Fetch all regions and cities for "Add" dialog
  const { data: allRegions = [] } = useQuery({
    queryKey: ['all-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: allCities = [] } = useQuery({
    queryKey: ['all-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch all categories for filters
  const { data: categories = [] } = useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user?.id) {
        throw new Error("User authentication required");
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast.success("Removed from favorites");
    },
  });

  // Add destination mutation
  const addDestinationMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'region' | 'city'; id: string }) => {
      if (!user?.id) {
        throw new Error("User authentication required");
      }

      const insert: TablesInsert<'favorites'> = type === 'region'
        ? { user_id: user.id, region_id: id }
        : { user_id: user.id, city_id: id };
      const { error } = await supabase.from('favorites').insert(insert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-saved-regions'] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-cities'] });
      toast.success("Destination saved");
    },
  });

  // Remove destination mutation
  const removeDestinationMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'region' | 'city'; id: string }) => {
      if (!user?.id) {
        throw new Error("User authentication required");
      }

      const query = supabase.from('favorites').delete().eq('user_id', user.id);
      if (type === 'region') {
        await query.eq('region_id', id);
      } else {
        await query.eq('city_id', id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-saved-regions'] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-cities'] });
      toast.success("Destination removed");
    },
  });

  // Filter listings
  const favoriteListings = favorites.map(f => f.listing).filter(Boolean);
  const filteredListings = favoriteListings.filter((listing: any) => {
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || listing.category?.id === categoryFilter;
    const matchesCity = cityFilter === "all" || listing.city?.id === cityFilter;
    const matchesTier = tierFilter === "all" || listing.tier === tierFilter;
    return matchesSearch && matchesCategory && matchesCity && matchesTier;
  });

  // Sort: Signature first, then Verified, then Unverified
  const sortedListings = [...filteredListings].sort((a: any, b: any) => {
    const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  const usedCategories = [...new Set(favoriteListings.map((l: any) => l.category?.id).filter(Boolean))];
  const usedCities = [...new Set(favoriteListings.map((l: any) => l.city?.id).filter(Boolean))];

  const handleRemoveClick = (listingId: string) => {
    setListingToRemove(listingId);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (!listingToRemove) return;
    removeFavoriteMutation.mutate(listingToRemove);
    setRemoveDialogOpen(false);
    setListingToRemove(null);
  };

  const handleDestRemoveClick = (type: 'region' | 'city', id: string, name: string) => {
    setDestToRemove({ type, id, name });
    setDestRemoveDialogOpen(true);
  };

  const confirmDestRemove = () => {
    if (!destToRemove) return;
    removeDestinationMutation.mutate({ type: destToRemove.type, id: destToRemove.id });
    setDestRemoveDialogOpen(false);
    setDestToRemove(null);
  };

  const handleAddDestination = (type: 'region' | 'city', id: string, name: string) => {
    addDestinationMutation.mutate({ type, id });
  };

  const savedRegionIds = savedRegions.map((r: any) => r?.id);
  const savedCityIds = savedCities.map((c: any) => c?.id);
  const availableRegions = allRegions.filter(r => !savedRegionIds.includes(r.id));
  const availableCities = allCities.filter(c => !savedCityIds.includes(c.id));

  const filteredAvailableRegions = availableRegions.filter(r =>
    r.name.toLowerCase().includes(destSearchQuery.toLowerCase())
  );
  const filteredAvailableCities = availableCities.filter(c =>
    c.name.toLowerCase().includes(destSearchQuery.toLowerCase())
  );

  if (favoritesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground flex items-center gap-3">
            <Heart className="h-7 w-7 text-primary" />
            {t("dashboard.favorites.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.favorites.subtitle")}
          </p>
        </div>
      </m.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'listings' | 'regions' | 'cities')}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t("dashboard.favorites.listings")} ({favoriteListings.length})
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center gap-2">
              <Mountain className="h-4 w-4" />
              {t("dashboard.favorites.regions")} ({savedRegions.length})
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("dashboard.favorites.cities")} ({savedCities.length})
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'listings' && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {(activeTab === 'regions' || activeTab === 'cities') && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.favorites.addDestination")}
            </Button>
          )}
        </div>

        {/* Listings Tab */}
        <TabsContent value="listings" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("dashboard.favorites.searchFavorites")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t("directory.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.favorites.allCategories")}</SelectItem>
                {categories.filter(c => usedCategories.includes(c.id)).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("directory.city")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.favorites.allCities")}</SelectItem>
                {allCities.filter(c => usedCities.includes(c.id)).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder={t("directory.tier")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.favorites.allTiers")}</SelectItem>
                <SelectItem value="signature">{t("common.signature")}</SelectItem>
                <SelectItem value="verified">{t("common.verified")}</SelectItem>
                <SelectItem value="unverified">{t("common.free")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings */}
          {filteredListings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{t("dashboard.favorites.noFavoritesYet")}</p>
                <p className="text-muted-foreground text-center mb-6">
                  {t("dashboard.favorites.startExploring")}
                </p>
                <Button asChild>
                  <LocaleLink href="/">{t("dashboard.favorites.exploreListings")}</LocaleLink>
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedListings.map((listing: any) => (
                <div key={listing.id}>
                  <Card className={`bg-card border-border overflow-hidden h-full ${listing.tier === 'signature' ? 'border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]' : ''}`}>
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
                        onClick={() => handleRemoveClick(listing.id)}
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
                    <CardContent className="p-4 flex flex-col">
                      <Link href={`/listing/${listing.slug}`}>
                        <h3 className="font-medium line-clamp-1">
                          {listing.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {listing.short_description || listing.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{listing.city?.name}</span>
                        <span>•</span>
                        <span>{listing.category?.name}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link href={`/listing/${listing.slug}`}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedListings.map((listing: any) => (
                <div key={listing.id}>
                  <Card className={`bg-card border-border ${listing.tier === 'signature' ? 'border-[2px] border-[hsl(43,86%,58%)] shadow-[0_0_10px_hsla(43,86%,58%,0.34)]' : ''}`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="w-full h-36 sm:w-32 sm:h-24 rounded-lg flex-shrink-0 overflow-hidden bg-muted">
                          <ListingImage
                            src={listing.featured_image_url}
                            category={listing.category?.slug}
                            categoryImageUrl={listing.category?.image_url}
                            listingId={listing.id}
                            alt={listing.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="min-w-0">
                              <Link href={`/listing/${listing.slug}`}>
                                <h3 className="font-medium line-clamp-2 sm:line-clamp-1 break-words">
                                  {listing.name}
                                </h3>
                              </Link>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {listing.tier === 'signature' && (
                                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400">
                                    Signature
                                  </span>
                                )}
                                {listing.tier === 'verified' && (
                                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive self-end sm:self-auto"
                              onClick={() => handleRemoveClick(listing.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-1">
                            {listing.short_description || listing.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="truncate">{listing.city?.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{listing.category?.name}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="mt-6">
          {savedRegions.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Mountain className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{t("dashboard.favorites.noSavedRegions")}</p>
                <p className="text-muted-foreground text-center mb-6">
                  {t("dashboard.favorites.saveRegions")}
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("dashboard.favorites.addRegion")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRegions.map((region: any) => (
                <div key={region.id}>
                  <Card className="bg-card border-border overflow-hidden">
                    <div className="aspect-video overflow-hidden relative">
                      <ImageWithFallback
                        src={region.hero_image_url || getRegionImageSet(region.slug)?.image || region.image_url}
                        alt={region.name}
                        containerClassName="w-full h-full"
                        fallbackIconSize={48}
                        className="object-cover"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 bg-black/30 backdrop-blur-xl"
                        onClick={() => handleDestRemoveClick('region', region.id, region.name)}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <Link href={`/destinations/${region.slug}`}>
                        <h3 className="font-medium">
                          {region.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {region.short_description}
                      </p>
                      <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                        <Link href={`/destinations/${region.slug}`}>
                          {t("dashboard.favorites.exploreRegion")}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="mt-6">
          {savedCities.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">{t("dashboard.favorites.noSavedCities")}</p>
                <p className="text-muted-foreground text-center mb-6">
                  {t("dashboard.favorites.saveCities")}
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("dashboard.favorites.addCity")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCities.map((city: any) => (
                <div key={city.id}>
                  <Card className="bg-card border-border overflow-hidden">
                    <div className="aspect-video overflow-hidden relative">
                      <ImageWithFallback
                        src={city.image_url}
                        alt={city.name}
                        containerClassName="w-full h-full"
                        fallbackIconSize={48}
                        className="object-cover"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 bg-black/30 backdrop-blur-xl"
                        onClick={() => handleDestRemoveClick('city', city.id, city.name)}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <Link href={`/visit/${city.slug}`}>
                        <h3 className="font-medium">
                          {city.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {city.short_description}
                      </p>
                      <Button size="sm" variant="outline" className="mt-3 w-full" asChild>
                        <Link href={`/visit/${city.slug}`}>
                          {t("dashboard.favorites.exploreCity")}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Remove Listing Confirm Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.favorites.removeFromFavorites")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.favorites.removeFromFavoritesDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>{t("dashboard.favorites.remove")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Destination Confirm Dialog */}
      <AlertDialog open={destRemoveDialogOpen} onOpenChange={setDestRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.favorites.removeDestinationTitle", { name: destToRemove?.name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.favorites.removeDestinationDescription", { type: destToRemove?.type })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDestRemove}>{t("dashboard.favorites.remove")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Destination Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dashboard.favorites.addDestination")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t("dashboard.favorites.searchDestinations")}
              value={destSearchQuery}
              onChange={(e) => setDestSearchQuery(e.target.value)}
            />
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {filteredAvailableRegions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Mountain className="h-4 w-4" />
                      {t("dashboard.favorites.regions")}
                    </h4>
                    <div className="space-y-2">
                      {filteredAvailableRegions.map(region => (
                        <Button
                          key={region.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => {
                            handleAddDestination('region', region.id, region.name);
                            setAddDialogOpen(false);
                          }}
                        >
                          {region.name}
                          <Plus className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {filteredAvailableCities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t("dashboard.favorites.cities")}
                    </h4>
                    <div className="space-y-2">
                      {filteredAvailableCities.map(city => (
                        <Button
                          key={city.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => {
                            handleAddDestination('city', city.id, city.name);
                            setAddDialogOpen(false);
                          }}
                        >
                          {city.name}
                          <Plus className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {filteredAvailableRegions.length === 0 && filteredAvailableCities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {t("dashboard.favorites.noDestinationsFound")}
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
