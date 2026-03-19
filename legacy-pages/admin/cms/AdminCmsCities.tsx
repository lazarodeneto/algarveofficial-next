import { useState } from "react";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MapPin, 
  Edit, 
  Trash2, 
  MoreVertical,
  Eye,
  Save,
  Star,
  Home,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { SeoFieldsPanel } from "@/components/admin/seo/SeoFieldsPanel";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type CityRow = Tables<"cities">;
type CityFormState = Partial<CityRow> & { id?: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function AdminCmsCities() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCity, setEditingCity] = useState<CityFormState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("edit");

  // Fetch all cities from Supabase
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CityRow[];
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("cities")
        .update({ is_featured })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      toast.success("Homepage visibility updated");
    },
    onError: () => {
      toast.error("Failed to update city");
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("cities")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      toast.success("City status updated");
    },
    onError: () => {
      toast.error("Failed to update city");
    },
  });

  // Save city mutation
  const saveCityMutation = useMutation({
    mutationFn: async (city: Partial<CityRow> & { id: string }) => {
      const { error } = await supabase
        .from("cities")
        .update({
          name: city.name,
          slug: city.slug,
          short_description: city.short_description,
          description: city.description,
          hero_image_url: city.hero_image_url,
          image_url: city.image_url,
          latitude: city.latitude,
          longitude: city.longitude,
          meta_title: city.meta_title,
          meta_description: city.meta_description,
        })
        .eq("id", city.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      setIsDialogOpen(false);
      toast.success("City updated successfully");
    },
    onError: () => {
      toast.error("Failed to update city");
    },
  });

  const createCityMutation = useMutation({
    mutationFn: async (city: CityFormState) => {
      const maxOrder = cities.reduce((acc, item) => Math.max(acc, item.display_order ?? 0), 0);
      const payload: TablesInsert<"cities"> = {
        name: (city.name || "").trim(),
        slug: slugify(city.slug || city.name || ""),
        short_description: city.short_description || null,
        description: city.description || null,
        hero_image_url: city.hero_image_url || null,
        image_url: city.image_url || null,
        latitude: city.latitude ?? null,
        longitude: city.longitude ?? null,
        meta_title: city.meta_title || null,
        meta_description: city.meta_description || null,
        is_active: city.is_active ?? true,
        is_featured: city.is_featured ?? false,
        display_order: maxOrder + 1,
      };

      const { error } = await supabase.from("cities").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      setIsDialogOpen(false);
      toast.success("City created successfully");
    },
    onError: () => {
      toast.error("Failed to create city");
    },
  });

  // Delete city mutation
  const deleteCityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      toast.success("City deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete city");
    },
  });

  const reorderCitiesMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          supabase
            .from("cities")
            .update({ display_order: index + 1 })
            .eq("id", id),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City order updated");
    },
    onError: () => {
      toast.error("Failed to reorder cities");
    },
  });

  const sortedCities = [...cities].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const filteredCities = sortedCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCount = cities.filter(c => c.is_featured).length;

  const handleEditCity = (city: CityRow) => {
    setDialogMode("edit");
    setEditingCity({ ...city });
    setIsDialogOpen(true);
  };

  const handleAddCity = () => {
    setDialogMode("create");
    setEditingCity({
      name: "",
      slug: "",
      short_description: "",
      description: "",
      hero_image_url: "",
      image_url: "",
      latitude: null,
      longitude: null,
      meta_title: "",
      meta_description: "",
      is_active: true,
      is_featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleSaveCity = () => {
    if (!editingCity) return;
    if (!(editingCity.name || "").trim()) {
      toast.error("City name is required");
      return;
    }
    if (dialogMode === "create") {
      createCityMutation.mutate(editingCity);
      return;
    }
    if (!editingCity.id) {
      toast.error("Missing city ID");
      return;
    }
    saveCityMutation.mutate(editingCity as Partial<CityRow> & { id: string });
  };

  const handleMoveCity = (cityId: string, direction: "up" | "down") => {
    const currentIndex = sortedCities.findIndex((item) => item.id === cityId);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedCities.length) return;

    const reordered = [...sortedCities];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    reorderCitiesMutation.mutate(reordered.map((item) => item.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Cities</h1>
          <p className="text-muted-foreground">
            Manage city pages • {featuredCount} featured on homepage
          </p>
        </div>
        <Button onClick={handleAddCity}>
          <Plus className="h-4 w-4 mr-2" />
          Add City
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Home className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Toggle <Star className="h-3.5 w-3.5 inline mx-1 text-primary" /> to display cities on the homepage. Only featured cities appear in the "Discover Cities" section.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCities.map((city) => (
          <Card 
            key={city.id} 
            className={`border-border bg-card/50 overflow-hidden transition-all hover:border-primary/30 ${!city.is_active && 'opacity-50'}`}
          >
            {/* Thumbnail */}
            <div className="aspect-video relative">
              <ImageWithFallback
                src={city.hero_image_url ?? undefined}
                alt={city.name}
                containerClassName="w-full h-full"
                fallbackIconSize={40}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge 
                  variant={city.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {city.is_active ? 'Active' : 'Hidden'}
                </Badge>
              </div>
              {city.is_featured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-primary/90 text-primary-foreground text-xs gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Homepage
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{city.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {city.short_description || 'No description'}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCity(city)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/city/${city.slug}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Page
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleMoveCity(city.id, "up")}
                      disabled={sortedCities.findIndex((item) => item.id === city.id) === 0 || reorderCitiesMutation.isPending}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleMoveCity(city.id, "down")}
                      disabled={sortedCities.findIndex((item) => item.id === city.id) === sortedCities.length - 1 || reorderCitiesMutation.isPending}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleActiveMutation.mutate({ id: city.id, is_active: !city.is_active })}
                    >
                      {city.is_active ? 'Hide City' : 'Show City'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        if (window.confirm(`Delete city "${city.name}"? This action cannot be undone.`)) {
                          deleteCityMutation.mutate(city.id);
                        }
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Homepage Toggle */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 ${city.is_featured ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">Homepage</span>
                </div>
                <Switch
                  checked={city.is_featured}
                  onCheckedChange={(checked) => 
                    toggleFeaturedMutation.mutate({ id: city.id, is_featured: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No cities found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Create City" : "Edit City"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Add a new city with content and SEO fields"
                : "Update city details, images, and SEO settings"}
            </DialogDescription>
          </DialogHeader>

          {editingCity && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">City Name</Label>
                  <Input
                    id="name"
                    value={editingCity.name}
                    onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={editingCity.slug}
                    onChange={(e) => setEditingCity({ ...editingCity, slug: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={editingCity.short_description || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, short_description: e.target.value })}
                  className="bg-background"
                  placeholder="Brief tagline for the city..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={editingCity.description || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, description: e.target.value })}
                  className="bg-background"
                  rows={4}
                  placeholder="Editorial description of this city..."
                />
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <Label>Hero Image URL</Label>
                <Input
                  value={editingCity.hero_image_url || ''}
                  onChange={(e) => setEditingCity({ ...editingCity, hero_image_url: e.target.value })}
                  className="bg-background"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Card Image URL</Label>
                <Input
                  value={editingCity.image_url || ""}
                  onChange={(e) => setEditingCity({ ...editingCity, image_url: e.target.value })}
                  className="bg-background"
                  placeholder="https://..."
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={editingCity.latitude || ''}
                    onChange={(e) => setEditingCity({ ...editingCity, latitude: parseFloat(e.target.value) || null })}
                    className="bg-background"
                    placeholder="37.0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={editingCity.longitude || ''}
                    onChange={(e) => setEditingCity({ ...editingCity, longitude: parseFloat(e.target.value) || null })}
                    className="bg-background"
                    placeholder="-8.0000"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="border-t border-border pt-4">
                <SeoFieldsPanel
                  data={{
                    meta_title: editingCity.meta_title,
                    meta_description: editingCity.meta_description,
                  }}
                  onChange={(seoData) => setEditingCity({
                    ...editingCity,
                    meta_title: seoData.meta_title,
                    meta_description: seoData.meta_description,
                  })}
                  pageName={editingCity.name}
                  pageSlug={`city/${editingCity.slug}`}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCity} disabled={saveCityMutation.isPending || createCityMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {(saveCityMutation.isPending || createCityMutation.isPending)
                ? "Saving..."
                : (dialogMode === "create" ? "Create City" : "Save City")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
