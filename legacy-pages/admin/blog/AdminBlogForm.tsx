import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Send,
  Image as ImageIcon,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { SeoFieldsPanel } from "@/components/admin/seo/SeoFieldsPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  useAdminBlogPost, 
  useCreateBlogPost, 
  useUpdateBlogPost,
  blogCategoryLabels,
  type BlogCategory,
  type BlogStatus
} from "@/hooks/useBlogPosts";
import { extractIdParam } from "@/lib/routeParams";
import { useLocalePath } from "@/hooks/useLocalePath";
import { normalizeSlug, slugifyEntityName } from "@/lib/slugify";
import { getSafeCmsImageSrc } from "@/lib/cms/image-source";
import { convertToWebP, trimWhiteBorders } from "@/lib/imageUtils";

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: BlogCategory;
  tags: string[];
  reading_time: number;
  seo_title: string;
  seo_description: string;
}

const defaultFormData: FormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  category: "lifestyle",
  tags: [],
  reading_time: 5,
  seo_title: "",
  seo_description: "",
};

const BLOG_FEATURED_IMAGE_BUCKET = "media";
const BLOG_FEATURED_IMAGE_FOLDER = "blog/featured";
const MAX_FEATURED_IMAGE_BYTES = 8 * 1024 * 1024;
const FEATURED_IMAGE_MIME_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function slugifyUploadName(fileName: string) {
  const baseName = fileName.replace(/\.[a-z0-9]+$/i, "").trim() || "featured-image";

  return (
    baseName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "featured-image"
  );
}

function buildFeaturedImageStoragePath(file: File, postSlug: string) {
  const postSegment =
    postSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "draft";
  const extension =
    file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ||
    file.type.split("/").pop()?.replace("jpeg", "jpg") ||
    "webp";

  return `${BLOG_FEATURED_IMAGE_FOLDER}/${postSegment}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}-${slugifyUploadName(file.name)}.${extension}`;
}

