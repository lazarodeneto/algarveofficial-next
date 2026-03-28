import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Send, Mail, MousePointer, Loader2, Plus } from "lucide-react";
import { useEmailStats, useRecentCampaignActivity } from "@/hooks/useEmailStats";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useLocalePath } from "@/hooks/useLocalePath";

const EmailMarketingOverview = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const l = useLocalePath();
  const { data: stats, isLoading } = useEmailStats();
  const { data: recentCampaigns } = useRecentCampaignActivity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("admin.emailOverview.title")}</h1>
        <Button onClick={() => router.push(l("/admin/email/campaigns"))} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.emailOverview.newCampaign")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.emailOverview.totalContacts")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("admin.emailOverview.subscribedCount", { count: stats?.subscribedContacts || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.emailOverview.emailsSent")}</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmailsSent || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t("admin.emailOverview.campaigns30d", { count: stats?.campaignsSent30d || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.emailOverview.openRate")}</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgOpenRate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin.emailOverview.clickRate")}</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgClickRate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.emailOverview.recentCampaigns")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCampaigns?.length ? (
            <div className="space-y-3">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.sent_at
                        ? format(new Date(c.sent_at), "MMM d, yyyy")
                        : t("admin.emailOverview.notSent")}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>{t("admin.emailOverview.sentCount", { count: c.total_sent || 0 })}</span>
                    <span>{t("admin.emailOverview.opensCount", { count: c.total_opened || 0 })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t("admin.emailOverview.noCampaignsYet")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailMarketingOverview;
