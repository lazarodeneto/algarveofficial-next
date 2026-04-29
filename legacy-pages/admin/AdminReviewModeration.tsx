import { useMemo, useState } from "react";
import { CalendarClock, Check, ExternalLink, Loader2, MessageSquare, Star, User, X } from "lucide-react";
import { toast } from "sonner";

import { useAdminListingReviews, useModerateListingReview, type AdminListingReview, type ListingReviewStatus } from "@/hooks/useListingReviews";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterStatus = ListingReviewStatus | "all";

function statusTone(status: ListingReviewStatus) {
  if (status === "approved") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  if (status === "rejected") return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-amber-500/10 text-amber-700 border-amber-500/20";
}

function statusLabel(status: ListingReviewStatus) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export default function AdminReviewModeration() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending");
  const [reviewToReject, setReviewToReject] = useState<AdminListingReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: reviews = [], isLoading, isFetching } = useAdminListingReviews(statusFilter);
  const moderateReview = useModerateListingReview();

  const pendingCount = useMemo(
    () => reviews.filter((review) => review.status === "pending").length,
    [reviews],
  );

  const handleApprove = (review: AdminListingReview) => {
    moderateReview.mutate(
      {
        reviewId: review.id,
        listingId: review.listing_id,
        status: "approved",
      },
      {
        onSuccess: () => {
          toast.success("Review approved");
        },
        onError: (error: Error) => {
          toast.error(`Failed to approve review: ${error.message}`);
        },
      },
    );
  };

  const handleReject = () => {
    if (!reviewToReject) return;
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    moderateReview.mutate(
      {
        reviewId: reviewToReject.id,
        listingId: reviewToReject.listing_id,
        status: "rejected",
        rejectionReason,
      },
      {
        onSuccess: () => {
          toast.success("Review rejected");
          setReviewToReject(null);
          setRejectionReason("");
        },
        onError: (error: Error) => {
          toast.error(`Failed to reject review: ${error.message}`);
        },
      },
    );
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground flex items-center gap-3">
            <Star className="h-8 w-8 text-amber-500" />
            Review Moderation
          </h1>
          <p className="text-muted-foreground mt-1">
            Moderate listing reviews and keep public feedback trustworthy
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Label className="mb-2 block text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Status Filter
          </Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-amber-500/10 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">pending reviews in current filter</p>
            </div>
            {isFetching ? <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" /> : null}
          </div>
        </CardContent>
      </Card>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Check className="h-12 w-12 text-emerald-500 mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">No reviews found</p>
            <p className="text-muted-foreground">
              There are no review records for this status right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const listingHref = `/listing/${review.listing?.slug || review.listing_id}`;
            const reviewerName = review.profile?.full_name || "Anonymous user";

            return (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="font-serif text-xl truncate">
                        {review.listing?.name || "Unknown listing"}
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {reviewerName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(review.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusTone(review.status)}>
                        {statusLabel(review.status)}
                      </Badge>
                      <a
                        href={listingHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Open listing
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const filled = i < review.rating;
                      return (
                        <Star
                          key={`${review.id}-star-${i}`}
                          className={filled ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-muted-foreground/40"}
                        />
                      );
                    })}
                    <span className="ml-1 text-sm text-muted-foreground">{review.rating}/5</span>
                  </div>

                  <div className="rounded-md border border-border/70 bg-muted/30 p-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {review.comment?.trim() || "No comment provided."}
                    </p>
                  </div>

                  {review.status === "rejected" && review.rejection_reason ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-destructive mb-1">Rejection reason</p>
                      <p className="text-sm text-foreground">{review.rejection_reason}</p>
                    </div>
                  ) : null}

                  {review.status === "pending" ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={moderateReview.isPending}
                        onClick={() => handleApprove(review)}
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={moderateReview.isPending}
                        onClick={() => {
                          setReviewToReject(review);
                          setRejectionReason("");
                        }}
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(reviewToReject)} onOpenChange={(open) => { if (!open) setReviewToReject(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-destructive" />
              Reject Review
            </DialogTitle>
            <DialogDescription>
              Provide a reason so admins can understand why this review was rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="review-rejection-reason">Rejection reason</Label>
            <Textarea
              id="review-rejection-reason"
              rows={4}
              placeholder="Enter reason..."
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewToReject(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={moderateReview.isPending || !rejectionReason.trim()}
              onClick={handleReject}
            >
              Reject review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
