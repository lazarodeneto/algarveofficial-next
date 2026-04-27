import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tags, Plus, Search, Edit, Trash2, MoreHorizontal, Loader2, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { callAdminTaxonomyApi } from "@/lib/admin/taxonomy-client";
import { SingleImageUploadField } from "@/components/admin/listings/SingleImageUploadField";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import Image from "next/image";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { canUseNextImage } from "@/lib/nextImageSafety";
import { getCategoryFallbackImageUrl } from "@/lib/fallback-images";

type Category = Tables<"categories">;

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    is_active: true,
    is_featured: false,
    image_url: "",
  });

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Category>) => {
      if (selectedCategory) {
        await callAdminTaxonomyApi("categories", "PATCH", {
          id: selectedCategory.id,
          ...data,
        });
      } else {
        await callAdminTaxonomyApi("categories", "POST", {
          ...data,
          display_order: categories.length,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(selectedCategory ? "Category updated" : "Category created");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await callAdminTaxonomyApi("categories", "DELETE", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success("Category deleted");
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      short_description: category.short_description || "",
      is_active: category.is_active,
      is_featured: category.is_featured,
      image_url: (category as any).image_url || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  const handleFallbackUpload = async (file: File, categoryId: string) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploadingFor(categoryId);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoryId", categoryId);

      const response = await fetch("/api/admin/upload-category-fallback", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setUploadSuccess(categoryId);
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        toast.success("Fallback image updated");
        setTimeout(() => setUploadSuccess(null), 2000);
      } else {
        console.error("[admin:http]", JSON.stringify({ status: response.status, url: "/api/admin/upload-category-fallback" }));
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploadingFor(null);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setFormData({ name: "", slug: "", description: "", short_description: "", is_active: true, is_featured: false, image_url: "" });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

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
            Categories
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage service and product categories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {selectedCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                Categories define the types of services and products in the CMS.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="e.g., Fine Dining"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., fine-dining"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief tagline..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <SingleImageUploadField
                  value={formData.image_url}
                  onChange={(value) => setFormData({ ...formData, image_url: value || "" })}
                  folder="categories"
                  disabled={saveMutation.isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured on Homepage</Label>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name || !formData.slug || saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : selectedCategory ? "Save Changes" : "Add Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredCategories.map((category) => {
          const uploadedFallbackImageUrl = normalizePublicImageUrl(category.fallback_image_url);
          const defaultFallbackImageUrl = normalizePublicImageUrl(getCategoryFallbackImageUrl(category.slug));
          const previewImageUrl = uploadedFallbackImageUrl ?? defaultFallbackImageUrl;
          const canRenderWithNextImage = canUseNextImage(previewImageUrl);
          const hasCustomFallbackImage = Boolean(uploadedFallbackImageUrl);

          return (
            <Card key={category.id} className="bg-card border-border hover:border-primary/30 transition-colors overflow-hidden">
              <CardContent className="p-3">
                {/* Fallback Image */}
                <div className="mb-2.5">
                  {previewImageUrl ? (
                    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-muted">
                      {canRenderWithNextImage ? (
                        <Image
                          src={previewImageUrl}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <img
                          src={previewImageUrl}
                          alt={category.name}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {uploadSuccess === category.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Check className="h-6 w-6 text-green-500" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/10] rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      No fallback image
                    </div>
                  )}
                  <label className={`mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors ${uploadingFor === category.id ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingFor === category.id ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                    ) : (
                      <>
                        <Upload className="h-3 w-3" />
                        {(hasCustomFallbackImage ? 'Replace' : 'Upload')} fallback image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingFor !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFallbackUpload(file, category.id);
                          }}
                        />
                      </>
                    )}
                  </label>
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tags className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground text-[1.05rem] leading-tight">{category.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {category.short_description || category.description || 'No description'}
                </p>
                <div className="flex gap-2">
                  {!category.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {category.is_featured && (
                    <Badge className="bg-primary/20 text-primary border-primary/30">Featured</Badge>
                  )}
                </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredCategories.length} of {categories.length} categories
      </p>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete "${selectedCategory?.name}"? This may affect listings using this category.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
