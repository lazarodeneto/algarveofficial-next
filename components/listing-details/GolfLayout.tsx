import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LandPlot,
  Flag,
  Trophy,
  Waves,
  PencilLine,
  BookOpen,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface GolfLayoutProps {
  details: Record<string, unknown>;
}

export function GolfLayout({ details }: GolfLayoutProps) {
  const { t } = useTranslation();
  const golfType = details.golf_type as string;
  const holes = details.holes as number;
  const courseStyle = details.course_style as string;
  const oceanView = details.ocean_view as boolean;
  const designer = details.designer as string;
  const handicapRequired = details.handicap_required as boolean;
  const lessonsAvailable = details.lessons_available as boolean;
  const equipmentRental = details.equipment_rental as boolean;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.golf.courseOverview")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card p-4 text-center">
            <LandPlot className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, golfType) || t("categoryLayouts.common.typeFallback.course")}</p>
          </div>
          {holes && (
            <div className="luxury-card p-4 text-center">
              <Flag className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.golf.holes")}</p>
              <p className="font-medium">{holes}</p>
            </div>
          )}
          {courseStyle && (
            <div className="luxury-card p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.golf.style")}</p>
              <p className="font-medium capitalize">{translateCategoryValue(t, courseStyle)}</p>
            </div>
          )}
          {oceanView && (
            <div className="luxury-card p-4 text-center">
              <Waves className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.golf.view")}</p>
              <p className="font-medium">{t("categoryLayouts.golf.oceanView")}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.golf.courseDetails")}</h2>
        <div className="flex flex-wrap gap-3">
          {designer && (
            <Badge variant="secondary" className="px-4 py-2">
              <PencilLine className="h-4 w-4 mr-2" />
              {t("categoryLayouts.golf.designedBy", { name: designer })}
            </Badge>
          )}
          {handicapRequired && (
            <Badge variant="outline" className="px-4 py-2">
              {t("categoryLayouts.golf.handicapRequired")}
            </Badge>
          )}
          {lessonsAvailable && (
            <Badge variant="secondary" className="px-4 py-2">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("categoryLayouts.golf.lessonsAvailable")}
            </Badge>
          )}
          {equipmentRental && (
            <Badge variant="secondary" className="px-4 py-2">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("categoryLayouts.golf.equipmentRental")}
            </Badge>
          )}
        </div>
      </div>

      <div className="luxury-card p-6 bg-gradient-to-br from-green-900/20 to-green-950/30 border-green-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-serif font-medium">{t("categoryLayouts.golf.readyToPlay")}</h3>
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.golf.bookTeeTimeSubtext")}</p>
          </div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <Calendar className="h-4 w-4 mr-2" />
            {t("categoryLayouts.golf.bookTeeTime")}
          </Button>
        </div>
      </div>
    </div>
  );
}
