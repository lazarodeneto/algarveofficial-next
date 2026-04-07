import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardCheck, Check, X, Eye, MessageSquare, Loader2, MapPin, Tag, Globe, Phone, Mail as MailIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TierBadge } from "@/components/admin/TierBadge";
import { toast } from "sonner";
import { resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";
import { getValidAccessToken } from "@/lib/authToken";

async function patchAdminListing(
  listingId: string,
  payload: Record<string, unknown>,
) {
  const accessToken = await getValidAccessToken();
  const response = await fetch(`/api/admin/listings/${listingId}`, {
    method: "PATCH",
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
    throw new Error(data?.error?.message || "Failed to update listing moderation state.");
  }
}

export default function AdminModeration() {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [note, setNote] = useState("");
  const [previewListing, setPreviewListing] = useState<any | null>(null);

  // Fetch pending listings
  const { data: pendingListings = [], isLoading } = useQuery({
    queryKey: ['admin-pending-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id, name, slug, description, short_description, tier, 
          featured_image_url, contact_email, contact_phone, website_url, 
          whatsapp_number, address, tags, admin_notes,
          city:cities(name),
          category:categories(name),
          region:regions(name),
          images:listing_images(id, image_url, alt_text, display_order)
        `)
        .eq('status', 'pending_review')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await patchAdminListing(listingId, {
        status: "published",
        sync_featured_image: true,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      // Invalidate all listing-related caches so homepage, directory, and owner dashboard update
      queryClient.invalidateQueries({ queryKey: ['pending-review-count'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      toast.success("Listing approved and published");
    },
    onError: (error) => {
      toast.error("Failed to approve: " + error.message);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string; reason: string }) => {
      await patchAdminListing(listingId, {
        status: "rejected",
        rejection_reason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      toast.success("Listing rejected");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedListingId(null);
    },
    onError: (error) => {
      toast.error("Failed to reject: " + error.message);
    },
  });

  const handlePreview = (listing: any) => {
    setPreviewListing(listing);
  };

  const handleApprove = (listingId: string) => {
    approveMutation.mutate(listingId);
  };

  const handleReject = (listingId: string) => {
    setSelectedListingId(listingId);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedListingId && rejectReason.trim()) {
      rejectMutation.mutate({ listingId: selectedListingId, reason: rejectReason });
    }
  };

  const handleAddNote = (listing: any) => {
    setSelectedListingId(listing.id);
    setNote(listing.admin_notes || "");
    setNoteDialogOpen(true);
  };

  const confirmAddNote = async () => {
    if (selectedListingId && note.trim()) {
      try {
        await patchAdminListing(selectedListingId, {
          admin_notes: note.trim(),
        });
        toast.success("Note saved successfully");
        queryClient.invalidateQueries({ queryKey: ['pending-listings'] });
      } catch (err: any) {
        toast.error("Failed to save note: " + err.message);
      }
    }
    setNoteDialogOpen(false);
    setNote("");
    setSelectedListingId(null);
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
      <div>
        <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-amber-400" />
          Moderation Queue
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and approve pending listings
        </p>
      </div>

      {/* Queue Stats */}
      <Card className="bg-amber-500/10 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-foreground">
                {pendingListings.length}
              </p>
              <p className="text-sm text-muted-foreground">
                listings awaiting review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Listings */}
      {pendingListings.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Check className="h-12 w-12 text-green-400 mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">All caught up!</p>
            <p className="text-muted-foreground">
              There are no listings pending review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingListings.map((listing: any) => (
            <Card key={listing.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-serif text-xl truncate">
                      {listing.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.city?.name || 'No city'} • {listing.category?.name || 'No category'}
                    </p>
                  </div>
                  <TierBadge tier={listing.tier} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {listing.description || 'No description provided'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview(listing)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(listing.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => handleReject(listing.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAddNote(listing)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">Reject Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this listing. The owner will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Note</DialogTitle>
            <DialogDescription>
              Add an internal note to this listing for reference.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter your note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAddNote}
              disabled={!note.trim()}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewListing} onOpenChange={(v) => { if (!v) setPreviewListing(null); }}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-serif text-xl flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              Preview: {previewListing?.name}
            </DialogTitle>
            <DialogDescription>
              This is the pending version submitted for review — not the live listing.
            </DialogDescription>
          </DialogHeader>
          {previewListing && (
            <ScrollArea className="px-6 pb-6 max-h-[65vh]">
              <div className="space-y-6 pt-4">
                {/* Featured Image */}
                {(resolveSupabaseBucketImageUrl(previewListing.featured_image_url, "listing-images")
                  ?? previewListing.featured_image_url) && (
                  <img
                    src={resolveSupabaseBucketImageUrl(previewListing.featured_image_url, "listing-images") ?? previewListing.featured_image_url}
                    alt={previewListing.name}
                    className="w-full h-56 object-cover rounded-lg border border-border"
                  />
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-2">
                  <TierBadge tier={previewListing.tier} />
                  {previewListing.city?.name && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {previewListing.city.name}
                    </Badge>
                  )}
                  {previewListing.category?.name && (
                    <Badge variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {previewListing.category.name}
                    </Badge>
                  )}
                  {previewListing.region?.name && (
                    <Badge variant="outline" className="gap-1">
                      {previewListing.region.name}
                    </Badge>
                  )}
                </div>

                {/* Short Description */}
                {previewListing.short_description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Short Description</h3>
                    <p className="text-foreground">{previewListing.short_description}</p>
                  </div>
                )}

                {/* Full Description */}
                {previewListing.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-foreground whitespace-pre-wrap">{previewListing.description}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {previewListing.contact_email && (
                      <div className="flex items-center gap-2 text-foreground">
                        <MailIcon className="h-4 w-4 text-muted-foreground" />
                        {previewListing.contact_email}
                      </div>
                    )}
                    {previewListing.contact_phone && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {previewListing.contact_phone}
                      </div>
                    )}
                    {previewListing.website_url && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={previewListing.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {previewListing.website_url}
                        </a>
                      </div>
                    )}
                    {previewListing.address && (
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {previewListing.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {previewListing.tags && previewListing.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {previewListing.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery */}
                {previewListing.images && previewListing.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Gallery ({previewListing.images.length} images)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {previewListing.images
                        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                        .map((img: any) => (
                          <img
                            key={img.id}
                            src={resolveSupabaseBucketImageUrl(img.image_url, "listing-images") ?? img.image_url}
                            alt={img.alt_text || ''}
                            className="w-full h-24 object-cover rounded border border-border"
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {previewListing.admin_notes && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Admin Notes</h3>
                    <p className="text-foreground text-sm">{previewListing.admin_notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
