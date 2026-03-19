import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  Filter,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { 
  useAdminBlogPosts, 
  useDeleteBlogPost,
  useUpdateBlogPost,
  blogCategoryLabels,
  type BlogPostWithAuthor,
  type BlogCategory
} from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminBlog() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: posts = [], isLoading } = useAdminBlogPosts();
  const deletePost = useDeleteBlogPost();
  const updatePost = useUpdateBlogPost();

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.author?.full_name || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, search, categoryFilter, statusFilter]);

  const handleDelete = (id: string) => {
    deletePost.mutate(id, {
      onSuccess: () => setSelectedIds(selectedIds.filter((s) => s !== id))
    });
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one post");
      return;
    }
    
    if (action === "Deleted") {
      for (const id of selectedIds) {
        await deletePost.mutateAsync(id);
      }
    } else if (action === "Published") {
      for (const id of selectedIds) {
        await updatePost.mutateAsync({ 
          id, 
          updates: { status: 'published', published_at: new Date().toISOString() } 
        });
      }
    } else if (action === "Unpublished") {
      for (const id of selectedIds) {
        await updatePost.mutateAsync({ id, updates: { status: 'draft' } });
      }
    }
    
    toast.success(`${action} applied to ${selectedIds.length} posts`);
    setSelectedIds([]);
  };

  const columns: Column<BlogPostWithAuthor>[] = [
    {
      key: "title",
      label: "Post",
      render: (post) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img
              src={post.featured_image || '/placeholder.svg'}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{post.title}</p>
            <p className="text-xs text-muted-foreground">by {post.author?.full_name || 'Unknown'}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (post) => (
        <span className="text-sm text-muted-foreground">
          {blogCategoryLabels[post.category]}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (post) => (
        <StatusBadge
          status={post.status === "published" ? "published" : post.status === "scheduled" ? "pending_review" : "draft"}
        />
      ),
    },
    {
      key: "stats",
      label: "Engagement",
      render: (post) => (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.views.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "published_at",
      label: "Date",
      render: (post) => (
        <div className="text-sm">
          {post.status === "published" && post.published_at ? (
            <span className="text-muted-foreground">
              {format(new Date(post.published_at), "MMM d, yyyy")}
            </span>
          ) : post.status === "scheduled" && post.scheduled_at ? (
            <span className="flex items-center gap-1 text-amber-400">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(post.scheduled_at), "MMM d, yyyy")}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Draft
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-12",
      render: (post) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/blog/${post.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(post.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const categoryOptions = Object.entries(blogCategoryLabels).map(([value, label]) => ({
    value,
    label,
  }));

  // Stats calculations
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage articles, drafts, and scheduled publications
          </p>
        </div>
        <Button onClick={() => router.push("/admin/blog/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-sm">Total Posts</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{posts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Eye className="h-4 w-4" />
            <span className="text-sm">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">Comments</span>
          </div>
          <p className="text-2xl font-bold text-foreground">—</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {scheduledCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Bulk Actions ({selectedIds.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction("Published")}>
                Publish Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("Unpublished")}>
                Unpublish Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleBulkAction("Deleted")}
              >
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPosts}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="No blog posts found"
        />
      )}
    </div>
  );
}