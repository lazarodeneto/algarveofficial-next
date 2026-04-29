import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Heart, Award, Brain, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface WellnessLayoutProps {
  details: Record<string, unknown>;
  bookingUrl?: string;
}

export function WellnessLayout({ details }: WellnessLayoutProps) {
  const { t } = useTranslation();
  const wellnessType = details.wellness_type as string;
  const treatmentsOffered = details.treatments_offered as string[] ?? [];
  const therapistCertifications = details.therapist_certifications as string[] ?? [];
  const medicalSupervision = details.medical_supervision as boolean;
  const detoxPrograms = details.detox_programs as boolean;
  const yogaMeditation = details.yoga_meditation as boolean;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.wellness.wellnessFocus")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="premium-card p-4 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">{t("categoryLayouts.common.type")}</p>
            <p className="font-medium capitalize">{translateCategoryValue(t, wellnessType) || t("categoryLayouts.common.typeFallback.spa")}</p>
          </div>
          {medicalSupervision && (
            <div className="premium-card p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-red-400" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.wellness.medical")}</p>
              <p className="font-medium">{t("categoryLayouts.wellness.supervised")}</p>
            </div>
          )}
          {detoxPrograms && (
            <div className="premium-card p-4 text-center">
              <Leaf className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.wellness.detox")}</p>
              <p className="font-medium">{t("categoryLayouts.wellness.programsAvailable")}</p>
            </div>
          )}
          {yogaMeditation && (
            <div className="premium-card p-4 text-center">
              <Brain className="h-6 w-6 mx-auto mb-2 text-purple-400" />
              <p className="text-sm text-muted-foreground">{t("categoryLayouts.wellness.mindfulness")}</p>
              <p className="font-medium">{t("categoryLayouts.wellness.yogaMeditation")}</p>
            </div>
          )}
        </div>
      </div>

      {treatmentsOffered.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.wellness.treatments")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {treatmentsOffered.map((treatment) => (
              <Card key={treatment} className="p-4 flex items-center gap-3 bg-muted/30">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="capitalize">{translateCategoryValue(t, treatment)}</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {therapistCertifications.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-medium mb-4">{t("categoryLayouts.wellness.therapistCertifications")}</h2>
          <div className="flex flex-wrap gap-3">
            {therapistCertifications.map((cert) => (
              <Badge key={cert} variant="secondary" className="px-4 py-2">
                <Award className="h-4 w-4 mr-2" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
