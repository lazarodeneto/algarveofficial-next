import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Image, Loader2, CheckCircle, XCircle, Play, Pause, RefreshCw, Filter, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UsageStats {
  totalGenerations: number;
  successCount: number;
  errorCount: number;
  todayCount: number;
  citiesGenerated: number;
  listingsGenerated: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Listing {
  id: string;
  name: string;
  slug: string;
  featured_image_url: string | null;
  category_name: string;
  category_slug: string;
}

interface GenerationResult {
  id: string;
  name: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  url?: string;
  error?: string;
}

function isCreditsExhaustedError(err: unknown): boolean {
  const anyErr = err as any;
  const msg = String(anyErr?.message ?? "");
  const status =
    (typeof anyErr?.context?.status === "number" ? anyErr.context.status : undefined) ??
    (typeof anyErr?.status === "number" ? anyErr.status : undefined);

  return status === 402 || msg.includes("402") || msg.toLowerCase().includes("credits exhausted");
}

export default function AdminImageGeneration() {
  const router = useRouter();
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cityResults, setCityResults] = useState<GenerationResult[]>([]);
  const [listingResults, setListingResults] = useState<GenerationResult[]>([]);
  const [currentTab, setCurrentTab] = useState("listings");
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalGenerations: 0,
    successCount: 0,
    errorCount: 0,
    todayCount: 0,
    citiesGenerated: 0,
    listingsGenerated: 0,
  });

  const fetchUsageStats = useCallback(async () => {
    try {
      // Get today's date at midnight UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      // Total generations
      const { count: totalCount } = await supabase
        .from('ai_generation_logs')
        .select('*', { count: 'exact', head: true });

      // Success count
      const { count: successCount } = await supabase
        .from('ai_generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'success');

      // Error count
      const { count: errorCount } = await supabase
        .from('ai_generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'error');

      // Today's count
      const { count: todayCount } = await supabase
        .from('ai_generation_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayIso);

      // Cities generated
      const { count: citiesCount } = await supabase
        .from('ai_generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'city')
        .eq('status', 'success');

      // Listings generated
      const { count: listingsCount } = await supabase
        .from('ai_generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', 'listing')
        .eq('status', 'success');

      setUsageStats({
        totalGenerations: totalCount || 0,
        successCount: successCount || 0,
        errorCount: errorCount || 0,
        todayCount: todayCount || 0,
        citiesGenerated: citiesCount || 0,
        listingsGenerated: listingsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch cities without images
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('id, name, slug, image_url')
        .eq('is_active', true)
        .is('image_url', null)
        .order('name');

      if (citiesError) throw citiesError;
      setCities(citiesData || []);
      setCityResults((citiesData || []).map(c => ({ id: c.id, name: c.name, status: 'pending' })));

      // Fetch all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch listings without featured images
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id, 
          name, 
          slug, 
          featured_image_url,
          categories!inner(name, slug)
        `)
        .eq('status', 'published')
        .is('featured_image_url', null)
        .order('name')
        .limit(500);

      if (listingsError) throw listingsError;
      
      const formattedListings = (listingsData || []).map(l => ({
        id: l.id,
        name: l.name,
        slug: l.slug,
        featured_image_url: l.featured_image_url,
        category_name: (l.categories as any)?.name || 'Unknown',
        category_slug: (l.categories as any)?.slug || 'unknown',
      }));
      
      setAllListings(formattedListings);
      setListings(formattedListings);
      setListingResults(formattedListings.map(l => ({ id: l.id, name: l.name, status: 'pending' })));

      // Fetch usage statistics from ai_generation_logs
      await fetchUsageStats();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsageStats]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
    fetchData();
  }, [fetchData, router, user]);

  // Filter listings by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setListings(allListings);
      setListingResults(allListings.map(l => ({ id: l.id, name: l.name, status: 'pending' })));
    } else {
      const filtered = allListings.filter(l => l.category_slug === selectedCategory);
      setListings(filtered);
      setListingResults(filtered.map(l => ({ id: l.id, name: l.name, status: 'pending' })));
    }
  }, [selectedCategory, allListings]);

  const generateCityImages = async () => {
    setIsGenerating(true);
    setIsPaused(false);

    for (let i = 0; i < cities.length; i++) {
      if (isPaused) break;

      const city = cities[i];
      setCityResults(prev => prev.map(r => 
        r.id === city.id ? { ...r, status: 'generating' } : r
      ));

      try {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: {
            type: 'city',
            id: city.id,
            name: city.name,
          }
        });

        if (error) throw error;

        setCityResults(prev => prev.map(r => 
          r.id === city.id ? { ...r, status: 'success', url: data.url } : r
        ));
        toast.success(`Generated image for ${city.name}`);
      } catch (error) {
        console.error(`Error generating image for ${city.name}:`, error);
        setCityResults(prev => prev.map(r => 
          r.id === city.id ? { ...r, status: 'error', error: error instanceof Error ? error.message : 'Failed' } : r
        ));

        if (isCreditsExhaustedError(error)) {
          toast.error(
            'AI credits exhausted. Add credits in Lovable (Settings → Workspace → Plans & credits), then click Refresh and try again.'
          );
          setIsGenerating(false);
          setIsPaused(true);
          return;
        }

        toast.error(`Failed to generate image for ${city.name}`);
      }

      // Rate limiting delay (2 seconds between requests)
      if (i < cities.length - 1 && !isPaused) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsGenerating(false);
    toast.success('City image generation complete!');
  };

  const generateListingImages = async () => {
    setIsGenerating(true);
    setIsPaused(false);

    for (let i = 0; i < listings.length; i++) {
      if (isPaused) break;

      const listing = listings[i];
      setListingResults(prev => prev.map(r => 
        r.id === listing.id ? { ...r, status: 'generating' } : r
      ));

      try {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: {
            type: 'listing',
            id: listing.id,
            name: listing.name,
            category: listing.category_slug,
          }
        });

        if (error) throw error;

        setListingResults(prev => prev.map(r => 
          r.id === listing.id ? { ...r, status: 'success', url: data.url } : r
        ));
        toast.success(`Generated image for ${listing.name}`);
      } catch (error) {
        console.error(`Error generating image for ${listing.name}:`, error);
        setListingResults(prev => prev.map(r => 
          r.id === listing.id ? { ...r, status: 'error', error: error instanceof Error ? error.message : 'Failed' } : r
        ));

        if (isCreditsExhaustedError(error)) {
          toast.error(
            'AI credits exhausted. Add credits in Lovable (Settings → Workspace → Plans & credits), then click Refresh and try again.'
          );
          setIsGenerating(false);
          setIsPaused(true);
          return;
        }
      }

      // Rate limiting delay (2 seconds between requests)
      if (i < listings.length - 1 && !isPaused) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsGenerating(false);
    toast.success('Listing image generation complete!');
  };

  const getProgress = (results: GenerationResult[]) => {
    const completed = results.filter(r => r.status === 'success' || r.status === 'error').length;
    return (completed / results.length) * 100;
  };

  const getStats = (results: GenerationResult[]) => {
    return {
      total: results.length,
      pending: results.filter(r => r.status === 'pending').length,
      generating: results.filter(r => r.status === 'generating').length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
    };
  };

  const cityStats = getStats(cityResults);
  const listingStats = getStats(listingResults);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Image Generation</h1>
          <p className="text-muted-foreground">
            Generate featured images for cities and listings using AI
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isGenerating}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Usage Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Total Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalGenerations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{usageStats.successCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{usageStats.errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.todayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Image className="h-4 w-4" />
              Cities Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.citiesGenerated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Image className="h-4 w-4" />
              Listings Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.listingsGenerated}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5" />
              Cities Without Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cities.length}</div>
            <p className="text-sm text-muted-foreground">Ready for generation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Image className="h-5 w-5" />
              Listings Without Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{listings.length}</div>
            <p className="text-sm text-muted-foreground">Ready for generation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="cities">Cities ({cities.length})</TabsTrigger>
          <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generate City Images</CardTitle>
                <div className="flex gap-2">
                  {isGenerating ? (
                    <Button variant="outline" onClick={() => setIsPaused(true)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={generateCityImages} disabled={cities.length === 0}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Generation
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{cityStats.success + cityStats.error} / {cityStats.total}</span>
                </div>
                <Progress value={getProgress(cityResults)} />
              </div>

              <div className="flex gap-4 text-sm">
                <Badge variant="outline">Pending: {cityStats.pending}</Badge>
                <Badge variant="secondary">Generating: {cityStats.generating}</Badge>
                <Badge className="bg-green-500">Success: {cityStats.success}</Badge>
                <Badge variant="destructive">Error: {cityStats.error}</Badge>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {cityResults.map((result) => (
                    <div 
                      key={result.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="font-medium">{result.name}</span>
                      <div className="flex items-center gap-2">
                        {result.status === 'pending' && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        {result.status === 'generating' && (
                          <Badge variant="secondary">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Generating
                          </Badge>
                        )}
                        {result.status === 'success' && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {result.status === 'error' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Generate Listing Images</CardTitle>
                  <div className="flex gap-2">
                    {isGenerating ? (
                      <Button variant="outline" onClick={() => setIsPaused(true)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={generateListingImages} disabled={listings.length === 0}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Generation ({listings.length})
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isGenerating}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories ({allListings.length})</SelectItem>
                      {categories.map((cat) => {
                        const count = allListings.filter(l => l.category_slug === cat.slug).length;
                        return (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{listingStats.success + listingStats.error} / {listingStats.total}</span>
                </div>
                <Progress value={getProgress(listingResults)} />
              </div>

              <div className="flex gap-4 text-sm">
                <Badge variant="outline">Pending: {listingStats.pending}</Badge>
                <Badge variant="secondary">Generating: {listingStats.generating}</Badge>
                <Badge className="bg-green-500">Success: {listingStats.success}</Badge>
                <Badge variant="destructive">Error: {listingStats.error}</Badge>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {listingResults.map((result) => {
                    const listing = listings.find(l => l.id === result.id);
                    return (
                      <div 
                        key={result.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div>
                          <span className="font-medium">{result.name}</span>
                          {listing && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({listing.category_name})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {result.status === 'pending' && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {result.status === 'generating' && (
                            <Badge variant="secondary">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Generating
                            </Badge>
                          )}
                          {result.status === 'success' && (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}
                          {result.status === 'error' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
