"use client";

import { m } from "framer-motion";
import { ShieldCheck, Check, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VERIFIED_PARTNER_FEATURES } from "@/lib/partner-subscription-content";

interface ExitIntentModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  isLoading?: boolean;
  verifiedPrice?: string;
}

export function ExitIntentModal({
  open,
  onClose,
  onSubscribe,
  isLoading = false,
  verifiedPrice = "€19",
}: ExitIntentModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-green-500/30 gap-0">
        {/* Header band */}
        <div className="bg-green-500/10 border-b border-green-500/20 px-6 py-5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Verified Partner
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground leading-snug">
            Your profile isn't live yet
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Travelers can't find you. Get verified for{" "}
            <span className="font-semibold text-foreground">{verifiedPrice}/month</span>
            {" "}— less than the cost of a single booking.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4">
          <ul className="space-y-2">
            {VERIFIED_PARTNER_FEATURES.slice(0, 5).map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground/80">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <m.div whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white border border-green-500 shadow-lg shadow-green-600/20"
              size="lg"
              onClick={onSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Start my Verified membership
            </Button>
          </m.div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
