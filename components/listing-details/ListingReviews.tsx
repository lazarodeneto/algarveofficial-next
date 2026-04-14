import { useState } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Clock3, Star, Trash2, User, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { da, de, enUS, es, fr, it, nb, nl, pt, sv } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  useListingReviews,
  useMyListingReview,
  useUpsertListingReview,
  useDeleteListingReview,
  type ListingReview,
} from "@/hooks/useListingReviews";
import { normalizePublicContentLocale } from "@/lib/publicContentLocale";

interface ListingReviewsProps {
  listingId: string;
  userId: string | undefined;
  onRequestLogin: () => void;
}

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewAvatar({ name, avatarUrl }: { name: string | null; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name ?? "User"}
        width={36}
        height={36}
        unoptimized
        sizes="36px"
        className="h-9 w-9 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
      <User className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export function ListingReviews({ listingId, userId, onRequestLogin }: ListingReviewsProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const { data: reviewsData = [], isLoading } = useListingReviews(listingId);
  const reviews = reviewsData as ListingReview[];
  const { data: myReview } = useMyListingReview(listingId, userId);
  const upsert = useUpsertListingReview();
  const remove = useDeleteListingReview();
  const isPending = myReview?.status === "pending";
  const isRejected = myReview?.status === "rejected";

  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0;
  const locale = normalizePublicContentLocale(useCurrentLocale());
  const dateLocaleMap = {
    en: enUS,
    "pt-pt": pt,
    de,
    fr,
    es,
    it,
    nl,
    sv,
    no: nb,
    da,
  } as const;
  const reviewCountLabel =
    reviews.length === 1
      ? t("reviews.countOne")
      : t("reviews.countOther");

  const handleStartWriting = () => {
    if (!userId) {
      onRequestLogin();
      return;
    }
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    }
    setIsWriting(true);
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (rating === 0) {
      toast.error(t("reviews.selectRating"));
      return;
    }

    try {
      const savedReview = await upsert.mutateAsync({ listingId, userId, rating, comment });
      toast.success(
        savedReview.status === "pending"
          ? t("reviews.pendingApproval")
          : myReview
              ? t("reviews.updated")
              : t("reviews.submitted"),
      );
      setIsWriting(false);
      setRating(0);
      setComment("");
    } catch {
      toast.error(t("reviews.error"));
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await remove.mutateAsync({ reviewId, listingId });
      toast.success(t("reviews.deleted"));
      setIsWriting(false);
      setRating(0);
      setComment("");
    } catch {
      toast.error(t("reviews.deleteError"));
    }
  };

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif font-medium">
            {t("reviews.title")}
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} · {reviews.length} {reviewCountLabel}
              </span>
            </div>
          )}
        </div>

        {!isWriting && (
          <Button variant="outline" size="sm" onClick={handleStartWriting}>
            {myReview
              ? t("reviews.editReview")
              : t("reviews.writeReview")}
          </Button>
        )}
      </div>

      {/* Write/Edit form */}
      {isWriting && (
        <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
          <p className="text-sm font-medium mb-3">
            {myReview ? t("reviews.editReview") : t("reviews.writeReview")}
          </p>
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            className="mt-3 resize-none"
            rows={3}
            placeholder={t("reviews.commentPlaceholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={upsert.isPending ?? rating === 0}
            >
              {upsert.isPending
                ? t("common.saving")
                : t("reviews.submit")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setIsWriting(false); setRating(0); setComment(""); }}
            >
              {t("common.cancel")}
            </Button>
            {myReview && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => handleDelete(myReview.id)}
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("reviews.delete")}
              </Button>
            )}
          </div>
        </div>
      )}

      {myReview && !isWriting && (
        <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">
              {t("reviews.yourReviewStatus")}
            </p>
            {isPending && (
              <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                <Clock3 className="h-3 w-3" />
                {t("reviews.statusPending")}
              </Badge>
            )}
            {myReview.status === "approved" && (
              <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                <CheckCircle2 className="h-3 w-3" />
                {t("reviews.statusApproved")}
              </Badge>
            )}
            {isRejected && (
              <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/30">
                <XCircle className="h-3 w-3" />
                {t("reviews.statusRejected")}
              </Badge>
            )}
          </div>

          {isPending && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("reviews.pendingDescription")}
            </p>
          )}

          {isRejected && (
            <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {t("reviews.rejectedDescription")}
                  </p>
                  {myReview.rejection_reason && (
                    <p className="mt-1 text-muted-foreground">
                      {myReview.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? null : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("reviews.noReviews")}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={review.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex gap-3">
                <ReviewAvatar
                  name={review.profile?.full_name ?? null}
                  avatarUrl={review.profile?.avatar_url ?? null}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {review.profile?.full_name || t("reviews.anonymousUser")}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: dateLocaleMap[locale],
                      })}
                    </span>
                  </div>
                  <StarRating value={review.rating} readonly />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
