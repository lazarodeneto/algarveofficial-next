import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, CheckCircle, Loader2, Pencil, Trash2, Pause, Play, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type AutomationStatus = Database["public"]["Enums"]["automation_status"];
type AutomationTriggerType = Database["public"]["Enums"]["automation_trigger_type"];

interface Automation {
  id: string;
  name: string;
  description: string | null;
  trigger_type: AutomationTriggerType;
  status: AutomationStatus;
  total_enrolled: number | null;
  total_completed: number | null;
  created_at: string;
  steps: Database["public"]["Tables"]["email_automations"]["Row"]["steps"];
}

interface AutomationForm {
  id?: string;
  name: string;
  description: string;
  trigger_type: AutomationTriggerType;
  status: AutomationStatus;
}

const EMPTY_FORM: AutomationForm = {
  name: "",
  description: "",
  trigger_type: "manual",
  status: "draft",
};

const EmailAutomations = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<AutomationForm>(EMPTY_FORM);

  const { data: automations, isLoading } = useQuery({
    queryKey: ["email-automations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_automations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Automation[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: AutomationForm) => {
      const { error } = await supabase.from("email_automations").insert({
        name: payload.name.trim(),
        description: payload.description.trim() || null,
        trigger_type: payload.trigger_type,
        status: payload.status,
        steps: [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-automations"] });
      setIsDialogOpen(false);
      setForm(EMPTY_FORM);
      toast.success(t("admin.emailAutomations.toastCreated"));
    },
    onError: (error: Error) => {
      toast.error(t("admin.emailAutomations.toastCreateFailed", { message: error.message }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: AutomationForm & { id: string }) => {
      const { error } = await supabase
        .from("email_automations")
        .update({
          name: payload.name.trim(),
          description: payload.description.trim() || null,
          trigger_type: payload.trigger_type,
          status: payload.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payload.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-automations"] });
      setIsDialogOpen(false);
      setForm(EMPTY_FORM);
      toast.success(t("admin.emailAutomations.toastUpdated"));
    },
    onError: (error: Error) => {
      toast.error(t("admin.emailAutomations.toastUpdateFailed", { message: error.message }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_automations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-automations"] });
      toast.success(t("admin.emailAutomations.toastDeleted"));
    },
    onError: (error: Error) => {
      toast.error(t("admin.emailAutomations.toastDeleteFailed", { message: error.message }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AutomationStatus }) => {
      const { error } = await supabase
        .from("email_automations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-automations"] });
    },
    onError: (error: Error) => {
      toast.error(t("admin.emailAutomations.toastStatusFailed", { message: error.message }));
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const triggerOptions = useMemo(
    () => [
      { value: "manual" as AutomationTriggerType, label: t("admin.emailAutomations.triggerOption.manual") },
      { value: "signup" as AutomationTriggerType, label: t("admin.emailAutomations.triggerOption.signup") },
      { value: "tag_added" as AutomationTriggerType, label: t("admin.emailAutomations.triggerOption.tagAdded") },
      { value: "segment_joined" as AutomationTriggerType, label: t("admin.emailAutomations.triggerOption.segmentJoined") },
      { value: "date_based" as AutomationTriggerType, label: t("admin.emailAutomations.triggerOption.dateBased") },
    ],
    [t],
  );

  const getStatusBadge = (status: AutomationStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">{t("admin.emailAutomations.status.active")}</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/20 text-yellow-400">{t("admin.emailAutomations.status.paused")}</Badge>;
      default:
        return <Badge variant="secondary">{t("admin.emailAutomations.status.draft")}</Badge>;
    }
  };

  const getTriggerLabel = (trigger: AutomationTriggerType) => {
    const found = triggerOptions.find((option) => option.value === trigger);
    return found?.label ?? trigger;
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (automation: Automation) => {
    setFormMode("edit");
    setForm({
      id: automation.id,
      name: automation.name,
      description: automation.description ?? "",
      trigger_type: automation.trigger_type,
      status: automation.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error(t("admin.emailAutomations.nameRequired"));
      return;
    }

    if (formMode === "create") {
      createMutation.mutate(form);
      return;
    }

    if (!form.id) {
      toast.error(t("admin.emailAutomations.missingId"));
      return;
    }

    updateMutation.mutate({ ...form, id: form.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("admin.emailAutomations.title")}</h1>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          {t("admin.emailAutomations.newAutomation")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t("admin.emailAutomations.automatedWorkflows")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : automations && automations.length > 0 ? (
            <div className="space-y-4">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{automation.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.emailAutomations.triggerLabel")}: {getTriggerLabel(automation.trigger_type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{automation.total_enrolled || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.emailAutomations.enrolled")}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{automation.total_completed || 0}</p>
                      <p className="text-xs text-muted-foreground">{t("admin.emailAutomations.completed")}</p>
                    </div>
                    {getStatusBadge(automation.status)}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(automation)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {automation.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatusMutation.mutate({ id: automation.id, status: "paused" })}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatusMutation.mutate({ id: automation.id, status: "active" })}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(t("admin.emailAutomations.confirmDelete", { name: automation.name }))) {
                            deleteMutation.mutate(automation.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("admin.emailAutomations.noAutomationsYet")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("admin.emailAutomations.noAutomationsDescription")}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("admin.emailAutomations.exampleWelcome")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("admin.emailAutomations.exampleOnboarding")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("admin.emailAutomations.exampleReengagement")}
                </div>
              </div>
              <Button className="mt-6" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.emailAutomations.createFirstAutomation")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? t("admin.emailAutomations.createAutomation") : t("admin.emailAutomations.editAutomation")}</DialogTitle>
            <DialogDescription>
              {t("admin.emailAutomations.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="automation-name">{t("admin.emailAutomations.name")}</Label>
              <Input
                id="automation-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t("admin.emailAutomations.namePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="automation-description">{t("admin.emailAutomations.description")}</Label>
              <Textarea
                id="automation-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={t("admin.emailAutomations.descriptionPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("admin.emailAutomations.trigger")}</Label>
              <Select
                value={form.trigger_type}
                onValueChange={(value) => setForm((prev) => ({ ...prev, trigger_type: value as AutomationTriggerType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.emailAutomations.selectTrigger")} />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.emailAutomations.statusLabel")}</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as AutomationStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.emailAutomations.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("admin.emailAutomations.status.draft")}</SelectItem>
                  <SelectItem value="active">{t("admin.emailAutomations.status.active")}</SelectItem>
                  <SelectItem value="paused">{t("admin.emailAutomations.status.paused")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {formMode === "create" ? t("common.create", "Create") : t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailAutomations;
