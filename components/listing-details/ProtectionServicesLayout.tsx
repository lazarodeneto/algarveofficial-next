import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, MapPin, Clock, Award, Car, UserCheck, Languages, FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface ProtectionServicesLayoutProps {
  details: Record<string, unknown>; bookingUrl?: string;
}

export function ProtectionServicesLayout({ details }: ProtectionServicesLayoutProps) {
  const { t } = useTranslation();
  const protectionType = details.protection_type as string;
  const serviceScope = details.service_scope as string;
  const licensingCertification = details.licensing_certification as string;
  const languagesSupported = details.languages_supported as string[] | undefined;
  const serviceArea = details.service_area as string[] | undefined;
  const teamExperienceYears = details.team_experience_years as number | undefined;
  const backgroundProfile = details.background_profile as string | undefined;
  const discreetUniform = details.discreet_uniform as boolean | undefined;
  const secureTransportAvailable = details.secure_transport_available as boolean | undefined;
  const coordinationWithConcierge = details.coordination_with_concierge as boolean | undefined;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-medium mb-6 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />{t("categoryLayouts.protection.protectionOverview")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protectionType && (<div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t("categoryLayouts.protection.protectionType")}</p><p className="font-medium">{translateCategoryValue(t, protectionType)}</p></div></div>)}
          {serviceScope && (<div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t("categoryLayouts.protection.serviceScope")}</p><p className="font-medium">{translateCategoryValue(t, serviceScope)}</p></div></div>)}
          {teamExperienceYears && (<div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><Clock className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t("categoryLayouts.protection.teamExperience")}</p><p className="font-medium">{t("categoryLayouts.protection.yearsPlus", { count: teamExperienceYears })}</p></div></div>)}
          {backgroundProfile && (<div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><UserCheck className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t("categoryLayouts.protection.backgroundProfile")}</p><p className="font-medium">{translateCategoryValue(t, backgroundProfile)}</p></div></div>)}
        </div>
      </div>
      <Separator />

      {licensingCertification && (<><div><h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />{t("categoryLayouts.protection.licensingCertification")}</h2><p className="text-muted-foreground">{licensingCertification}</p></div><Separator /></>)}

      {(discreetUniform || secureTransportAvailable || coordinationWithConcierge) && (<><div><h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-primary" />{t("categoryLayouts.protection.serviceCapabilities")}</h2><div className="flex flex-wrap gap-3">
        {discreetUniform && <Badge variant="secondary" className="text-sm py-1.5 px-3"><UserCheck className="h-3.5 w-3.5 mr-1.5" />{t("categoryLayouts.protection.discreetUniform")}</Badge>}
        {secureTransportAvailable && <Badge variant="secondary" className="text-sm py-1.5 px-3"><Car className="h-3.5 w-3.5 mr-1.5" />{t("categoryLayouts.protection.secureTransportation")}</Badge>}
        {coordinationWithConcierge && <Badge variant="secondary" className="text-sm py-1.5 px-3"><Users className="h-3.5 w-3.5 mr-1.5" />{t("categoryLayouts.protection.conciergeCoordination")}</Badge>}
      </div></div><Separator /></>)}

      {languagesSupported && languagesSupported.length > 0 && (<><div><h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2"><Languages className="h-5 w-5 text-primary" />{t("categoryLayouts.protection.languagesSupported")}</h2><div className="flex flex-wrap gap-2">{languagesSupported.map((lang) => (<Badge key={lang} variant="outline" className="text-sm">{lang}</Badge>))}</div></div><Separator /></>)}

      {serviceArea && serviceArea.length > 0 && (<div><h2 className="text-xl font-serif font-medium mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />{t("categoryLayouts.protection.serviceArea")}</h2><div className="flex flex-wrap gap-2">{serviceArea.map((area) => (<Badge key={area} variant="outline" className="text-sm">{area}</Badge>))}</div></div>)}

    </div>
  );
}
