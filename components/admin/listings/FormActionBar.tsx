import { Save, Send, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublishStatus, ListingTier } from "@/types/admin";

interface FormActionBarProps {
  status: PublishStatus;
  tier: ListingTier;
  isAdmin: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  isValid: boolean;
  onSaveDraft: () => void;
  onSubmitReview: () => void;
  onPublish: () => void;
  onPreview: () => void;
}

export function FormActionBar({
  status,
  tier,
  isAdmin,
  isSaving,
  hasChanges,
  isValid,
  onSaveDraft,
  onSubmitReview,
  onPublish,
  onPreview,
}: FormActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto max-w-6xl px-4 py-2.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Status indicators */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {status.replace("_", " ")}
            </Badge>
            <Badge
              variant="outline"
              className={
                tier === "signature"
                  ? "border-primary text-primary"
                  : tier === "verified"
                    ? "border-blue-400 text-blue-400"
                    : ""
              }
            >
              {tier}
            </Badge>
            {hasChanges && (
              <span className="text-xs text-muted-foreground">
                • Unsaved changes
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onPreview}
              size="sm"
              className="hidden rounded-full sm:flex"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            {!isAdmin && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSaving || !hasChanges}
                size="sm"
                className="rounded-full"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
            )}

            {status === "draft" && !isAdmin && (
              <Button
                type="button"
                onClick={onSubmitReview}
                disabled={isSaving || !isValid}
                size="sm"
                className="rounded-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}

            {isAdmin && (
              <Button
                type="button"
                onClick={onPublish}
                disabled={isSaving || !isValid}
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {status === "draft"
                  ? "Save Draft"
                  : status === "pending_review"
                    ? "Save as Pending"
                    : status === "rejected"
                      ? "Save as Rejected"
                      : "Save & Publish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
