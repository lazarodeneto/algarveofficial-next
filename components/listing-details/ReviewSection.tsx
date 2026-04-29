import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ThumbsUp, User, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export interface Review {
  id: string;
  listing_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  helpful_votes: number;
  created_at: string;
}

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: "review-1",
    listing_id: "listing-1",
    user_id: "user-1",
    user_name: "Maria S.",
    rating: 5,
    title: "Absolutely stunning experience",
    content: "We had the most amazing time. The attention to detail was impeccable, and the staff went above and beyond to make our stay memorable. Highly recommend for anyone looking for a premium experience in the Algarve.",
    helpful_votes: 12,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "review-2",
    listing_id: "listing-1",
    user_id: "user-2",
    user_name: "John D.",
    rating: 4,
    title: "Great location, excellent service",
    content: "The location is perfect and the views are breathtaking. Service was very professional. Only minor issue was the wait time for dinner reservations, but overall a wonderful experience.",
    helpful_votes: 8,
    created_at: "2024-01-10T14:30:00Z",
  },
  {
    id: "review-3",
    listing_id: "listing-1",
    user_id: "user-3",
    user_name: "Sophie L.",
    rating: 5,
    title: "Will definitely return",
    content: "Everything exceeded our expectations. From the moment we arrived to the moment we left, we felt like VIPs. The facilities are world-class and the experience is worth every penny.",
    helpful_votes: 5,
    created_at: "2024-01-05T09:15:00Z",
  },
];

interface ReviewSectionProps {
  listingId: string;
}

export function ReviewSection({ listingId }: ReviewSectionProps) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const [helpedReviews, setHelpedReviews] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  // Calculate aggregate stats
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    }
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;
    
    const distribution = [5, 4, 3, 2, 1].map(
      (star) => reviews.filter((r) => r.rating === star).length
    );
    
    return { average, total, distribution };
  }, [reviews]);

  // Sort and limit reviews
  const displayedReviews = useMemo(() => {
    const sorted = [...reviews].sort((a, b) => {
      if (sortBy === "helpful") {
        return b.helpful_votes - a.helpful_votes;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return showAll ? sorted : sorted.slice(0, 3);
  }, [reviews, sortBy, showAll]);

  const handleVoteHelpful = (reviewId: string) => {
    if (helpedReviews.has(reviewId)) return;
    
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpful_votes: r.helpful_votes + 1 } : r
      )
    );
    setHelpedReviews((prev) => new Set([...prev, reviewId]));
  };

  const handleSubmitReview = (data: { rating: number; title: string; content: string }) => {
    const newReview: Review = {
      id: `review-${Date.now()}`,
      listing_id: listingId,
      user_id: "current-user",
      user_name: "You",
      rating: data.rating,
      title: data.title,
      content: data.content,
      helpful_votes: 0,
      created_at: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-medium">{t("reviews.ratingsTitle")}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("reviews.sortBy")}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "helpful")}
            className="text-sm bg-transparent border border-border rounded px-2 py-1"
          >
            <option value="recent">{t("reviews.mostRecent")}</option>
            <option value="helpful">{t("reviews.mostHelpful")}</option>
          </select>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex flex-col items-center justify-center md:w-48">
          <span className="text-4xl font-bold">{stats.average.toFixed(1)}</span>
          <StarRating rating={stats.average} size="lg" />
          <span className="text-sm text-muted-foreground mt-1">
            {stats.total} {stats.total === 1 ? t("reviews.countOne") : t("reviews.countOther")}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star, index) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm w-3">{star}</span>
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: stats.total > 0
                      ? `${(stats.distribution[index] / stats.total) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">
                {stats.distribution[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated && (
        <>
          <Separator />
          <ReviewForm onSubmit={handleSubmitReview} />
        </>
      )}

      <Separator />

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{review.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(review.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            
            <div>
              <h4 className="font-medium mb-1">{review.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.content}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVoteHelpful(review.id)}
                disabled={helpedReviews.has(review.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${helpedReviews.has(review.id) ? "fill-primary text-primary" : ""}`} />
                {t("reviews.helpful")} ({review.helpful_votes})
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less */}
      {reviews.length > 3 && (
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              {t("reviews.showLess")}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              {t("reviews.showAll")} {reviews.length} {t("reviews.countOther")}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
