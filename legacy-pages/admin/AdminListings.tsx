import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { m } from "framer-motion";
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
  MoreHorizontal,
  Eye,
  Edit,
  Crown,
  Check,
  X,
  Trash2,
  Loader2,
  GripVertical,
  Star,
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
import { useDeleteListings, useUpdateListingStatus } from "@/hooks/useListingMutations";
import { useLocalePath } from "@/hooks/useLocalePath";
import { toast } from "sonner";

export default function AdminListings() {
  const searchParams = useSearchParams();
  const l = useLocalePath();

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
  const [selectedTier, setSelectedTier] = useState<"unverified" | "verified" | "signature">("unverified");
  const [featuredContext, setFeaturedContext] = useState<"homepage:home">("homepage:home");

  // Parse context
  const [ctxType, ctxValue] = featuredContext.split(":") as ["homepage" | "category" | "city" | "region", string];

  const updateListingStatus = useUpdateListingStatus();
  const deleteListings = useDeleteListings();
  const queryClient = useQueryClient();

  // Featured rank update via secure API
  const updateFeaturedRank = useMutation({
    mutationFn: async ({ id, rank, action }: { id: string; rank?: number | null; action?: string }) => {
      const res = await fetch("/api/admin/pin-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id, position: rank, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-all-listings"],
        exact: true,
      });
    },
  });

  // Fetch listings
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      // PostgREST can cap responses at 1000 rows; fetch in pages to avoid truncation.
      const pageSize = 1000;
      let from = 0;
      const allRows: any[] = [];

