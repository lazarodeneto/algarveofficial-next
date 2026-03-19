import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, CheckCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const EmailSettings = () => {
  const { t } = useTranslation();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "";
  const webhookUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/resend-webhook` : "";
  const isConfigured = webhookUrl.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("admin.emailSettings.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("admin.emailSettings.emailProvider")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Resend</h4>
              <p className="text-sm text-muted-foreground">{t("admin.emailSettings.transactionalApi")}</p>
            </div>
            {isConfigured ? (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t("admin.emailSettings.connected")}
              </Badge>
            ) : (
              <Badge variant="outline">
                {t("admin.emailSettings.notConfigured", "Not configured")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.emailSettings.webhookUrl")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.emailSettings.addWebhookUrl")}</Label>
            <div className="flex gap-2">
              <Input 
                readOnly
                value={webhookUrl || t("admin.emailSettings.missingSupabaseUrl", "Set NEXT_PUBLIC_SUPABASE_URL to generate webhook URL")}
                className="font-mono text-sm"
              />
              <Button 
                variant="outline"
                onClick={() => webhookUrl && navigator.clipboard.writeText(webhookUrl)}
                disabled={!isConfigured}
              >
                {t("admin.emailSettings.copy")}
              </Button>
            </div>
          </div>
          <Button variant="outline" asChild>
            <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              {t("admin.emailSettings.configureInResend")} <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSettings;
