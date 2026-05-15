"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getTranslationEditorData,
  saveManualTranslation,
  TranslationAdminApiError,
  type ManualTranslationPayload,
  type TranslationEditorData,
} from "@/lib/admin/translations/queries";
import type { TranslationJob, ListingRow } from "@/lib/admin/translations/types";
import { STATUS_COLORS, STATUS_LABELS, type TranslationStatus } from "@/lib/admin/translations/types";

interface Props {
  job: TranslationJob | null;
  listing: ListingRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: (jobId: string) => void;
}

type FieldKey = keyof ManualTranslationPayload;

const TRANSLATABLE_FIELDS: Array<{
  key: FieldKey;
  label: string;
  sourceKey: "name" | "short_description" | "description" | "meta_title" | "meta_description";
  multiline?: boolean;
}> = [
  { key: "title", label: "Title", sourceKey: "name" },
  { key: "short_description", label: "Short description", sourceKey: "short_description", multiline: true },
  { key: "description", label: "Full description", sourceKey: "description", multiline: true },
  { key: "seo_title", label: "SEO title", sourceKey: "meta_title" },
  { key: "seo_description", label: "SEO description", sourceKey: "meta_description", multiline: true },
];

const EMPTY_FORM: Record<FieldKey, string> = {
  title: "",
  short_description: "",
  description: "",
  seo_title: "",
  seo_description: "",
};

function formatDateTime(value?: string | null) {
  if (!value) return "Not saved";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clean(value?: string | null) {
  return value?.trim() ?? "";
}

function toPayload(form: Record<FieldKey, string>): ManualTranslationPayload {
  return {
    title: clean(form.title) || null,
    short_description: clean(form.short_description) || null,
    description: clean(form.description) || null,
    seo_title: clean(form.seo_title) || null,
    seo_description: clean(form.seo_description) || null,
  };
}

function getRequiredFields(detail: TranslationEditorData | null): FieldKey[] {
  if (!detail?.listing) return ["title"];
  const required: FieldKey[] = ["title"];
  if (clean(detail.listing.short_description)) required.push("short_description");
  if (clean(detail.listing.description)) required.push("description");
  if (clean(detail.listing.meta_title)) required.push("seo_title");
  if (clean(detail.listing.meta_description)) required.push("seo_description");
  return required;
}

function fieldLabel(key: FieldKey) {
  return TRANSLATABLE_FIELDS.find((field) => field.key === key)?.label ?? key;
}

function TierBadge({ tier }: { tier: string }) {
  const label =
    tier === "signature" ? "★ Signature" : tier === "verified" ? "Verified" : "Unverified";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold",
        tier === "signature"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
          : "border-blue-500/30 bg-blue-500/10 text-blue-400",
      )}
    >
      {label}
    </Badge>
  );
}