export default function AdminBlogForm() {
  const router = useRouter();
  const l = useLocalePath();
  const params = useParams<Record<string, string | string[] | undefined>>();
  const id = extractIdParam(params);
  const { user } = useAuth();
  const isEditing = Boolean(id) && id !== 'new';

  const { data: existingPost, isLoading: isLoadingPost } = useAdminBlogPost(isEditing ? id : undefined);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFeaturedImage, setIsUploadingFeaturedImage] = useState(false);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt || '',
        content: existingPost.content || '',
        featured_image: existingPost.featured_image || '',
        category: existingPost.category,
        tags: existingPost.tags || [],
        reading_time: existingPost.reading_time || 5,
        seo_title: existingPost.seo_title || '',
        seo_description: existingPost.seo_description || '',
      });
    }
  }, [existingPost]);

  const handleChange = (
    field: keyof FormData,
    value: string | string[] | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === "title" && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        slug: slugifyEntityName(value as string, { entityType: "content" }),
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange("tags", [...formData.tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange(
      "tags",
      formData.tags.filter((t) => t !== tag)
    );
  };

  const openFeaturedImagePicker = () => {
    if (isSaving || isUploadingFeaturedImage) return;
    featuredImageInputRef.current?.click();
  };

  const handleFeaturedImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!FEATURED_IMAGE_MIME_TYPES.has(file.type)) {
      toast.error("Featured image must be AVIF, JPEG, PNG, or WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FEATURED_IMAGE_BYTES) {
      toast.error("Featured image must be 8MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsUploadingFeaturedImage(true);

    try {
      const preparedFile =
        file.type === "image/webp"
          ? file
          : await convertToWebP(await trimWhiteBorders(file), 0.85);
      const storagePath = buildFeaturedImageStoragePath(preparedFile, formData.slug);

      const { error: uploadError } = await supabase.storage
        .from(BLOG_FEATURED_IMAGE_BUCKET)
        .upload(storagePath, preparedFile, {
          cacheControl: "31536000",
          contentType: preparedFile.type || "image/webp",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BLOG_FEATURED_IMAGE_BUCKET)
        .getPublicUrl(storagePath);
      const publicUrl =
        getSafeCmsImageSrc(urlData.publicUrl, { bucket: BLOG_FEATURED_IMAGE_BUCKET }) ??
        urlData.publicUrl;

      handleChange("featured_image", publicUrl);
      toast.success("Featured image uploaded successfully");
    } catch {
      toast.error("Failed to upload featured image");
    } finally {
      setIsUploadingFeaturedImage(false);
      event.target.value = "";
    }
  };

  const handleSave = async (status: BlogStatus) => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsSaving(true);

    try {
      // When publishing, always set published_at to now if not already set
      let published_at = null;
      if (status === 'published') {
        published_at = new Date().toISOString();
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        featured_image: formData.featured_image || null,
        category: formData.category,
        tags: formData.tags,
        reading_time: formData.reading_time,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        status,
        published_at,
      };

      if (isEditing && id) {
        await updatePost.mutateAsync({ id, updates: postData });
      } else {
        await createPost.mutateAsync({
          ...postData,
          author_id: user.id,
        });
      }

      router.push(l("/admin/blog"));
    } catch {
      // Error is handled by the mutation
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = Object.entries(blogCategoryLabels).map(
    ([value, label]) => ({
      value: value as BlogCategory,
      label,
    })
  );

  if (isEditing && isLoadingPost) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(l("/admin/blog"))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {isEditing ? "Edit Post" : "New Post"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Update your blog post content and settings"
                : "Create a new blog article"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing && formData.slug) {
                window.open(`/blog/${formData.slug}`, '_blank', 'noopener,noreferrer');
              } else if (formData.slug) {
                toast.info("Save the post first to preview");
              } else {
                toast.info("Enter a title to generate a preview URL");
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter post title..."
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/blog/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", normalizeSlug(e.target.value, { entityType: "content" }))}
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                placeholder="Brief summary of the post..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Write your blog post content in Markdown..."
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Supports Markdown formatting
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground">Publish</h3>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSave("draft")}
                variant="gold"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave("scheduled")}
                variant="outline"
                disabled={isSaving}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button
                onClick={() => handleSave("published")}
                disabled={isSaving}
              >
                <Send className="h-4 w-4 mr-2" />
                Publish Now
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground">Featured Image</h3>
            <Separator />
            <Input
              ref={featuredImageInputRef}
              type="file"
              accept="image/avif,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFeaturedImageUpload}
              disabled={isSaving || isUploadingFeaturedImage}
              aria-label="Upload featured image"
            />
            {formData.featured_image ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleChange("featured_image", "")}
                    disabled={isUploadingFeaturedImage}
                    aria-label="Remove featured image"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={openFeaturedImagePicker}
                  disabled={isSaving || isUploadingFeaturedImage}
                >
                  {isUploadingFeaturedImage ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4 mr-2" />
                  )}
                  {isUploadingFeaturedImage ? "Uploading..." : "Change image"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/70 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                onClick={openFeaturedImagePicker}
                disabled={isSaving || isUploadingFeaturedImage}
              >
                {isUploadingFeaturedImage ? (
                  <Loader2 className="h-8 w-8 mx-auto text-muted-foreground mb-2 animate-spin" />
                ) : (
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground">
                  {isUploadingFeaturedImage ? "Uploading image..." : "Click to upload image"}
                </p>
              </button>
            )}
            <Input
              placeholder="Or paste image URL..."
              value={formData.featured_image}
              onChange={(e) => handleChange("featured_image", e.target.value)}
              disabled={isUploadingFeaturedImage}
            />
          </div>

          {/* Category & Tags */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground">Organization</h3>
            <Separator />
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  handleChange("category", value as BlogCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Reading Time (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={formData.reading_time}
                onChange={(e) =>
                  handleChange("reading_time", parseInt(e.target.value) || 5)
                }
              />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground">SEO Settings</h3>
            <Separator />
            <SeoFieldsPanel
              data={{
                meta_title: formData.seo_title,
                meta_description: formData.seo_description,
              }}
              onChange={(seoData) => {
                handleChange("seo_title", seoData.meta_title || '');
                handleChange("seo_description", seoData.meta_description || '');
              }}
              pageName={formData.title || "Blog Post"}
              pageSlug={`blog/${formData.slug}`}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
