import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Search, Edit, MoreHorizontal, Check, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { callAdminTaxonomyApi } from "@/lib/admin/taxonomy-client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type CityRow = Tables<"cities">;

export default function AdminCities() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityRow | null>(null);
  const [formData, setFormData] = useState({
    short_description: "",
    is_active: true,
    is_featured: false,
  });

  // Fetch cities from database
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
      await callAdminTaxonomyApi("cities", "PATCH", { id, is_featured });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      queryClient.invalidateQueries({ queryKey: ["cities", "featured"] });
      toast.success("City updated");
    },
    onError: () => {
      toast.error("Failed to update city");
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await callAdminTaxonomyApi("cities", "PATCH", { id, is_active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City updated");
    },
    onError: () => {
      toast.error("Failed to update city");
    },
  });

  // Save city mutation (edit only - no create)
  const saveCityMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      await callAdminTaxonomyApi("cities", "PATCH", {
        id: data.id,
        short_description: data.short_description,
        is_active: data.is_active,
        is_featured: data.is_featured,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City updated");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to save city");
    },
  });

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.short_description?.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = cities.filter((c) => c.is_featured).length;

  const handleEdit = (city: CityRow) => {
    setSelectedCity(city);
    setFormData({
      short_description: city.short_description || "",
      is_active: city.is_active,
      is_featured: city.is_featured,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedCity) return;
    saveCityMutation.mutate({
      ...formData,
      id: selectedCity.id,
    });
  };

  const resetForm = () => {
    setSelectedCity(null);
    setFormData({ short_description: "", is_active: true, is_featured: false });
  };

  const columns: Column<CityRow>[] = [
    {
      key: "name",
      label: "City",
      render: (city) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{city.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      className: "hidden md:table-cell",
      render: (city) => (
        <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
          {city.slug}
        </code>
      ),
    },
    {
      key: "is_featured",
      label: "Homepage",
      render: (city) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            toggleFeaturedMutation.mutate({ id: city.id, is_featured: !city.is_featured });
          }}
        >
          {city.is_featured ? (
            <>
              <Home className="h-4 w-4 text-primary" />
              <span className="text-primary text-xs">Featured</span>
            </>
          ) : (
            <>
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Not shown</span>
            </>
          )}
        </Button>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (city) =>
        city.is_active ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        ),
    },
    {
      key: "actions",
      label: "",
      className: "w-12",
      render: (city) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={() => handleEdit(city)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toggleFeaturedMutation.mutate({ id: city.id, is_featured: !city.is_featured })
              }
            >
              <Home className="h-4 w-4 mr-2" />
              {city.is_featured ? "Remove from Homepage" : "Show on Homepage"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toggleActiveMutation.mutate({ id: city.id, is_active: !city.is_active })
              }
            >
              {city.is_active ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground">Cities</h1>
          <p className="text-muted-foreground mt-1">
            Select which Algarve cities appear on the homepage • {featuredCount} featured
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <Home className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          <strong>{featuredCount} cities</strong> are currently displayed on the homepage. Click the "Homepage" button to toggle visibility.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading cities...
        </div>
      ) : (
        <DataTable columns={columns} data={filteredCities} emptyMessage="No cities found" />
      )}

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredCities.length} of {cities.length} cities
      </p>

      {/* Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Edit City: {selectedCity?.name}
            </DialogTitle>
            <DialogDescription>
              Update city details and homepage visibility
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="e.g., Premier marina destination"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_featured">Show on Homepage</Label>
                <p className="text-xs text-muted-foreground">Display in "Explore by City" section</p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveCityMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
