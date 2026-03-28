import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Loader2, 
  MoreHorizontal,
  Send,
  Trash2,
  Edit,
  Play,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useEmailCampaigns, 
  useCreateEmailCampaign, 
  useDeleteEmailCampaign,
  useSendEmailCampaign,
  type EmailCampaignInsert
} from "@/hooks/useEmailCampaigns";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { useEmailSegments } from "@/hooks/useEmailSegments";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const EmailCampaigns = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: campaigns, isLoading } = useEmailCampaigns({ status: statusFilter });
  const { data: templates } = useEmailTemplates({ isActive: true });
  const { data: segments } = useEmailSegments();
  const createCampaign = useCreateEmailCampaign();
  const deleteCampaign = useDeleteEmailCampaign();
  const sendCampaign = useSendEmailCampaign();

  const { register, handleSubmit, reset, setValue } = useForm<EmailCampaignInsert>();

  const onSubmit = (data: EmailCampaignInsert) => {
    createCampaign.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-500/20 text-gray-400",
      scheduled: "bg-blue-500/20 text-blue-400",
      sending: "bg-yellow-500/20 text-yellow-400",
      sent: "bg-green-500/20 text-green-400",
      paused: "bg-orange-500/20 text-orange-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return <Badge className={styles[status] || styles.draft}>{t(`admin.emailCampaigns.status.${status}`, status)}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("admin.emailCampaigns.title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("admin.emailCampaigns.newCampaign")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("admin.emailCampaigns.createNewCampaign")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin.emailCampaigns.campaignNameRequired")}</Label>
                <Input 
                  id="name" 
                  {...register("name", { required: true })} 
                  placeholder={t("admin.emailCampaigns.campaignNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t("admin.emailCampaigns.emailSubjectRequired")}</Label>
                <Input 
                  id="subject" 
                  {...register("subject", { required: true })} 
                  placeholder={t("admin.emailCampaigns.emailSubjectPlaceholder")}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="from_name">{t("admin.emailCampaigns.fromName")}</Label>
                  <Input 
                    id="from_name" 
                    {...register("from_name")} 
                    placeholder="AlgarveOfficial"
                    defaultValue="AlgarveOfficial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_email">{t("admin.emailCampaigns.fromEmailRequired")}</Label>
                  <Input 
                    id="from_email" 
                    type="email"
                    {...register("from_email", { required: true })} 
                    placeholder="info@algarveofficial.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template_id">{t("admin.emailCampaigns.emailTemplate")}</Label>
                <Select onValueChange={(value) => setValue("template_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.emailCampaigns.selectTemplate")} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="segment_id">{t("admin.emailCampaigns.targetSegment")}</Label>
                <Select onValueChange={(value) => setValue("segment_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.emailCampaigns.allSubscribedContacts")} />
                  </SelectTrigger>
                  <SelectContent>
                    {segments?.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.contact_count} contacts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={createCampaign.isPending}>
                  {createCampaign.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("admin.emailCampaigns.createCampaign")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("admin.emailCampaigns.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.emailCampaigns.allCampaigns")}</SelectItem>
              <SelectItem value="draft">{t("admin.emailCampaigns.status.draft")}</SelectItem>
              <SelectItem value="scheduled">{t("admin.emailCampaigns.status.scheduled")}</SelectItem>
              <SelectItem value="sending">{t("admin.emailCampaigns.status.sending")}</SelectItem>
              <SelectItem value="sent">{t("admin.emailCampaigns.status.sent")}</SelectItem>
              <SelectItem value="paused">{t("admin.emailCampaigns.status.paused")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.emailCampaigns.campaigns")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.emailCampaigns.table.campaign")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.status")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.template")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.segment")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.sent")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.opens")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.clicks")}</TableHead>
                  <TableHead>{t("admin.emailCampaigns.table.created")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {campaign.subject}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>{campaign.template?.name || "-"}</TableCell>
                    <TableCell>{campaign.segment?.name || t("admin.emailCampaigns.allContacts")}</TableCell>
                    <TableCell>{campaign.total_sent || 0}</TableCell>
                    <TableCell>
                      {campaign.total_opened || 0}
                      {campaign.total_sent > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({((campaign.total_opened / campaign.total_sent) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {campaign.total_clicked || 0}
                      {campaign.total_sent > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({((campaign.total_clicked / campaign.total_sent) * 100).toFixed(0)}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {campaign.status === "sent" && (
                            <DropdownMenuItem onClick={() => router.push(`/admin/email/reports?campaign=${campaign.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("admin.emailCampaigns.viewReport")}
                            </DropdownMenuItem>
                          )}
                          {campaign.status === "draft" && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit", "Edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => sendCampaign.mutate(campaign.id)}
                                disabled={sendCampaign.isPending}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                {t("admin.emailCampaigns.sendNow")}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteCampaign.mutate(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("common.delete", "Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">{t("admin.emailCampaigns.noCampaignsYet")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("admin.emailCampaigns.noCampaignsDescription")}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                {t("admin.emailCampaigns.createCampaign")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailCampaigns;
