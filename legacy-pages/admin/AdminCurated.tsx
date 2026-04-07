import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Plus, X, Home, MapPin, Tag, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/admin/TierBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getValidAccessToken } from "@/lib/authToken";

type PageContext = "homepage" | "region" | "category" | "city";

interface CuratedAssignment {
  id: string;
  listingId: string;
  context: PageContext;
  contextId: string | null;
  displayOrder: number;
}

interface SignatureListing {
  id: string;
  name: string;
  city_id: string;
  category_id: string;
  region_id: string | null;
}

async function callAdminCuratedAssignmentsApi(
  method: "POST" | "DELETE",
  payload: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch("/api/admin/curated-assignments", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; error?: { message?: string } }
    | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error?.message || "Failed to update curated assignments.");
  }
}

export default function AdminCurated() {
  const queryClient = useQueryClient();

  // Fetch signature listings from Supabase (tier=signature + published)
  // Note: is_curated is managed via curated_assignments table, not the listing flag
  const { data: signatureListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['admin-signature-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, name, city_id, category_id, region_id')
        .eq('tier', 'signature')
        .eq('status', 'published');
      if (error) throw error;
      return (data || []) as SignatureListing[];
    },
  });

  // Fetch regions
  const { data: regions = [] } = useQuery({
    queryKey: ['admin-curated-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['admin-curated-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-curated-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch curated assignments
  const { data: curatedAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['admin-curated-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curated_assignments')
        .select('id, listing_id, context_type, context_id, display_order')
        .order('display_order');
      if (error) throw error;
      return (data || []).map(a => ({
        id: a.id,
        listingId: a.listing_id,
        context: (a.context_type || 'homepage') as PageContext,
        contextId: a.context_id,
        displayOrder: a.display_order,
      })) as CuratedAssignment[];
    },
  });

  // Add assignment mutation
  const addAssignment = useMutation({
    mutationFn: async ({ listingId, context, contextId }: { listingId: string; context: PageContext; contextId?: string }) => {
      await callAdminCuratedAssignmentsApi("POST", {
        listingId,
        contextType: context,
        contextId: contextId || null,
        displayOrder: curatedAssignments.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-curated-assignments'] });
      // Also invalidate the public curated-assignments query used by the homepage
      queryClient.invalidateQueries({ queryKey: ['curated-assignments'] });
      toast.success("Listing assigned to selected section");
    },
    onError: (error) => {
      toast.error("Failed to assign listing: " + (error as Error).message);
    },
  });

  // Remove assignment mutation
  const removeAssignment = useMutation({
    mutationFn: async ({
      assignmentId,
      listingId,
      context,
      contextId,
    }: {
      assignmentId?: string;
      listingId: string;
      context: PageContext;
      contextId?: string;
    }) => {
      await callAdminCuratedAssignmentsApi("DELETE", {
        assignmentId,
        listingId,
        contextType: context,
        contextId: contextId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-curated-assignments'] });
      // Also invalidate the public curated-assignments query used by the homepage
      queryClient.invalidateQueries({ queryKey: ['curated-assignments'] });
      toast.success("Listing removed from selected section");
    },
    onError: (error) => {
      toast.error("Failed to remove listing: " + (error as Error).message);
    },
  });

  // Get the homepage curated listing (used as fallback)
  const getHomepageListing = () => {
    const homeAssignment = curatedAssignments.find((a) => a.context === "homepage");
    if (homeAssignment) {
      return signatureListings.find((l) => l.id === homeAssignment.listingId);
    }
    return null;
  };

  // Get listings for a specific page context (with fallback to homepage)
  const getListingsForContext = (context: PageContext, contextId?: string) => {
    const contextListings = curatedAssignments
      .filter((a) => a.context === context && (contextId ? a.contextId === contextId : !a.contextId))
      .map((a) => signatureListings.find((l) => l.id === a.listingId))
      .filter(Boolean) as SignatureListing[];
    
    return contextListings;
  };

  // Check if using fallback (no specific assignment, will use homepage)
  const isUsingFallback = (context: PageContext, contextId?: string) => {
    if (context === "homepage") return false;
    const hasSpecificAssignment = curatedAssignments.some(
      (a) => a.context === context && a.contextId === contextId
    );
    return !hasSpecificAssignment && getHomepageListing() !== null;
  };

  // Get available listings (not already assigned to this context)
  const getAvailableListings = (context: PageContext, contextId?: string) => {
    const assignedIds = curatedAssignments
      .filter((a) => a.context === context && (contextId ? a.contextId === contextId : !a.contextId))
      .map((a) => a.listingId);
    
    // Filter by context type
    let contextFilteredListings = signatureListings;
    
    if (context === "city" && contextId) {
      contextFilteredListings = signatureListings.filter((l) => l.city_id === contextId);
    } else if (context === "category" && contextId) {
      contextFilteredListings = signatureListings.filter((l) => l.category_id === contextId);
    } else if (context === "region" && contextId) {
      contextFilteredListings = signatureListings.filter((l) => l.region_id === contextId);
    }
    
    return contextFilteredListings.filter((l) => !assignedIds.includes(l.id));
  };

  const addToContext = (listingId: string, context: PageContext, contextId?: string) => {
    addAssignment.mutate({ listingId, context, contextId });
  };

  const removeFromContext = (listingId: string, context: PageContext, contextId?: string) => {
    const assignmentId = curatedAssignments.find(
      (a) =>
        a.listingId === listingId &&
        a.context === context &&
        (contextId ? a.contextId === contextId : !a.contextId)
    )?.id;

    removeAssignment.mutate({ assignmentId, listingId, context, contextId });
  };

  const ListingTag = ({
    listing,
    context,
    contextId,
  }: {
    listing: SignatureListing;
    context: PageContext;
    contextId?: string;
  }) => {
    const city = cities.find((c) => c.id === listing.city_id);
    return (
      <Badge
        variant="secondary"
        className="bg-primary/10 text-primary border-primary/20 pl-2 pr-1 py-1.5 text-sm font-medium gap-2"
      >
        <Crown className="h-3.5 w-3.5" />
        <span className="truncate max-w-[180px]">{listing.name}</span>
        <span className="text-muted-foreground text-xs">• {city?.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 ml-1 hover:bg-destructive/20 hover:text-destructive rounded-full"
          onClick={() => removeFromContext(listing.id, context, contextId)}
          disabled={removeAssignment.isPending}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    );
  };

  const PageSection = ({
    title,
    icon: Icon,
    context,
    contextId,
    subtitle,
  }: {
    title: string;
    icon: React.ElementType;
    context: PageContext;
    contextId?: string;
    subtitle?: string;
  }) => {
    const listings = getListingsForContext(context, contextId);
    const available = getAvailableListings(context, contextId);
    const usingFallback = isUsingFallback(context, contextId);
    const homepageListing = getHomepageListing();

    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">{title}</CardTitle>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            {listings.length === 0 && usingFallback && (
              <Badge variant="outline" className="text-muted-foreground border-dashed">
                Using Homepage
              </Badge>
            )}
            {listings.length === 0 && !usingFallback && context !== "homepage" && (
              <Badge variant="outline" className="text-muted-foreground">
                Not assigned
              </Badge>
            )}
            {listings.length === 1 && (
              <Badge variant="outline" className="text-primary border-primary/30">
                Assigned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current curated listings */}
          {listings.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listings.map((listing) => (
                <ListingTag
                  key={listing.id}
                  listing={listing}
                  context={context}
                  contextId={contextId}
                />
              ))}
            </div>
          )}

          {/* Show fallback info when using homepage listing */}
          {listings.length === 0 && usingFallback && homepageListing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Fallback:</span>
              <Badge variant="secondary" className="bg-muted/50 text-muted-foreground">
                <Crown className="h-3 w-3 mr-1" />
                {homepageListing.name}
              </Badge>
            </div>
          )}

          {/* Dropdown to add - only show when no listing assigned */}
          {listings.length === 0 && (
            <Select
              onValueChange={(value) => addToContext(value, context, contextId)}
              value=""
              disabled={addAssignment.isPending}
            >
              <SelectTrigger className="w-full md:w-[320px] bg-muted/30 border-dashed">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Add Signature listing...</span>
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[280px] bg-popover">
                {available.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No available Signature listings
                  </div>
                ) : (
                  available.map((listing) => {
                    const city = cities.find((c) => c.id === listing.city_id);
                    const category = categories.find((c) => c.id === listing.category_id);
                    return (
                      <SelectItem key={listing.id} value={listing.id}>
                        <div className="flex items-center gap-2">
                          <Crown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{listing.name}</span>
                          <span className="text-muted-foreground text-xs">
                            • {city?.name} • {category?.name}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>
    );
  };

  const isLoading = listingsLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground flex items-center gap-3">
          <Crown className="h-8 w-8 text-primary" />
          Signature Selection
        </h1>
        <p className="text-muted-foreground mt-1">
          Assign Signature listings to display on each page — one Signature Selection block per page
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">
                Signature Selection Rules
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Only <strong>Signature tier</strong> listings that are <strong>published</strong> and marked as <strong>selected</strong> can be assigned. 
                Each page displays <strong>one selected listing</strong>. 
                If no listing is assigned, the <strong>Homepage listing is used as fallback</strong>. 
                Owners cannot self-select.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {signatureListings.length === 0 && (
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Selected Listings Available</h3>
            <p className="text-muted-foreground">
              To enable Signature Selection, first mark listings as "Signature" tier and enable "is_selected" in the listings management.
            </p>
          </CardContent>
        </Card>
      )}

      {signatureListings.length > 0 && (
        <div className="space-y-4">
          {/* Homepage */}
          <PageSection
            title="Homepage"
            icon={Home}
            context="homepage"
            subtitle="Featured on the main landing page"
          />

          {/* Premium Regions */}
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Premium Regions
            </h2>
            <div className="grid gap-4">
              {regions.map((region) => (
                <PageSection
                  key={region.id}
                  title={region.name}
                  icon={MapPin}
                  context="region"
                  contextId={region.id}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Categories
            </h2>
            <div className="grid gap-4">
              {categories.map((category) => (
                <PageSection
                  key={category.id}
                  title={category.name}
                  icon={Tag}
                  context="category"
                  contextId={category.id}
                />
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Cities
            </h2>
            <div className="grid gap-4">
              {cities.map((city) => (
                <PageSection
                  key={city.id}
                  title={city.name}
                  icon={Building2}
                  context="city"
                  contextId={city.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{signatureListings.length}</strong> Signature listings available for selection
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{curatedAssignments.length}</strong> total assignments across all pages
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
