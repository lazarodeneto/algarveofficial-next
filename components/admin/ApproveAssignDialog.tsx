import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, Search, Building, MapPin, AlertTriangle } from "lucide-react";
import { useApproveAndAssignClaim, usePublishedListingsForAssignment, type ListingClaim } from "@/hooks/useListingClaims";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ListingImage from "@/components/ListingImage";

interface ApproveAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: ListingClaim | null;
}

interface ListingAssignmentOption {
  id: string;
  name: string | null;
  featured_image_url: string | null;
  category?: {
    slug?: string | null;
    image_url?: string | null;
  } | null;
  cities?: {
    name?: string | null;
  } | null;
}

export function ApproveAssignDialog({ open, onOpenChange, claim }: ApproveAssignDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { data: listings = [], isLoading: loadingListings } = usePublishedListingsForAssignment(searchTerm);
  const approveAndAssign = useApproveAndAssignClaim();

  const handleApprove = async () => {
    if (!claim || !selectedListingId) return;

    try {
      await approveAndAssign.mutateAsync({
        claimId: claim.id,
        listingId: selectedListingId,
      });
      toast.success("Claim approved! Listing assigned and user promoted to owner.");
      setSelectedListingId(null);
      setSearchTerm("");
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to approve claim";
      toast.error(message);
    }
  };

  const hasUser = !!claim?.user_id;

  return (
    <Dialog open={open} onOpenChange={(v) => { 
      if (!v) { setSelectedListingId(null); setSearchTerm(""); }
      onOpenChange(v); 
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Approve & Assign Listing
          </DialogTitle>
          <DialogDescription>
            Select a published listing to assign to <strong>{claim?.contact_name}</strong>.
            They will become the business owner and gain access to the Owner Dashboard.
          </DialogDescription>
        </DialogHeader>

        {!hasUser && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500">No registered account</p>
              <p className="text-muted-foreground">
                This claimant ({claim?.email}) does not have a registered account. 
                They must sign up first before you can assign a listing.
              </p>
            </div>
          </div>
        )}

        {hasUser && (
          <div className="space-y-4">
            {/* Claim summary */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{claim?.business_name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Claimant: {claim?.contact_name} ({claim?.email})
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search published listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Listings list */}
            <ScrollArea className="h-[250px] border rounded-lg">
              {loadingListings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchTerm.length >= 2 ? "No listings match your search" : "Type to search published listings"}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {(listings as ListingAssignmentOption[]).map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => setSelectedListingId(listing.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        selectedListingId === listing.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      <ListingImage
                        src={listing.featured_image_url}
                        category={listing.category?.slug}
                        categoryImageUrl={listing.category?.image_url}
                        listingId={listing.id}
                        alt={listing.name || "Listing"}
                        className="h-10 w-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{listing.name}</p>
                        {listing.cities?.name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.cities.name}
                          </p>
                        )}
                      </div>
                      {selectedListingId === listing.id && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={!selectedListingId || approveAndAssign.isPending || !hasUser}
            onClick={handleApprove}
          >
            {approveAndAssign.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Approve & Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
