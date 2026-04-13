import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "../TierBadge";
import { StatusBadge } from "../StatusBadge";
import { Lock, UserPlus, Languages, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseFunctionErrorMessage } from "@/lib/supabaseFunctionError";
import { invokeFunctionWithAuthRetry } from "@/lib/supabaseFunctionInvoke";
import { isSupabaseFunctionAuthError } from "@/lib/supabaseFunctionError";
import { queueListingTranslationJobs, LISTING_TRANSLATION_TARGET_LANGS } from "@/lib/listingTranslationQueue";
import type { ListingFormData } from "@/types/listing";
import type { ListingTier, PublishStatus, User } from "@/types/admin";

const TARGET_LANGS = [...LISTING_TRANSLATION_TARGET_LANGS];
const TARGET_LANG_LABELS: Record<string, string> = {
  "pt-pt": "PT",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  nl: "NL",
  sv: "SV",
  no: "NO",
  da: "DA",
};

interface PublishingStepProps {
  data: ListingFormData;
  onChange: (field: keyof ListingFormData, value: unknown) => void;
  errors: Record<string, string>;
  isAdmin: boolean;
  isEditor: boolean;
  users?: User[];
  listingId?: string;
}

interface TranslationResult {
  ok?: boolean;
  error?: string;
  succeeded?: number;
  failed?: number;
}

export function PublishingStep({
  data,
  onChange,
  isAdmin,
  isEditor,
  users = [],
  listingId,
}: PublishingStepProps) {
  const canEditTier = isAdmin;
  const canEditStatus = isAdmin || isEditor;
  const canAssignOwner = isAdmin;
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationDone, setTranslationDone] = useState(false);
  const translationLanguagesText = TARGET_LANGS
    .map((code) => TARGET_LANG_LABELS[code] ?? code.toUpperCase())
    .join(", ");

  const availableUsers = users;

  const handleRequestTranslation = async () => {
    if (!listingId) {
      toast.error("Save the listing first before requesting translations.");
      return;
    }
    setTranslationLoading(true);
    setTranslationDone(false);
    try {
      const { data: rawResult, error } = await invokeFunctionWithAuthRetry("translate-listing", {
        body: { listing_id: listingId },
      });
      const result = rawResult as TranslationResult | null;

      if (error) {
        if (await isSupabaseFunctionAuthError(error)) {
          const queueResult = await queueListingTranslationJobs(listingId, TARGET_LANGS);
          const totalQueued = queueResult.queued;
          setTranslationDone(totalQueued > 0);
          if (totalQueued > 0) {
            toast.warning(
              `Direct translation endpoint is unavailable. Queued ${totalQueued} language job${totalQueued !== 1 ? "s" : ""} for background processing.`,
            );
          } else {
            toast.info("No new translation jobs were queued. Languages are already translated or queued.");
          }
          return;
        }

        throw new Error(await getSupabaseFunctionErrorMessage(error, "Translation request failed"));
      }

      if (result?.ok === false) {
        throw new Error(result?.error || "Translation request failed");
      }

      setTranslationDone(true);
      const succeeded = result?.succeeded || 0;
      const failed = result?.failed || 0;
      toast.success(`Translation complete: ${succeeded} languages translated${failed > 0 ? `, ${failed} failed` : ""}.`);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : await getSupabaseFunctionErrorMessage(err, "Unknown error");
      toast.error("Translation failed: " + message);
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold font-serif">Publishing Settings</h3>
        <p className="text-sm text-muted-foreground">
          Control tier, curation, and publication status
        </p>
      </div>

      {/* Permission notice for non-admins */}
      {!isAdmin && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Limited Access</p>
            <p className="text-xs text-muted-foreground">
              Tier and curation settings are admin-only. You can manage publication status.
            </p>
          </div>
        </div>
      )}

      {/* Listing Tier */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Listing Tier (Monetization)
          </h4>
          <TierBadge tier={data.tier} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tier">Tier Level</Label>
          <Select
            value={data.tier}
            onValueChange={(value: ListingTier) => {
              onChange("tier", value);
              // Reset curated if not signature
              if (value !== "signature" && data.is_curated) {
                onChange("is_curated", false);
              }
            }}
            disabled={!canEditTier}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unverified">
                <div className="flex items-center gap-2">
                  <span>Unverified</span>
                  <span className="text-xs text-muted-foreground">(Free)</span>
                </div>
              </SelectItem>
              <SelectItem value="verified">
                <div className="flex items-center gap-2">
                  <span>Verified</span>
                  <span className="text-xs text-muted-foreground">(Paid)</span>
                </div>
              </SelectItem>
              <SelectItem value="signature">
                <div className="flex items-center gap-2">
                  <span>Signature</span>
                  <span className="text-xs text-muted-foreground">(Premium)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only admins can modify listing tiers. Higher tiers unlock more visibility.
          </p>
        </div>
      </div>

      <Separator />

      {/* Publication Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Publication Status
          </h4>
          <StatusBadge status={data.published_status} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={data.published_status}
            onValueChange={(value: PublishStatus) => onChange("published_status", value)}
            disabled={!canEditStatus}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              {isAdmin && <SelectItem value="published">Published</SelectItem>}
              {isAdmin && <SelectItem value="rejected">Rejected</SelectItem>}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only published listings are visible on the public site.
          </p>
        </div>
      </div>

      {/* Owner Assignment (Admin only) */}
      {canAssignOwner && availableUsers.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Owner Assignment
            </h4>

            <div className="space-y-2">
              <Label htmlFor="owner">Assigned Owner</Label>
              <Select
                value={data.owner_id === undefined ? "none" : data.owner_id}
                onValueChange={(value) =>
                  onChange("owner_id", value === "none" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No owner assigned</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.full_name || user.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assigning a listing will automatically grant the owner role if needed.
                Owners can edit their listings but cannot change tier or curation.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Translation Request */}
      {listingId && (isAdmin || isEditor) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Translations
            </h4>
            <p className="text-xs text-muted-foreground">
              Translate this listing into {translationLanguagesText} using AI.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleRequestTranslation}
              disabled={translationLoading}
              className="w-full"
            >
              {translationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating ({TARGET_LANGS.length} languages)…
                </>
              ) : translationDone ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Translation Complete
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Request Translation
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
