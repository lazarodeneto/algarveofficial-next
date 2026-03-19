import { Badge } from "@/components/ui/badge";
import { Ruler, Award, Leaf, Globe, Users, Building2, Palette, CheckCircle, Video, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateCategoryValue } from "@/lib/translateCategoryValue";

interface ArchitectureDecorationDetails {
  service_focus?: string; project_types?: string[]; design_style?: string[]; service_scope?: string;
  years_experience?: number; awards_recognition?: string; portfolio_highlights?: string;
  sustainability_focus?: boolean; languages?: string[]; service_area?: string[];
  certifications?: string; team_size?: string; consultation_available?: boolean; virtual_services?: boolean;
}

interface ArchitectureDecorationLayoutProps {
  details: ArchitectureDecorationDetails; bookingUrl?: string;
}

export const ArchitectureDecorationLayout = ({ details, bookingUrl }: ArchitectureDecorationLayoutProps) => {
  const { t } = useTranslation();
  const { service_focus, project_types, design_style, service_scope, years_experience, awards_recognition, portfolio_highlights, sustainability_focus, languages, service_area, certifications, team_size, consultation_available, virtual_services } = details;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {service_focus && (
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <Ruler className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("categoryLayouts.architecture.serviceFocus")}</p>
            <p className="font-medium text-foreground">{translateCategoryValue(t, service_focus)}</p>
          </div>
        )}
        {service_scope && (
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("categoryLayouts.architecture.serviceScope")}</p>
            <p className="font-medium text-foreground">{translateCategoryValue(t, service_scope)}</p>
          </div>
        )}
        {years_experience && (
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("categoryLayouts.architecture.experience")}</p>
            <p className="font-medium text-foreground">{t("categoryLayouts.architecture.yearsCount", { count: years_experience })}</p>
          </div>
        )}
        {team_size && (
          <div className="bg-card/50 border border-border rounded-lg p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("categoryLayouts.architecture.teamSize")}</p>
            <p className="font-medium text-foreground">{translateCategoryValue(t, team_size)}</p>
          </div>
        )}
      </div>

      {project_types && project_types.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.projectTypes")}</h3>
          <div className="flex flex-wrap gap-2">{project_types.map((type, index) => (<Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{translateCategoryValue(t, type)}</Badge>))}</div>
        </div>
      )}

      {design_style && design_style.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.designStyles")}</h3>
          <div className="flex flex-wrap gap-2">{design_style.map((style, index) => (<Badge key={index} variant="outline" className="border-muted-foreground/30">{translateCategoryValue(t, style)}</Badge>))}</div>
        </div>
      )}

      {(sustainability_focus || consultation_available || virtual_services) && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.serviceFeatures")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sustainability_focus && (<div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-lg"><Leaf className="h-4 w-4" /><span className="text-sm font-medium">{t("categoryLayouts.architecture.sustainabilityFocus")}</span></div>)}
            {consultation_available && (<div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-lg"><MessageSquare className="h-4 w-4" /><span className="text-sm font-medium">{t("categoryLayouts.architecture.freeConsultation")}</span></div>)}
            {virtual_services && (<div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg"><Video className="h-4 w-4" /><span className="text-sm font-medium">{t("categoryLayouts.architecture.virtualServices")}</span></div>)}
          </div>
        </div>
      )}

      {awards_recognition && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.awardsRecognition")}</h3>
          <div className="bg-card/50 border border-border rounded-lg p-4"><p className="text-muted-foreground whitespace-pre-line">{awards_recognition}</p></div>
        </div>
      )}

      {portfolio_highlights && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.portfolioHighlights")}</h3>
          <div className="bg-card/50 border border-border rounded-lg p-4"><p className="text-muted-foreground whitespace-pre-line">{portfolio_highlights}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {languages && languages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />{t("categoryLayouts.privateChef.languages")}</h3>
            <div className="flex flex-wrap gap-2">{languages.map((lang, index) => (<Badge key={index} variant="outline" className="border-muted-foreground/30">{translateCategoryValue(t, lang)}</Badge>))}</div>
          </div>
        )}
        {service_area && service_area.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.serviceArea")}</h3>
            <div className="flex flex-wrap gap-2">{service_area.map((area, index) => (<Badge key={index} variant="secondary" className="bg-muted">{area}</Badge>))}</div>
          </div>
        )}
      </div>

      {certifications && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" />{t("categoryLayouts.architecture.professionalCertifications")}</h3>
          <p className="text-muted-foreground">{certifications}</p>
        </div>
      )}

    </div>
  );
};
