import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Loader2, 
  MoreHorizontal,
  Filter,
  Trash2,
  Edit,
  RefreshCw,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useEmailSegments, 
  useCreateEmailSegment, 
  useDeleteEmailSegment,
  useRefreshSegmentCount,
  type EmailSegmentInsert,
  type SegmentRule
} from "@/hooks/useEmailSegments";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const EmailSegments = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rules, setRules] = useState<SegmentRule[]>([{ field: "tags", operator: "contains", value: "" }]);

  const { data: segments, isLoading } = useEmailSegments();
  const createSegment = useCreateEmailSegment();
  const deleteSegment = useDeleteEmailSegment();
  const refreshCount = useRefreshSegmentCount();

  const { register, handleSubmit, reset } = useForm<{ name: string; description: string }>();

  const onSubmit = (data: { name: string; description: string }) => {
    const validRules = rules.filter(r => r.value !== "");
    createSegment.mutate({
      name: data.name,
      description: data.description,
      rules: validRules,
    } as EmailSegmentInsert, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
        setRules([{ field: "tags", operator: "contains", value: "" }]);
      },
    });
  };

  const updateRule = (index: number, field: keyof SegmentRule, value: unknown) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { field: "tags", operator: "contains", value: "" }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("admin.emailSegments.title")}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("admin.emailSegments.newSegment")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("admin.emailSegments.createAudienceSegment")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("admin.emailSegments.segmentNameRequired")}</Label>
                <Input 
                  id="name" 
                  {...register("name", { required: true })} 
                  placeholder={t("admin.emailSegments.segmentNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea 
                  id="description" 
                  {...register("description")} 
                  placeholder={t("admin.emailSegments.descriptionPlaceholder")}
                  rows={2}
                />
              </div>
              <div className="space-y-3">
                <Label>{t("admin.emailSegments.filterRules")}</Label>
                {rules.map((rule, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select 
                      value={rule.field} 
                      onValueChange={(v) => updateRule(index, "field", v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tags">{t("admin.emailSegments.ruleField.tag")}</SelectItem>
                        <SelectItem value="source">{t("admin.emailSegments.ruleField.source")}</SelectItem>
                        <SelectItem value="status">{t("admin.emailSegments.ruleField.status")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={rule.operator} 
                      onValueChange={(v) => updateRule(index, "operator", v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">{t("admin.emailSegments.ruleOperator.contains")}</SelectItem>
                        <SelectItem value="equals">{t("admin.emailSegments.ruleOperator.equals")}</SelectItem>
                        <SelectItem value="not_equals">{t("admin.emailSegments.ruleOperator.notEquals")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      value={rule.value as string}
                      onChange={(e) => updateRule(index, "value", e.target.value)}
                      placeholder={t("admin.emailSegments.value")}
                      className="flex-1"
                    />
                    {rules.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addRule}>
                  <Plus className="h-4 w-4 mr-1" /> {t("admin.emailSegments.addRule")}
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createSegment.isPending}>
                  {createSegment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("admin.emailSegments.createSegment")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.emailSegments.segments")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : segments && segments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.emailSegments.table.name")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                  <TableHead>{t("admin.emailSegments.table.rules")}</TableHead>
                  <TableHead>{t("admin.emailSegments.table.contacts")}</TableHead>
                  <TableHead>{t("admin.emailSegments.table.type")}</TableHead>
                  <TableHead>{t("admin.emailSegments.table.created")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium">{segment.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {segment.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t("admin.emailSegments.ruleCount", { count: segment.rules.length })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {segment.contact_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      {segment.is_dynamic ? (
                        <Badge className="bg-blue-500/20 text-blue-400">{t("admin.emailSegments.dynamic")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("admin.emailSegments.static")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(segment.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => refreshCount.mutate(segment.id)}
                            disabled={refreshCount.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("admin.emailSegments.refreshCount")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteSegment.mutate(segment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("common.delete")}
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
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">{t("admin.emailSegments.noSegmentsYet")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("admin.emailSegments.noSegmentsDescription")}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                {t("admin.emailSegments.createSegment")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSegments;
