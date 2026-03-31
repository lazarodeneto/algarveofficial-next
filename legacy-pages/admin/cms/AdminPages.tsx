import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  MoreVertical,
  Save,
  Globe,
  FileEdit,
  ExternalLink,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { SeoFieldsPanel } from "@/components/admin/seo/SeoFieldsPanel";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

type AdminPageKind = "custom" | "system" | "redirect";

interface SystemPageDefinition {
  id: string;
  title: string;
  path: string;
  description: string;
  kind?: Exclude<AdminPageKind, "custom">;
  dynamic?: boolean;
  editorPath?: string;
  editorPageId?: string;
}

interface AdminPageListItem {
  id: string;
  title: string;
  path: string;
  description: string;
  kind: AdminPageKind;
  dynamic: boolean;
  editorPath?: string;
  is_published: boolean | null;
  updated_at: string | null;
  customPage?: PageContent;
}

const SYSTEM_PAGE_DEFINITIONS: SystemPageDefinition[] = [
  { id: "home", title: "Home", path: "/", description: "Main landing page", editorPageId: "home" },
  { id: "live", title: "Live", path: "/live", description: "Relocation and living guide", editorPageId: "live" },
  { id: "visit", title: "Visit (City Hubs)", path: "/visit", description: "Visit index showing all city hubs", editorPageId: "visit" },
  { id: "stay", title: "Stay", path: "/stay", description: "Places to stay across the Algarve", editorPageId: "stay" },
  { id: "experiences", title: "Experiences", path: "/experiences", description: "Curated experiences and activities", editorPageId: "experiences" },
  { id: "destinations", title: "Destinations", path: "/destinations", description: "Destinations overview", editorPageId: "destinations" },
  { id: "destination-detail", title: "Destination Detail", path: "/destinations/:slug", description: "Dynamic destination detail template", dynamic: true, editorPageId: "destination-detail" },
  { id: "city-detail", title: "City Detail", path: "/city/:slug", description: "Dynamic city detail template", dynamic: true, editorPageId: "city-detail" },
  { id: "directory", title: "Directory", path: "/directory", description: "Listings directory", editorPageId: "directory" },
  { id: "listing-detail", title: "Listing Detail", path: "/listing/:id", description: "Dynamic listing detail template", dynamic: true, editorPageId: "listing-detail" },
  { id: "map", title: "Map Explorer", path: "/map", description: "Map-based listings explorer", editorPageId: "map" },
  { id: "blog", title: "Blog", path: "/blog", description: "Editorial blog listing page", editorPageId: "blog" },
  { id: "blog-post", title: "Blog Post", path: "/blog/:slug", description: "Dynamic blog post template", dynamic: true, editorPageId: "blog-post" },
  { id: "events", title: "Events", path: "/events", description: "Events directory page", editorPageId: "events" },
  { id: "event-detail", title: "Event Detail", path: "/events/:slug", description: "Dynamic event detail template", dynamic: true, editorPageId: "event-detail" },
  { id: "partner", title: "Partner", path: "/partner", description: "Partner program landing page", editorPageId: "partner" },
  { id: "contact", title: "Contact", path: "/contact", description: "Contact and lead form page", editorPageId: "contact" },
  { id: "trips", title: "Trips", path: "/trips", description: "Trip planner page", editorPageId: "trips" },
  { id: "invest", title: "Invest", path: "/invest", description: "Investment intelligence page", editorPageId: "invest" },
  { id: "properties", title: "Properties", path: "/properties", description: "Property investment and market insights", editorPageId: "properties" },
  { id: "about-us", title: "About Us", path: "/about-us", description: "Company overview page", editorPageId: "about" },
  { id: "privacy", title: "Privacy Policy", path: "/privacy-policy", description: "Privacy policy page", editorPageId: "privacy-policy" },
  { id: "terms", title: "Terms of Service", path: "/terms", description: "Terms and conditions page", editorPageId: "terms" },
  { id: "cookies", title: "Cookie Policy", path: "/cookie-policy", description: "Cookie policy page", editorPageId: "cookie-policy" },
  { id: "login", title: "Login", path: "/login", description: "Authentication login page", editorPageId: "auth-login" },
  { id: "signup", title: "Sign Up", path: "/signup", description: "Authentication registration page", editorPageId: "auth-signup" },
  { id: "forgot-password", title: "Forgot Password", path: "/forgot-password", description: "Password recovery page", editorPageId: "auth-forgot-password" },
  { id: "reset-password", title: "Reset Password", path: "/auth/reset-password", description: "Password reset page", editorPageId: "auth-reset-password" },
  { id: "auth-callback", title: "Auth Callback", path: "/auth/callback", description: "OAuth callback route", editorPageId: "auth-callback" },
  { id: "snake", title: "Snake", path: "/snake", description: "Snake mini-game page", editorPageId: "snake" },
  { id: "real-estate", title: "Real Estate", path: "/real-estate", description: "Prime real estate directory page", editorPageId: "real-estate" },
  { id: "legacy-real-estate-detail", title: "Real Estate Detail (Legacy)", path: "/real-estate/:slug", description: "Legacy redirect to listing detail", kind: "redirect", dynamic: true, editorPageId: "listing-detail" },
  { id: "legacy-about", title: "About (Legacy)", path: "/about", description: "Legacy redirect to /about-us", kind: "redirect", editorPageId: "about" },
];

