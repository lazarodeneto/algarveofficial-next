import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Ticket, Users, Calendar, Zap, Crown, Star, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface FamilyFunLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function FamilyFunLayout({ details, bookingUrl }: FamilyFunLayoutProps) {
  const { t } = useTranslation();
  const attractionType = details.attraction_type as string;
  const ageRange = details.age_range as string;
  const ticketType = details.ticket_type as string;
  const fastTrack = details.fast_track as boolean;
  const groupDiscounts = details.group_discounts as boolean;
  const seasonalAvailability = details.seasonal_availability as string;
  const ticketTypeIcons: Record<string, LucideIcon> = {
    vip: Crown,
    premium: Star,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.family.attractionDetails")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, attractionType) || t("categoryLayouts.common.typeFallback.attraction")}</p>
          </div>
          {ticketType && (
            <div className="luxury-card p-4 text-center">
              {(() => {
                const TicketTypeIcon = ticketTypeIcons[ticketType] ?? Ticket;
                return <TicketTypeIcon className="h-6 w-6 mx-auto mb-2 text-primary" />;
              })()}
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.family.ticketType")}</p>
              <p className="font-medium capitalize">{translateCategoryValue(t, ticketType)}</p>
            </div>
          )}
          {ageRange && (
            <div className="luxury-card p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.family.ageRange")}</p>
              <p className="font-medium">{ageRange}</p>
            </div>
          )}
          {seasonalAvailability && (
            <div className="luxury-card p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.family.season")}</p>
              <p className="font-medium capitalize">{seasonalAvailability}</p>
            </div>
          )}
        </div>
      </div>

      {ageRange && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.family.whoItsFor")}</h2>
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-950/30 border-blue-500/20">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <h3 className="text-lg font-serif font-medium">{t("categoryLayouts.family.familyFriendly")}</h3>
                <p className="text-sm text-muted-foreground">{t("categoryLayouts.family.suitableForAges", { ages: ageRange })}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.family.specialFeatures")}</h2>
        <div className="flex flex-wrap gap-3">
          {fastTrack && <Badge variant="secondary" className="px-4 py-2"><Zap className="h-4 w-4 mr-2" />{t("categoryLayouts.family.fastTrack")}</Badge>}
          {groupDiscounts && <Badge variant="secondary" className="px-4 py-2"><Users className="h-4 w-4 mr-2" />{t("categoryLayouts.family.groupDiscounts")}</Badge>}
          {ticketType === "premium" && <Badge variant="secondary" className="px-4 py-2"><Ticket className="h-4 w-4 mr-2" />{t("categoryLayouts.family.premiumExperience")}</Badge>}
          {ticketType === "vip" && (
            <Badge className="px-4 py-2 bg-primary text-primary-foreground">
              <Crown className="h-4 w-4 mr-2" />
              {t("categoryLayouts.family.vipAccess")}
            </Badge>
          )}
        </div>
      </div>

    </div>
  );
}
