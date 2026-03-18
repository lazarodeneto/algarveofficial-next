import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; title: string; content: string }) => void;
}

import { useTranslation } from "react-i18next";

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('listing.reviews.errorRating'));
      return;
    }

    if (!title.trim()) {
      toast.error(t('listing.reviews.errorTitle'));
      return;
    }

    if (!content.trim()) {
      toast.error(t('listing.reviews.errorContent'));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit({ rating, title, content });

    setRating(0);
    setTitle("");
    setContent("");
    setIsSubmitting(false);

    toast.success(t('listing.reviews.success'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-medium">{t('listing.reviews.write')}</h3>

      <div className="space-y-2">
        <Label>{t('listing.reviews.rating')}</Label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">{t('listing.reviews.title')}</Label>
        <Input
          id="review-title"
          placeholder={t('listing.reviews.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-content">{t('listing.reviews.content')}</Label>
        <Textarea
          id="review-content"
          placeholder={t('listing.reviews.contentPlaceholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.length}/1000
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('listing.reviews.submitting')}
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {t('listing.reviews.submit')}
          </>
        )}
      </Button>
    </form>
  );
}