export default function AdminPages() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch pages from Supabase
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PageContent[];
    },
  });

  // Create page mutation
  const createPage = useMutation({
    mutationFn: async (page: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('pages')
        .insert(page)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success("Page created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create page: " + (error as Error).message);
    },
  });

  // Update page mutation
  const updatePage = useMutation({
    mutationFn: async ({ id, ...page }: Partial<PageContent> & { id: string }) => {
      const { error } = await supabase
        .from('pages')
        .update({ ...page, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success("Page updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update page: " + (error as Error).message);
    },
  });

  // Delete page mutation
  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      toast.success("Page deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete page: " + (error as Error).message);
    },
  });

  const customPageItems = useMemo<AdminPageListItem[]>(
    () =>
      pages.map((page) => ({
        id: page.id,
        title: page.title,
        path: `/${page.slug}`,
        description: page.meta_description || "Custom editorial page",
        kind: "custom",
        dynamic: false,
        is_published: page.is_published,
        updated_at: page.updated_at,
        customPage: page,
      })),
    [pages],
  );

  const systemPageItems = useMemo<AdminPageListItem[]>(
    () =>
      SYSTEM_PAGE_DEFINITIONS.map((page) => ({
        id: `system-${page.id}`,
        title: page.title,
        path: page.path,
        description: page.description,
        kind: page.kind ?? "system",
        dynamic: Boolean(page.dynamic),
        editorPath:
          page.editorPath ??
          (page.editorPageId
            ? `/admin/content/page-builder?page=${encodeURIComponent(page.editorPageId)}`
            : undefined),
        is_published: null,
        updated_at: null,
      })),
    [],
  );

  const allPages = useMemo<AdminPageListItem[]>(
    () =>
      [...customPageItems, ...systemPageItems].sort((a, b) => {
        if (a.kind !== b.kind) {
          if (a.kind === "custom") return -1;
          if (b.kind === "custom") return 1;
        }
        return a.path.localeCompare(b.path);
      }),
    [customPageItems, systemPageItems],
  );

  const filteredPages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return allPages;

    return allPages.filter((page) =>
      [
        page.title,
        page.path,
        page.description,
        page.kind,
        page.dynamic ? "dynamic" : "static",
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [allPages, searchQuery]);

  const handleCreatePage = () => {
    const newPage: PageContent = {
      id: '',
      title: 'New Page',
      slug: 'new-page',
      meta_title: 'New Page | AlgarveOfficial',
      meta_description: '',
      content: '# New Page\n\nStart writing your content here...',
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingPage(newPage);
    setIsDialogOpen(true);
  };

  const handleEditPage = (page: PageContent) => {
    setEditingPage({ ...page });
    setIsDialogOpen(true);
  };

  const handleSavePage = async (publish: boolean = true) => {
    if (!editingPage) return;
    
    const isNew = !pages.find(p => p.id === editingPage.id);
    const pageData = {
      title: editingPage.title,
      slug: editingPage.slug,
      content: editingPage.content,
      meta_title: editingPage.meta_title,
      meta_description: editingPage.meta_description,
      is_published: publish ? true : editingPage.is_published,
    };

    if (isNew) {
      createPage.mutate(pageData);
    } else {
      updatePage.mutate({ id: editingPage.id, ...pageData });
    }
  };

  const handleDeletePage = async (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deletePage.mutate(id);
    }
  };

  const togglePageStatus = async (page: PageContent) => {
    updatePage.mutate({ 
      id: page.id, 
      is_published: !page.is_published 
    });
  };

  const isSaving = createPage.isPending || updatePage.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-bold text-foreground mt-2">Pages</h1>
          <p className="text-muted-foreground">Manage static and editorial pages, with all routes searchable in one list</p>
        </div>
        <Button onClick={handleCreatePage}>
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => (
          <Card key={page.id} className="border-border bg-card/50 hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{page.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {page.kind === "custom" && page.customPage ? (
                      <>
                        <DropdownMenuItem onClick={() => handleEditPage(page.customPage!)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(page.path, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePageStatus(page.customPage!)}>
                          {page.customPage.is_published ? (
                            <>
                              <FileEdit className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Globe className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePage(page.customPage!.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        {!page.dynamic && (
                          <DropdownMenuItem onClick={() => window.open(page.path, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Page
                          </DropdownMenuItem>
                        )}
                        {page.editorPath && (
                          <DropdownMenuItem onClick={() => window.open(page.editorPath, '_self')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Open Editor
                          </DropdownMenuItem>
                        )}
                        {page.dynamic && !page.editorPath && (
                          <DropdownMenuItem disabled>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Dynamic template route
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="flex items-center gap-2">
                <span className="text-muted-foreground">{page.path}</span>
                <Badge
                  variant={
                    page.kind === "custom"
                      ? (page.is_published ? "default" : "secondary")
                      : page.kind === "redirect"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {page.kind === "custom"
                    ? (page.is_published ? "published" : "draft")
                    : page.kind === "redirect"
                      ? "redirect"
                      : "system"}
                </Badge>
                {page.dynamic && (
                  <Badge variant="outline" className="text-xs">dynamic</Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {page.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {page.updated_at
                  ? `Updated ${format(new Date(page.updated_at), 'MMM d, yyyy')}`
                  : page.kind === "redirect"
                    ? "Built-in redirect route"
                    : page.dynamic
                      ? "Built-in dynamic route template"
                      : "Built-in system route"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery.trim() ? "No pages match your search" : "No pages found"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery.trim() ? "Try another keyword or clear the search." : "Create your first page to get started"}
          </p>
          <Button onClick={handleCreatePage}>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage && pages.find(p => p.id === editingPage.id) ? 'Edit Page' : 'Create Page'}
            </DialogTitle>
            <DialogDescription>
              Manage page content, SEO settings, and publication status
            </DialogDescription>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground text-sm mr-1">/</span>
                    <Input
                      id="slug"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="border-t border-border pt-4">
                <SeoFieldsPanel
                  data={{
                    meta_title: editingPage.meta_title || '',
                    meta_description: editingPage.meta_description || '',
                  }}
                  onChange={(seoData) => setEditingPage({
                    ...editingPage,
                    meta_title: seoData.meta_title || '',
                    meta_description: seoData.meta_description || '',
                  })}
                  pageName={editingPage.title}
                  pageSlug={editingPage.slug}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Page Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={editingPage.content || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  className="bg-background font-mono text-sm"
                  rows={12}
                  placeholder="Write your content using Markdown..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSavePage(false)}
              disabled={isSaving}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button onClick={() => handleSavePage(true)} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Save & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
