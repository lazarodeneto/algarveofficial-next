import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Search,
  Mountain,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Save,
  GripVertical,
  Loader2,
  Upload,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SeoFieldsPanel } from "@/components/admin/seo/SeoFieldsPanel";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Tables } from "@/integrations/supabase/types";
import { convertToWebP } from "@/lib/imageUtils";

type Region = Tables<"regions">;

interface SortableRegionItemProps {
  region: Region;
  onToggle: (region: Region) => void;
  onEdit: (region: Region) => void;
  onDelete: (id: string) => void;
}

function SortableRegionItem({ region, onToggle, onEdit, onDelete }: SortableRegionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: region.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border bg-card/50 transition-colors",
        !region.is_active && "opacity-60",
        isDragging && "z-50 shadow-lg shadow-primary/20 opacity-90"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Thumbnail */}
          <ImageWithFallback
            src={region.image_url ?? undefined}
            alt={region.name}
            containerClassName="w-24 h-16 rounded-lg flex-shrink-0"
            fallbackIconSize={24}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{region.name}</h3>
              <Badge
                variant={region.is_active ? 'default' : 'secondary'}
                className="text-xs"
              >
                {region.is_active ? 'Active' : 'Hidden'}
              </Badge>
              {region.is_featured && (
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {region.short_description || region.description || 'No description'}
            </p>
            <span className="text-xs text-muted-foreground">
              /{region.slug}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={region.is_active}
              onCheckedChange={() => onToggle(region)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(region)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Region
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/destinations/${region.slug}`, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Page
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(region.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCmsRegions() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const invalidateRegionCaches = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-regions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-destinations-regions'] });
    queryClient.invalidateQueries({ queryKey: ['regions'] });
    queryClient.invalidateQueries({ queryKey: ['regions', 'featured'] });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch regions from Supabase
  const { data: regions = [], isLoading } = useQuery({
    queryKey: ['admin-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Region[];
    },
  });

  // Update region mutation
  const updateMutation = useMutation({
    mutationFn: async (region: Partial<Region> & { id: string }) => {
      const { id, ...updatePayload } = region;
      const { error } = await supabase
        .from('regions')
        .update(updatePayload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRegionCaches();
    },
  });

  // Create region mutation
  const createMutation = useMutation({
    mutationFn: async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('regions')
        .insert(region);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRegionCaches();
      toast.success("Region created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create region: " + error.message);
    },
  });

  // Delete region mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRegionCaches();
      toast.success("Region deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete region: " + error.message);
    },
  });

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRegions = [...filteredRegions].sort((a, b) => a.display_order - b.display_order);

  const handleCreateRegion = () => {
    const newRegion: Region = {
      id: '',
      name: 'New Region',
      slug: 'new-region',
      description: '',
      short_description: '',
      image_url: '',
      hero_image_url: '',
      meta_title: '',
      meta_description: '',
      display_order: regions.length + 1,
      is_active: true,
      is_featured: false,
      is_visible_destinations: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingRegion(newRegion);
    setIsDialogOpen(true);
  };

  const handleEditRegion = (region: Region) => {
    setEditingRegion({ ...region });
    setIsDialogOpen(true);
  };

  const handleSaveRegion = async () => {
    if (!editingRegion) return;

    const isNew = !editingRegion.id || !regions.find(r => r.id === editingRegion.id);

    if (isNew) {
      const { id, created_at, updated_at, ...newRegion } = editingRegion;
      createMutation.mutate(newRegion);
    } else {
      updateMutation.mutate(editingRegion, {
        onSuccess: () => {
          toast.success("Region updated successfully");
        },
        onError: (error) => {
          toast.error("Failed to update region: " + error.message);
        },
      });
    }

    setIsDialogOpen(false);
  };

  const handleDeleteRegion = async (id: string) => {
    if (confirm("Are you sure you want to delete this region?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleRegionEnabled = (region: Region) => {
    updateMutation.mutate({ id: region.id, is_active: !region.is_active }, {
      onSuccess: () => {
        toast.success(`Region ${region.is_active ? 'hidden' : 'activated'}`);
      },
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedRegions.findIndex((item) => item.id === active.id);
      const newIndex = sortedRegions.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(sortedRegions, oldIndex, newIndex);

      // Update display_order for all affected items
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].display_order !== i + 1) {
          await supabase
            .from('regions')
            .update({ display_order: i + 1 })
            .eq('id', newItems[i].id);
        }
      }

      invalidateRegionCaches();
      toast.success("Region order updated");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Premium Regions</h1>
          <p className="text-muted-foreground">Drag to reorder, manage editorial regions</p>
        </div>
        <Button onClick={handleCreateRegion}>
          <Plus className="h-4 w-4 mr-2" />
          New Region
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Regions List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedRegions.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sortedRegions.map((region) => (
              <SortableRegionItem
                key={region.id}
                region={region}
                onToggle={toggleRegionEnabled}
                onEdit={handleEditRegion}
                onDelete={handleDeleteRegion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredRegions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Mountain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No regions found</h3>
          <p className="text-muted-foreground mb-4">Create your first premium region</p>
          <Button onClick={handleCreateRegion}>
            <Plus className="h-4 w-4 mr-2" />
            Create Region
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRegion && editingRegion.id && regions.find(r => r.id === editingRegion.id) ? 'Edit Region' : 'Create Region'}
            </DialogTitle>
            <DialogDescription>
              Configure region details, hero image, and SEO settings
            </DialogDescription>
          </DialogHeader>

          {editingRegion && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Region Name</Label>
                  <Input
                    id="name"
                    value={editingRegion.name}
                    onChange={(e) => setEditingRegion({ ...editingRegion, name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={editingRegion.slug}
                    onChange={(e) => setEditingRegion({ ...editingRegion, slug: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={editingRegion.short_description || ''}
                  onChange={(e) => setEditingRegion({ ...editingRegion, short_description: e.target.value })}
                  className="bg-background"
                  placeholder="Brief tagline for cards..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={editingRegion.description || ''}
                  onChange={(e) => setEditingRegion({ ...editingRegion, description: e.target.value })}
                  className="bg-background"
                  rows={4}
                  placeholder="Editorial description of this region..."
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured on Homepage</Label>
                  <p className="text-xs text-muted-foreground">Show this region in the homepage carousel</p>
                </div>
                <Switch
                  checked={editingRegion.is_featured}
                  onCheckedChange={(checked) => setEditingRegion({ ...editingRegion, is_featured: checked })}
                />
              </div>

              {/* Visible on destinations toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible on Destinations</Label>
                  <p className="text-xs text-muted-foreground">Show this region on the destinations page</p>
                </div>
                <Switch
                  checked={editingRegion.is_visible_destinations}
                  onCheckedChange={(checked) => setEditingRegion({ ...editingRegion, is_visible_destinations: checked })}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label>Region Image</Label>
                <div className="flex items-start gap-4">
                  {editingRegion.image_url ? (
                    <div className="relative group">
                      <ImageWithFallback
                        src={editingRegion.image_url ?? undefined}
                        alt="Preview"
                        containerClassName="w-40 h-24 rounded-lg flex-shrink-0"
                        fallbackIconSize={32}
                      />
                      <button
                        onClick={() => setEditingRegion({ ...editingRegion, image_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground flex-shrink-0">
                      <Loader2 className="h-6 w-6 opacity-50" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative overflow-hidden"
                        disabled={updateMutation.isPending || createMutation.isPending}
                      >
                        {(updateMutation.isPending || createMutation.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              // Convert to WebP
                              const convertedFile = await convertToWebP(file);
                              const fileExt = "webp";
                              const fileName = `region-${editingRegion.slug || 'upload'}-${Date.now()}.${fileExt}`;
                              const filePath = `regions/${fileName}`;

                              const { error: uploadError } = await supabase.storage
                                .from('media')
                                .upload(filePath, convertedFile, {
                                  cacheControl: '31536000',
                                  upsert: true,
                                });

                              if (uploadError) throw uploadError;

                              const { data: { publicUrl } } = supabase.storage
                                .from('media')
                                .getPublicUrl(filePath);

                              setEditingRegion({ ...editingRegion, image_url: publicUrl });
                              toast.success("Image uploaded successfully");
                            } catch (error: any) {
                              toast.error(`Upload failed: ${error.message}`);
                            }
                          }}
                        />
                      </Button>
                      <Input
                        value={editingRegion.image_url || ''}
                        onChange={(e) => setEditingRegion({ ...editingRegion, image_url: e.target.value })}
                        className="bg-background flex-1"
                        placeholder="https://..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 800x600px. Uploads are auto-converted to WebP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero Image URL */}
              <div className="space-y-2">
                <Label>Hero Image (full-width banner)</Label>
                <div className="flex items-start gap-4">
                  {editingRegion.hero_image_url ? (
                    <div className="relative group">
                      <ImageWithFallback
                        src={editingRegion.hero_image_url ?? undefined}
                        alt="Hero preview"
                        containerClassName="w-40 h-24 rounded-lg flex-shrink-0"
                        fallbackIconSize={32}
                      />
                      <button
                        onClick={() => setEditingRegion({ ...editingRegion, hero_image_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground flex-shrink-0">
                      <Mountain className="h-6 w-6 opacity-50" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative overflow-hidden"
                        disabled={updateMutation.isPending || createMutation.isPending}
                      >
                        {(updateMutation.isPending || createMutation.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Hero
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              const convertedFile = await convertToWebP(file);
                              const fileExt = "webp";
                              const fileName = `region-hero-${editingRegion.slug || 'upload'}-${Date.now()}.${fileExt}`;
                              const filePath = `regions/${fileName}`;

                              const { error: uploadError } = await supabase.storage
                                .from('media')
                                .upload(filePath, convertedFile, {
                                  cacheControl: '31536000',
                                  upsert: true,
                                });

                              if (uploadError) throw uploadError;

                              const { data: { publicUrl } } = supabase.storage
                                .from('media')
                                .getPublicUrl(filePath);

                              setEditingRegion({ ...editingRegion, hero_image_url: publicUrl });
                              toast.success("Hero image uploaded successfully");
                            } catch (error: any) {
                              toast.error(`Upload failed: ${error.message}`);
                            }
                          }}
                        />
                      </Button>
                      <Input
                        value={editingRegion.hero_image_url || ''}
                        onChange={(e) => setEditingRegion({ ...editingRegion, hero_image_url: e.target.value })}
                        className="bg-background flex-1"
                        placeholder="https://..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Full-width hero banner. Recommended: 1920x600px.
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="border-t border-border pt-4">
                <SeoFieldsPanel
                  data={{
                    meta_title: editingRegion.meta_title,
                    meta_description: editingRegion.meta_description,
                  }}
                  onChange={(seoData) => setEditingRegion({
                    ...editingRegion,
                    meta_title: seoData.meta_title || '',
                    meta_description: seoData.meta_description || '',
                  })}
                  pageName={editingRegion.name}
                  pageSlug={`destinations/${editingRegion.slug}`}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRegion}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              Save Region
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
