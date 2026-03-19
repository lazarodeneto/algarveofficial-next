import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Crown,
  Check,
  X,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, Column } from "@/components/admin/DataTable";
import { TierBadge } from "@/components/admin/TierBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { 
  useBulkDeleteListings, 
  useBulkPublishListings, 
  useBulkUpdateTier,
  useUpdateListingStatus,
} from "@/hooks/useListingMutations";
import { toast } from "sonner";

export default function AdminListings() {
  if (typeof window === "undefined") {
    return null;
  }
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>(() => {
    return searchParams.get("tier") || "all";
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  // Bulk action dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'unverified' | 'verified' | 'signature'>('unverified');

  // Bulk action mutations
  const bulkDelete = useBulkDeleteListings();
  const bulkPublish = useBulkPublishListings();
  const bulkUpdateTier = useBulkUpdateTier();
  const updateListingStatus = useUpdateListingStatus();

  const toggleCurated = useMutation({
    mutationFn: async ({ id, nextCurated }: { id: string; nextCurated: boolean }) => {
      const { error } = await supabase
        .from("listings")
        .update({ is_curated: nextCurated })
        .eq("id", id);
      if (error) throw error;
      return { id, nextCurated };
    },
    onSuccess: ({ nextCurated }) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-listings"] });
      toast.success(nextCurated ? "Added to curated list" : "Removed from curated list");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update curated status: ${error.message}`);
    },
  });

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading, refetch: refetchListings } = useQuery({
    queryKey: ['admin-all-listings'],
    queryFn: async () => {
      // PostgREST can cap responses at 1000 rows; fetch in pages to avoid truncation.
      const pageSize = 1000;
      let from = 0;
      const allRows: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id, name, tier, status, is_curated, description, slug,
            city:cities(id, name),
            category:categories(id, name),
            region:regions(id, name)
          `)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) throw error;

        const batch = data || [];
        allRows.push(...batch);

        if (batch.length < pageSize) break;
        from += pageSize;
      }

      // Safety: avoid accidental duplicate rows across pagination boundaries.
      const unique = new Map<string, any>();
      for (const row of allRows) unique.set(row.id, row);
      return Array.from(unique.values());
    },
  });

  // Fetch cities for filter
  const { data: cities = [] } = useQuery({
    queryKey: ['admin-cities-filter'],
    queryFn: async () => {
      const { data } = await supabase.from('cities').select('id, name').order('name');
      return data || [];
    },
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-filter'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('id, name').order('name');
      return data || [];
    },
  });

  const filteredListings = useMemo(() => {
    return listings.filter((listing: any) => {
      const matchesSearch = listing.name.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "all" || listing.city?.id === cityFilter;
      const matchesCategory = categoryFilter === "all" || listing.category?.id === categoryFilter;
      const matchesTier = tierFilter === "all" || listing.tier === tierFilter;
      const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
      return matchesSearch && matchesCity && matchesCategory && matchesTier && matchesStatus;
    });
  }, [listings, search, cityFilter, categoryFilter, tierFilter, statusFilter]);

  // Bulk action handlers
  const handleBulkPublish = () => {
    bulkPublish.mutate(selectedIds, {
      onSuccess: () => setSelectedIds([]),
    });
  };

  const handleBulkDelete = () => {
    const idsToDelete = singleDeleteId ? [singleDeleteId] : selectedIds;
    bulkDelete.mutate(idsToDelete, {
      onSuccess: () => {
        setSelectedIds([]);
        setSingleDeleteId(null);
        setDeleteDialogOpen(false);
        refetchListings();
      },
      onError: (error: Error) => {
        console.error('Delete error full details:', error);
      },
    });
  };

  const handleBulkSetTier = () => {
    bulkUpdateTier.mutate({ ids: selectedIds, tier: selectedTier }, {
      onSuccess: () => {
        setSelectedIds([]);
        setTierDialogOpen(false);
      },
    });
  };

  const handleApprove = (listingId: string) => {
    updateListingStatus.mutate({ id: listingId, status: "published" });
  };

  const handleReject = (listingId: string) => {
    updateListingStatus.mutate({ id: listingId, status: "rejected" });
  };

  const handleToggleCurated = (listing: any) => {
    if (listing.tier !== "signature") {
      toast.error("Only signature listings can be curated");
      return;
    }
    toggleCurated.mutate({ id: listing.id, nextCurated: !listing.is_curated });
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Name",
      className: "w-[42%] max-w-[34rem]",
      render: (listing) => (
        <div className="min-w-0 max-w-[18rem] sm:max-w-[24rem] lg:max-w-[34rem]">
          <p className="font-medium text-foreground truncate">{listing.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {listing.city?.name || 'No city'}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      className: "w-[9.5rem]",
      render: (listing) => (
        <span className="block truncate text-sm text-muted-foreground max-w-[9rem]">
          {listing.category?.name || '—'}
        </span>
      ),
    },
    {
      key: "region",
      label: "Region",
      className: "hidden md:table-cell w-[9rem]",
      render: (listing) => (
        <span className="block truncate text-sm text-muted-foreground max-w-[8.5rem]">
          {listing.region?.name || "—"}
        </span>
      ),
    },
    {
      key: "tier",
      label: "Tier",
      className: "w-[8.25rem] whitespace-nowrap",
      render: (listing) => <TierBadge tier={listing.tier} size="sm" />,
    },
    {
      key: "curated",
      label: "Selected",
      className: "hidden lg:table-cell w-[7.5rem] whitespace-nowrap",
      render: (listing) =>
        listing.is_curated ? (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Crown className="h-3 w-3 mr-1" />
            VIP
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      className: "w-[8.5rem] whitespace-nowrap",
      render: (listing) => <StatusBadge status={listing.status} size="sm" />,
    },
    {
      key: "actions",
      label: "",
      className: "w-12 text-right",
      render: (listing) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/listing/${listing.slug || listing.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/admin/listings/${listing.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {listing.status === "pending_review" && (
              <>
                <DropdownMenuItem
                  className="text-green-400"
                  onClick={() => handleApprove(listing.id)}
                  disabled={updateListingStatus.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleReject(listing.id)}
                  disabled={updateListingStatus.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {listing.tier === "signature" && (
              <DropdownMenuItem
                onClick={() => handleToggleCurated(listing)}
                disabled={toggleCurated.isPending}
              >
                <Crown className="h-4 w-4 mr-2" />
                {listing.is_curated ? "Remove from Curated" : "Add to Curated"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSingleDeleteId(listing.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setCityFilter("all");
    setCategoryFilter("all");
    setTierFilter("all");
    setStatusFilter("all");
  };

  const hasFilters = search || cityFilter !== "all" || categoryFilter !== "all" || tierFilter !== "all" || statusFilter !== "all";

  if (listingsLoading) {
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
          <h1 className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
            Listings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all business listings
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {[...cities].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...categories].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="signature">Signature</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            {selectedIds.length === 1 && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/admin/listings/${selectedIds[0]}/edit`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleBulkPublish}
              disabled={bulkPublish.isPending}
            >
              {bulkPublish.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Publish
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setTierDialogOpen(true)}
            >
              Set Tier
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-destructive border-destructive/30"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredListings}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage="No listings found"
        tableClassName="min-w-[980px] table-fixed"
      />

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredListings.length} of {listings.length} listings
      </p>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSingleDeleteId(null);
        }}
        title="Delete Listing(s)"
        description={`Are you sure you want to delete ${singleDeleteId ? '1' : selectedIds.length} listing(s)? This action cannot be undone.`}
        confirmLabel={bulkDelete.isPending ? "Deleting..." : "Delete"}
        onConfirm={handleBulkDelete}
        variant="destructive"
      />

      {/* Tier Selection Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">Set Tier</DialogTitle>
            <DialogDescription>
              Choose a tier to apply to {selectedIds.length} selected listing(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signature">Signature</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkSetTier}
              disabled={bulkUpdateTier.isPending}
            >
              {bulkUpdateTier.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Apply Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