export function TranslationEditorDrawer({ job, listing, open, onClose, onSaved }: Props) {
  const [detail, setDetail] = useState<TranslationEditorData | null>(null);
  const [form, setForm] = useState<Record<FieldKey, string>>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"edited" | "reviewed" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !job) return;

    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);
    setDetail(null);
    setForm(EMPTY_FORM);

    getTranslationEditorData(job.id)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setForm({
          title: data.translation?.title ?? "",
          short_description: data.translation?.short_description ?? "",
          description: data.translation?.description ?? "",
          seo_title: data.translation?.seo_title ?? "",
          seo_description: data.translation?.seo_description ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Translation editor could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [job, open]);

  const requiredFields = useMemo(() => getRequiredFields(detail), [detail]);
  const missingRequiredFields = useMemo(
    () => requiredFields.filter((field) => !clean(form[field])),
    [form, requiredFields],
  );

  if (!job || !listing) return null;

  const sourceListing = detail?.listing;
  const status = (detail?.translation?.translation_status ?? job.status) as TranslationStatus;
  const lastSavedAt = detail?.translation?.updated_at ?? null;

  const handleSave = async (saveStatus: "edited" | "reviewed") => {
    if (!detail?.job?.listing_id || !detail.job.target_lang) return;
    if (saveStatus === "reviewed" && missingRequiredFields.length > 0) {
      toast.error(`Missing required fields: ${missingRequiredFields.map(fieldLabel).join(", ")}.`);
      return;
    }

    setSavingStatus(saveStatus);
    try {
      await saveManualTranslation({
        listingId: detail.job.listing_id,
        targetLang: detail.job.target_lang,
        translation: toPayload(form),
        saveStatus,
      });
      toast.success(saveStatus === "reviewed" ? "Translation saved as reviewed." : "Translation draft saved.");
      onSaved(detail.job.id);
      onClose();
    } catch (err) {
      const message =
        err instanceof TranslationAdminApiError || err instanceof Error
          ? err.message
          : "Translation could not be saved.";
      toast.error(message);
    } finally {
      setSavingStatus(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-5xl flex-col gap-0 p-0 sm:max-w-5xl"
      >
        <SheetHeader className="border-b border-border/60 px-6 py-4">
          <div className="min-w-0 pr-10">
            <SheetTitle className="truncate font-serif text-lg leading-tight">
              {listing.name}
            </SheetTitle>
            <SheetDescription className="mt-1 text-xs text-muted-foreground">
              {listing.city || "No city"} · English source to {job.target_lang.toUpperCase()}
            </SheetDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <TierBadge tier={listing.tier} />
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", STATUS_COLORS[status])}
            >
              {STATUS_LABELS[status]}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {job.target_lang.toUpperCase()}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              Last saved: {formatDateTime(lastSavedAt)}
            </span>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading translation
          </div>
        ) : errorMessage ? (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <>
            <div className="border-b border-border/50 px-6 py-3">
              {missingRequiredFields.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Missing required fields:</span>
                  {missingRequiredFields.map((field) => (
                    <Badge
                      key={field}
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-300"
                    >
                      {fieldLabel(field)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Required fields complete
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid gap-4">
                {TRANSLATABLE_FIELDS.map((field) => {
                  const sourceValue = clean(sourceListing?.[field.sourceKey]);
                  const isRequired = requiredFields.includes(field.key);
                  const isMissing = missingRequiredFields.includes(field.key);

                  return (
                    <section
                      key={field.key}
                      className={cn(
                        "grid gap-3 rounded-sm border border-border/50 bg-card/40 p-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]",
                        isMissing && "border-amber-500/35",
                      )}
                    >
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Source {field.label}
                          </Label>
                          {isRequired ? (
                            <Badge variant="outline" className="text-[10px]">
                              Required
                            </Badge>
                          ) : null}
                        </div>
                        <div className="min-h-10 whitespace-pre-wrap rounded-sm border border-border/40 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                          {sourceValue || "No source content"}
                        </div>
                      </div>

                      <div className="min-w-0 space-y-2">
                        <Label
                          htmlFor={`manual-translation-${field.key}`}
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          {field.label}
                        </Label>
                        {field.multiline ? (
                          <Textarea
                            id={`manual-translation-${field.key}`}
                            value={form[field.key]}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))
                            }
                            className={cn(
                              "min-h-28 resize-y text-sm leading-relaxed",
                              field.key === "description" && "min-h-44",
                            )}
                          />
                        ) : (
                          <Input
                            id={`manual-translation-${field.key}`}
                            value={form[field.key]}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            <Separator className="border-border/60" />

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div className="text-xs text-muted-foreground">
                Current status: <span className="font-medium text-foreground">{STATUS_LABELS[status]}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={savingStatus !== null}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleSave("edited")}
                  disabled={savingStatus !== null}
                  className="gap-1.5"
                >
                  {savingStatus === "edited" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save draft
                </Button>
                <Button
                  size="sm"
                  onClick={() => void handleSave("reviewed")}
                  disabled={savingStatus !== null || missingRequiredFields.length > 0}
                  className="gap-1.5"
                >
                  {savingStatus === "reviewed" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Save reviewed
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