// Note: featured_rank column must be added via migration before this will typecheck
      while (true) {
        const { data, error } = await (supabase as any)
          .select(`
            id, name, tier, status, is_curated, description, slug, featured_rank,
            city:cities(id, name),
            category:categories(id, name),
            region:regions(id, name)
          `)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
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
    queryKey: ["admin-cities-filter"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("id, name").order("name");
      return data || [];
    },
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-filter"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
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

  // Featured-only listings (for drag & drop)
  const featuredListings = useMemo(() => {
    return listings
      .filter((l: any) => l.featured_rank != null)
      .sort((a: any, b: any) => (a.featured_rank ?? 999) - (b.featured_rank ?? 999));
  }, [listings]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Bulk reorder featured listings (with RPC for atomic update + optimistic UI)
  const reorderFeaturedRank = useMutation({
    mutationFn: async (items: { id: string; rank: number }[]) => {
      await (supabase as any).rpc("set_featured_ranks", { payload: items });
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["admin-all-listings"] });
      const previous = queryClient.getQueryData(["admin-all-listings"]);
      queryClient.setQueryData(["admin-all-listings"], (old: any) => {
        if (!old) return old;
        const rankMap = Object.fromEntries(next.map((i) => [i.id, i.rank]));
        return {
          ...old,
          pages: old.pages?.map((page: any) =>
            page.map((l: any) => ({
              ...l,
              featured_rank: rankMap[l.id] ?? l.featured_rank,
            }))
          ) ?? old,
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["admin-all-listings"], context?.previous);
      toast.error("Reorder failed. Restored previous order.");
    },
    onSuccess: () => {
      toast.success("Featured ranking updated");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featuredListings.findIndex((l: any) => l.id === active.id);
    const newIndex = featuredListings.findIndex((l: any) => l.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(featuredListings, oldIndex, newIndex);
      const updates = reordered.map((item: any, index: number) => ({
        id: item.id,
        rank: index + 1,
      }));
      reorderFeaturedRank.mutate(updates);
    }
  };

  // Max featured limit
  const MAX_FEATURED = 12;

  // Clear all featured
  const clearAllFeatured = useMutation({
    mutationFn: async () => {
      // Get all featured listings
      const featured = listings.filter((l: any) => l.featured_rank != null);
      // Unpin each via API
      await Promise.all(
        featured.map((l: any) =>
          fetch("/api/admin/pin-listing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId: l.id, action: "unpin" }),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-listings"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["homepage-data"] });
      queryClient.invalidateQueries({ queryKey: ["category-listings"] });
      toast.success("Cleared all featured listings");
    },
    onError: () => {
      toast.error("Failed to clear featured");
    },
  });

  // Pin listing to top (via secure API)
  const pinToTop = async (listingId: string) => {
    if (featuredListings.length >= MAX_FEATURED) {
      toast.error(`Max ${MAX_FEATURED} featured listings reached`);
      return;
    }
    
    const newRank = featuredListings.length + 1;
    updateFeaturedRank.mutate({ id: listingId, rank: newRank }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["homepage-data"] });
        queryClient.invalidateQueries({ queryKey: ["category-listings"] });
        toast.success("Pinned to featured");
      },
      onError: (err: any) => {
        toast.error(err.message || "Cannot pin: subscription required");
      },
    });
  };

  // Expose pinToTop for column action
  const handleBulkDelete = () => {
    const targetIds = singleDeleteId ? [singleDeleteId] : selectedIds;

    if (targetIds.length === 0) {
      toast.error("Select at least one listing to delete.");
      return;
    }

    deleteListings.mutate(
      { ids: targetIds },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSingleDeleteId(null);
          setSelectedIds((prev) =>
            prev.filter((id) => !targetIds.includes(id)),
          );
        },
      },
    );
  };

  const handleBulkPublish = () => {
    console.warn("bulk publish disabled temporarily");
  };

  const handleBulkSetTier = () => {
    console.warn("bulk tier update disabled temporarily");
    setTierDialogOpen(false);
  };

  const handleToggleCurated = (_listing: any) => {
    console.warn("toggle curated disabled temporarily", _listing?.id);
  };

  const handleApprove = (listingId: string) => {
    updateListingStatus.mutate({ id: listingId, status: "published" });
  };

  const handleReject = (listingId: string) => {
    updateListingStatus.mutate({ id: listingId, status: "rejected" });
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Name",
      className: "w-[48%] sm:w-[42%] max-w-[34rem]",
      render: (listing) => (
        <div className="min-w-0 max-w-[18rem] sm:max-w-[24rem] lg:max-w-[34rem]">
          <p className="font-medium text-foreground truncate">{listing.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {listing.city?.name || "No city"}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      className: "hidden sm:table-cell w-[9.5rem]",
      render: (listing) => (
        <span className="block truncate text-sm text-muted-foreground max-w-[9rem]">
          {listing.category?.name || "—"}
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
      className: "w-[7.5rem] sm:w-[8.25rem] whitespace-nowrap",
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
      key: "featured_rank",
      label: (
        <div className="flex flex-col">
          <span>Rank</span>
          <span className="text-[10px] text-muted-foreground font-normal">1 = top</span>
        </div>
      ),
      className: "w-[5.5rem] whitespace-nowrap",
      render: (listing: any) => {
        const currentRank = listing.featured_rank ?? "";
        const isFeatured = !!listing.featured_rank;
        const isTop = listing.featured_rank === 1;
        return (
          <div className={`flex items-center gap-2 ${isTop ? "bg-yellow-50 border-l-2 border-yellow-400 pl-2 -ml-2" : ""}`}>
            <Input
              type="number"
              min={1}
              placeholder="—"
              value={currentRank}
              className={`h-8 w-14 text-center text-sm ${
                isFeatured
                  ? "border-yellow-400 bg-yellow-50 font-medium text-yellow-700"
                  : "bg-background"
              }`}
              onChange={(e) => {
                const value = e.target.value;
                const parsed = value === "" ? null : Math.max(1, parseInt(value, 10) || 1);
                updateFeaturedRank.mutate({ id: listing.id, rank: parsed });
              }}
              onBlur={(e) => {
                const value = e.target.value;
                const parsed = value === "" ? null : Math.max(1, parseInt(value, 10) || 1);
                updateFeaturedRank.mutate({ id: listing.id, rank: parsed });
              }}
            />
            {isTop && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium">
                #1
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      className: "w-[7.5rem] sm:w-[8.5rem] whitespace-nowrap",
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
              <Link href={`/listing/${listing.slug || listing.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={l(`/admin/listings/${listing.id}/edit`)}>
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
                disabled
              >
                <Crown className="h-4 w-4 mr-2" />
                {listing.is_curated ? "Remove from Curated" : "Add to Curated"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {!listing.featured_rank && featuredListings.length < MAX_FEATURED && (
              <DropdownMenuItem onClick={() => pinToTop(listing.id)}>
                <Star className="h-4 w-4 mr-2" />
                Pin to Featured
              </DropdownMenuItem>
            )}
            {listing.featured_rank && (
              <DropdownMenuItem
                className="text-yellow-600"
                onClick={() => updateFeaturedRank.mutate({ id: listing.id, rank: null })}
              >
                <Star className="h-4 w-4 mr-2" />
                Unpin from Featured
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSingleDeleteId(listing.id);
                setDeleteDialogOpen(true);
              }}
              disabled={deleteListings.isPending}
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

  const hasFilters =
    search ||
    cityFilter !== "all" ||
    categoryFilter !== "all" ||
    tierFilter !== "all" ||
    statusFilter !== "all";

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium text-foreground lg:text-4xl">
            Listings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all business listings
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={l("/admin/listings/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="relative w-full xl:max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full xl:min-w-[150px]">
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
              <SelectTrigger className="w-full xl:min-w-[170px]">
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
              <SelectTrigger className="w-full xl:min-w-[145px]">
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
              <SelectTrigger className="w-full xl:min-w-[165px]">
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
              <Button variant="ghost" onClick={clearFilters} className="w-full text-muted-foreground xl:w-auto">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
            <span className="w-full text-sm text-muted-foreground sm:w-auto">
              {selectedIds.length} selected
            </span>
            {selectedIds.length === 1 && (
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                <Link href={l(`/admin/listings/${selectedIds[0]}/edit`)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkPublish}
              disabled
              className="w-full sm:w-auto"
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTierDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              Set Tier
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full border-destructive/30 text-destructive sm:w-auto"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteListings.isPending}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Featured List Section (Drag & Drop) */}
      {featuredListings.length > 0 && (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Star className="h-4 w-4 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Featured Listings</h3>
              <Select value={featuredContext} onValueChange={(v) => setFeaturedContext(v as any)}>
                <SelectTrigger className="h-8 w-40 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage:home">Homepage</SelectItem>
                  <SelectItem value="category:restaurants">Restaurants</SelectItem>
                  <SelectItem value="category:hotels">Hotels</SelectItem>
                  <SelectItem value="city:lagos">Lagos</SelectItem>
                  <SelectItem value="city:albufeira">Albufeira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-700">
                Slot €{featuredListings.length * 100}/mo · {MAX_FEATURED - featuredListings.length} left
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAllFeatured.mutate()}
                disabled={clearAllFeatured.isPending}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                Clear All
              </Button>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={featuredListings.map((l: any) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {featuredListings.map((listing: any, index: number) => (
                  <SortableListingItem
                    key={listing.id}
                    listing={listing}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredListings}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage="No listings found"
        tableClassName="min-w-[820px] lg:min-w-[980px] table-fixed"
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
        description={`Are you sure you want to delete ${singleDeleteId ? "1" : selectedIds.length} listing(s)? This action cannot be undone.`}
        confirmLabel="Delete"
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
              disabled
            >
              Apply Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sortable Listing Item for Featured Section
function SortableListingItem({
  listing,
  index,
}: {
  listing: any;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: listing.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isTopThree = index < 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white rounded-md border ${
        isDragging
          ? "border-yellow-500 shadow-lg opacity-90"
          : isTopThree
          ? "border-yellow-300"
          : "border-gray-200"
      }`}
      {...attributes}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
          index === 0
            ? "bg-yellow-400 text-yellow-900"
            : index === 1
            ? "bg-yellow-200 text-yellow-800"
            : index === 2
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{listing.name}</p>
        <p className="text-sm text-muted-foreground truncate">
          {listing.city?.name || "No city"} · {listing.category?.name || "No category"}
        </p>
      </div>
      <TierBadge tier={listing.tier} size="sm" />
    </div>
  );
}
