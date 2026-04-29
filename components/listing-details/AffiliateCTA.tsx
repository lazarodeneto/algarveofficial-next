import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";

interface AffiliateCTAProps {
  bookingUrl?: string;
  onInquire?: () => void;
  headline: string;
  subtext: string;
  buttonText: string;
  Icon: LucideIcon;
  gradientClass?: string;
}

export function AffiliateCTA({
  bookingUrl,
  onInquire,
  headline,
  subtext,
  buttonText,
  Icon,
  gradientClass = "from-primary/10 to-primary/5",
}: AffiliateCTAProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(
      "premium-card p-6 bg-gradient-to-br border-primary/20",
      gradientClass
    )}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-serif font-medium">{headline}</h3>
          <p className="text-sm text-muted-foreground mt-1">{subtext}</p>
        </div>
        {bookingUrl ? (
          <a 
            href={bookingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button size="lg" className="gap-2">
              <Icon className="h-4 w-4" />
              {buttonText}
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        ) : onInquire ? (
          <Button size="lg" onClick={onInquire} className="shrink-0 gap-2">
            <MessageCircle className="h-4 w-4" />
            {t("categoryLayouts.common.inquireNow")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
