import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Mail, 
  MousePointer, 
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { useCampaignReport } from "@/hooks/useEmailStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const EmailReports = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCampaignId = searchParams.get("campaign") || undefined;

  const { data: campaigns, isLoading: campaignsLoading } = useEmailCampaigns({ status: "sent" });
  const { data: report, isLoading: reportLoading } = useCampaignReport(selectedCampaignId);

  const handleCampaignChange = (campaignId: string) => {
    setSearchParams({ campaign: campaignId });
  };

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("admin.emailReports.title")}</h1>
        <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t("admin.emailReports.selectCampaign")} />
          </SelectTrigger>
          <SelectContent>
            {campaigns?.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCampaignId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("admin.emailReports.selectCampaignTitle")}</h3>
              <p className="text-muted-foreground">
                {t("admin.emailReports.selectCampaignDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : reportLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : report ? (
        <>
          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle>{report.campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.emailReports.subject")}</p>
                  <p className="font-medium">{report.campaign.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.emailReports.sentAt")}</p>
                  <p className="font-medium">
                    {report.campaign.sent_at 
                      ? format(new Date(report.campaign.sent_at), "MMM d, yyyy 'at' h:mm a")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("admin.emailReports.recipients")}</p>
                  <p className="font-medium">{report.campaign.total_recipients || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.emailReports.emailsSent")}</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.campaign.total_sent || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.emailReports.deliveredCount", { count: report.campaign.total_delivered || 0 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.emailReports.openRate")}</CardTitle>
                {report.metrics.openRate > 20 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.metrics.openRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.emailReports.opensCount", { count: report.campaign.total_opened || 0 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.emailReports.clickRate")}</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.metrics.clickRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.emailReports.clicksCount", { count: report.campaign.total_clicked || 0 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.emailReports.bounceRate")}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.metrics.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {t("admin.emailReports.bouncesCount", { count: report.campaign.total_bounced || 0 })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Events Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.emailReports.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent>
              {report.events && report.events.length > 0 ? (
                <div className="space-y-4">
                  {report.events.slice(0, 20).map((event) => (
                    <div key={event.id} className="flex items-center gap-4 text-sm">
                      <div className="w-24 text-muted-foreground">
                        {format(new Date(event.created_at), "MMM d, h:mm a")}
                      </div>
                      <div className="flex-1">
                        <span className="capitalize font-medium">{event.event_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t("admin.emailReports.noEvents")}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("admin.emailReports.reportNotFound")}</h3>
              <p className="text-muted-foreground">
                {t("admin.emailReports.reportNotFoundDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailReports;
