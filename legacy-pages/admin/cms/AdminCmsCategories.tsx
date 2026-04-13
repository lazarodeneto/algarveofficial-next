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
  Tags, 
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
import { getCategoryIconComponent } from "@/lib/categoryIcons";
import { callAdminTaxonomyApi } from "@/lib/admin/taxonomy-client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type CategoryRow = Tables<"categories">;
type CategoryFormState = Partial<CategoryRow> & { id?: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function AdminCmsCategories() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryFormState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("edit");

  const invalidateCategoryCaches = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories", "featured"] });
  };

  // Fetch all categories from Supabase
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as CategoryRow[];
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      await callAdminTaxonomyApi("categories", "PATCH", { id, is_featured });
    },
    onSuccess: () => {
      invalidateCategoryCaches();
      toast.success("Homepage visibility updated");
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await callAdminTaxonomyApi("categories", "PATCH", { id, is_active });
    },
    onSuccess: () => {
      invalidateCategoryCaches();
      toast.success("Category status updated");
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  // Save category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (category: Partial<CategoryRow> & { id: string }) => {
      await callAdminTaxonomyApi("categories", "PATCH", {
        id: category.id,
        name: category.name,
        slug: category.slug,
        short_description: category.short_description,
        description: category.description,
        image_url: category.image_url,
        icon: category.icon,
        meta_title: category.meta_title,
        meta_description: category.meta_description,
      });
    },
    onSuccess: () => {
      invalidateCategoryCaches();
      setIsDialogOpen(false);
      toast.success("Category updated successfully");
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (category: CategoryFormState) => {
      const maxOrder = categories.reduce((acc, item) => Math.max(acc, item.display_order ?? 0), 0);
      const payload: TablesInsert<"categories"> = {
        name: (category.name || "").trim(),
        slug: slugify(category.slug || category.name || ""),
        short_description: category.short_description || null,
        description: category.description || null,
        image_url: category.image_url || null,
        icon: category.icon || null,
        meta_title: category.meta_title || null,
        meta_description: category.meta_description || null,
        is_active: category.is_active ?? true,
        is_featured: category.is_featured ?? false,
        display_order: maxOrder + 1,
      };

      await callAdminTaxonomyApi("categories", "POST", payload as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      invalidateCategoryCaches();
      setIsDialogOpen(false);
      toast.success("Category created successfully");
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await callAdminTaxonomyApi("categories", "DELETE", { id });
    },
    onSuccess: () => {
      invalidateCategoryCaches();
      toast.success("Category deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await callAdminTaxonomyApi("categories", "PUT", { orderedIds });
    },
    onSuccess: () => {
      invalidateCategoryCaches();
      toast.success("Category order updated");
    },
    onError: () => {
      toast.error("Failed to reorder categories");
    },
  });

  const sortedCategories = [...categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const filteredCategories = sortedCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCount = categories.filter(c => c.is_featured).length;

  const handleEditCategory = (category: CategoryRow) => {
    setDialogMode("edit");
    setEditingCategory({ ...category });
    setIsDialogOpen(true);
  };

  const handleAddCategory = () => {
    setDialogMode("create");
    setEditingCategory({
      name: "",
      slug: "",
      icon: "",
      short_description: "",
      description: "",
      image_url: "",
      meta_title: "",
      meta_description: "",
      is_active: true,
      is_featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;
    if (!(editingCategory.name || "").trim()) {
      toast.error("Category name is required");
      return;
    }
    if (dialogMode === "create") {
      createCategoryMutation.mutate(editingCategory);
      return;
    }
    if (!editingCategory.id) {
      toast.error("Missing category ID");
      return;
    }
    saveCategoryMutation.mutate(editingCategory as Partial<CategoryRow> & { id: string });
  };

  const handleMoveCategory = (categoryId: string, direction: "up" | "down") => {
    const currentIndex = sortedCategories.findIndex((item) => item.id === categoryId);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedCategories.length) return;

    const reordered = [...sortedCategories];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    reorderCategoriesMutation.mutate(reordered.map((item) => item.id));
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
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Categories</h1>
          <p className="text-muted-foreground">
            Manage service categories • {featuredCount} featured on homepage
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Home className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Toggle <Star className="h-3.5 w-3.5 inline mx-1 text-primary" /> to display categories on the homepage. Only featured categories appear in the "Explore Categories" section.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.map((category) => {
          const IconComponent = getCategoryIconComponent(category.icon ?? undefined);

          return (
            <Card 
              key={category.id} 
              className={`border-border bg-card/50 overflow-hidden transition-all hover:border-primary/30 ${!category.is_active && 'opacity-50'}`}
            >
            {/* Thumbnail */}
            <div className="aspect-video relative">
              <ImageWithFallback
                src={category.image_url ?? undefined}
                alt={category.name}
                containerClassName="w-full h-full"
                fallbackIconSize={40}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge 
                  variant={category.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {category.is_active ? 'Active' : 'Hidden'}
                </Badge>
              </div>
              {category.is_featured && (
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
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </span>
                    <h3 className="font-medium text-foreground truncate">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {category.short_description || 'No description'}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/stay?category=${category.slug}`, '_blank')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Listings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleMoveCategory(category.id, "up")}
                      disabled={sortedCategories.findIndex((item) => item.id === category.id) === 0 || reorderCategoriesMutation.isPending}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleMoveCategory(category.id, "down")}
                      disabled={sortedCategories.findIndex((item) => item.id === category.id) === sortedCategories.length - 1 || reorderCategoriesMutation.isPending}
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => toggleActiveMutation.mutate({ id: category.id, is_active: !category.is_active })}
                    >
                      {category.is_active ? 'Hide Category' : 'Show Category'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        if (window.confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
                          deleteCategoryMutation.mutate(category.id);
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
                  <Star className={`h-4 w-4 ${category.is_featured ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">Homepage</span>
                </div>
                <Switch
                  checked={category.is_featured}
                  onCheckedChange={(checked) => 
                    toggleFeaturedMutation.mutate({ id: category.id, is_featured: checked })
                  }
                />
              </div>
            </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No categories found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Add a new category with content and SEO fields"
                : "Update category details, images, and SEO settings"}
            </DialogDescription>
          </DialogHeader>

          {editingCategory && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide Icon Name)</Label>
                <Input
                  id="icon"
                  value={editingCategory.icon ?? ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  className="bg-background"
                  placeholder="House, Hotel, UtensilsCrossed..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={editingCategory.short_description ?? ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, short_description: e.target.value })}
                  className="bg-background"
                  placeholder="Brief tagline for the category..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={editingCategory.description ?? ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="bg-background"
                  rows={4}
                  placeholder="Editorial description of this category..."
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label>Category Image URL</Label>
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={editingCategory.image_url ?? undefined}
                    alt="Category"
                    containerClassName="w-40 h-24 rounded-lg flex-shrink-0"
                    fallbackIconSize={32}
                  />
                  <div className="flex-1">
                    <Input
                      value={editingCategory.image_url ?? ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                      className="bg-background"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 800x600px
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="border-t border-border pt-4">
                <SeoFieldsPanel
                  data={{
                    meta_title: editingCategory.meta_title,
                    meta_description: editingCategory.meta_description,
                  }}
                  onChange={(seoData) => setEditingCategory({
                    ...editingCategory,
                    meta_title: seoData.meta_title,
                    meta_description: seoData.meta_description,
                  })}
                  pageName={editingCategory.name}
                  pageSlug={`directory?category=${editingCategory.slug}`}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={saveCategoryMutation.isPending || createCategoryMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {(saveCategoryMutation.isPending || createCategoryMutation.isPending)
                ? "Saving..."
                : (dialogMode === "create" ? "Create Category" : "Save Category")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
