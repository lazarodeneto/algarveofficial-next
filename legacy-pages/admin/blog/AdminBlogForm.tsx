import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Send,
  Image,
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
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
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
    } catch (error) {
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
                  onChange={(e) => handleChange("slug", e.target.value)}
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
                variant="outline"
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
            {formData.featured_image ? (
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
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image
                </p>
              </div>
            )}
            <Input
              placeholder="Or paste image URL..."
              value={formData.featured_image}
              onChange={(e) => handleChange("featured_image", e.target.value)}
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
