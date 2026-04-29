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
import { 
  Users, 
  Plus, 
  Search, 
  Upload, 
  Loader2, 
  MoreHorizontal,
  Mail,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useEmailContacts, 
  useEmailContactStats, 
  useCreateEmailContact, 
  useDeleteEmailContact,
  useImportEmailContacts,
  type EmailContactInsert
} from "@/hooks/useEmailContacts";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const EmailContacts = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { data: contacts, isLoading } = useEmailContacts({ 
    search: search || undefined, 
    status: statusFilter 
  });
  const { data: stats } = useEmailContactStats();
  const createContact = useCreateEmailContact();
  const deleteContact = useDeleteEmailContact();
  const importContacts = useImportEmailContacts();

  const { register, handleSubmit, reset } = useForm<EmailContactInsert>();

  const onSubmitContact = (data: EmailContactInsert) => {
    createContact.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        reset();
      },
    });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].toLowerCase().split(",").map(h => h.trim());

      const emailIndex = headers.indexOf("email");
      const nameIndex = headers.indexOf("name") !== -1 ? headers.indexOf("name") : headers.indexOf("full_name");

      if (emailIndex === -1) {
        toast({
          title: t("admin.emailContacts.invalidCsv"),
          description: t("admin.emailContacts.invalidCsvDescription"),
          variant: "destructive",
        });
        return;
      }

      const importData: EmailContactInsert[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        if (values[emailIndex]) {
          importData.push({
            email: values[emailIndex],
            full_name: nameIndex !== -1 ? values[nameIndex] : undefined,
            source: "csv_import",
          });
        }
      }

      if (importData.length > 0) {
        importContacts.mutate(importData, {
          onSuccess: () => {
            setIsImportDialogOpen(false);
          },
        });
      } else {
        toast({
          title: t("admin.emailContacts.noValidContacts"),
          description: t("admin.emailContacts.noValidContactsDescription"),
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "subscribed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t("admin.emailContacts.status.subscribed")}</Badge>;
      case "unsubscribed":
        return <Badge variant="secondary">{t("admin.emailContacts.status.unsubscribed")}</Badge>;
      case "bounced":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{t("admin.emailContacts.status.bounced")}</Badge>;
      case "complained":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{t("admin.emailContacts.status.complained")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("admin.emailContacts.title")}</h1>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                {t("admin.emailContacts.importCsv")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("admin.emailContacts.importContactsFromCsv")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("admin.emailContacts.importCsvHint")}
                </p>
                <Input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleImportCSV}
                  disabled={importContacts.isPending}
                />
                {importContacts.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("admin.emailContacts.importingContacts")}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("admin.emailContacts.addContact")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("admin.emailContacts.addNewContact")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("admin.emailContacts.emailRequired")}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email", { required: true })} 
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t("admin.emailContacts.name")}</Label>
                  <Input 
                    id="full_name" 
                    {...register("full_name")} 
                    placeholder="John Doe"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createContact.isPending}>
                    {createContact.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("admin.emailContacts.addContact")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-muted-foreground">{t("admin.emailContacts.totalContacts")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.subscribed || 0}</p>
                <p className="text-sm text-muted-foreground">{t("admin.emailContacts.status.subscribed")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">{stats?.unsubscribed || 0}</p>
              <p className="text-sm text-muted-foreground">{t("admin.emailContacts.status.unsubscribed")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-2xl font-bold">{stats?.bounced || 0}</p>
              <p className="text-sm text-muted-foreground">{t("admin.emailContacts.status.bounced")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.emailContacts.searchByEmailOrName")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("admin.emailContacts.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.emailContacts.allContacts")}</SelectItem>
                <SelectItem value="subscribed">{t("admin.emailContacts.status.subscribed")}</SelectItem>
                <SelectItem value="unsubscribed">{t("admin.emailContacts.status.unsubscribed")}</SelectItem>
                <SelectItem value="bounced">{t("admin.emailContacts.status.bounced")}</SelectItem>
                <SelectItem value="complained">{t("admin.emailContacts.status.complained")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.emailContacts.contacts")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contacts && contacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.emailContacts.table.email")}</TableHead>
                  <TableHead>{t("admin.emailContacts.table.name")}</TableHead>
                  <TableHead>{t("admin.emailContacts.table.status")}</TableHead>
                  <TableHead>{t("admin.emailContacts.table.source")}</TableHead>
                  <TableHead>{t("admin.emailContacts.table.emailsSent")}</TableHead>
                  <TableHead>{t("admin.emailContacts.table.lastEmail")}</TableHead>
                  <TableHead>{t("admin.emailContacts.table.created")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.email}</TableCell>
                    <TableCell>{contact.full_name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell className="capitalize">{contact.source || "-"}</TableCell>
                    <TableCell>{contact.emails_sent || 0}</TableCell>
                    <TableCell>
                      {contact.last_email_sent_at 
                        ? format(new Date(contact.last_email_sent_at), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.created_at), "MMM d, yyyy")}
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
                            className="text-destructive"
                            onClick={() => deleteContact.mutate(contact.id)}
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">{t("admin.emailContacts.noContactsFound")}</h3>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== "all" 
                  ? t("admin.emailContacts.tryAdjustingFilters")
                  : t("admin.emailContacts.addFirstContact")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailContacts;
