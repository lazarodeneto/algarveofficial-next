"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { saveTranslationEdit } from "@/lib/admin/translations/queries";
import type { TranslationJob, ListingRow } from "@/lib/admin/translations/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/admin/translations/types";

interface Props {
  job: TranslationJob | null;
  listing: ListingRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: (jobId: string) => void;
}

export function TranslationEditorDrawer({ job, listing, open, onClose, onSaved }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Reset content when job changes
  useEffect(() => {
    if (job) {
      // In a real implementation, fetch translated content here
      // For now, seed with a placeholder showing job details
      setContent(
        `# Translation: ${listing?.name ?? "Unknown"}\n` +
          `# Language: ${job.target_lang.toUpperCase()}\n` +
          `# Status: ${job.status}\n\n` +
          `# Edit your translation content below:\n\n`,
      );
    }
  }, [job, listing]);

  const handleSave = async () => {
    if (!job) return;
    setSaving(true);
    try {
      await saveTranslationEdit(supabase, job.id, content);
      toast.success("Translation saved and marked as edited.");
      onSaved(job.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save translation.");
    } finally {
      setSaving(false);
    }
  };

  if (!job || !listing) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full max-w-2xl flex-col gap-0 p-0 sm:max-w-2xl"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <SheetTitle className="font-serif text-lg leading-tight">
                {listing.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {listing.city} · {listing.category}
              </SheetDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <TierBadge tier={listing.tier} />
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", STATUS_COLORS[job.status])}
            >
              {STATUS_LABELS[job.status]}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {job.target_lang.toUpperCase()}
            </Badge>
            {job.attempts > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {job.attempts} attempt{job.attempts !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Failed error banner */}
        {job.status === "failed" && job.last_error && (
          <div className="mx-6 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            <span className="font-semibold">Last error: </span>
            {job.last_error}
          </div>
        )}

        {/* Editor */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Translation Content
            </span>
            <span className="text-[11px] text-muted-foreground">
              {content.length} chars
            </span>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none font-mono text-sm leading-relaxed min-h-[400px]"
            placeholder="Enter translation content..."
          />
        </div>

        <Separator className="border-border/60" />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Updated{" "}
            {new Date(job.updated_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save as Edited
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TierBadge({ tier }: { tier: "signature" | "verified" }) {
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
      {tier === "signature" ? "★ Signature" : "Verified"}
    </Badge>
  );
}
