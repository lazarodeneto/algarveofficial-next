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
  FileText,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useEmailTemplates, 
  useCreateEmailTemplate, 
  useDeleteEmailTemplate,
  type EmailTemplateInsert
} from "@/hooks/useEmailTemplates";
import { format } from "date-fns";
import { useForm } from "react-hook-form";

const EmailTemplates = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const { data: templates, isLoading } = useEmailTemplates({ category: categoryFilter });
  const createTemplate = useCreateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  const { register, handleSubmit, reset } = useForm<EmailTemplateInsert>();

  const onSubmit = (data: EmailTemplateInsert) => {
    createTemplate.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      },
    });
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-500/20 text-gray-400",
      welcome: "bg-green-500/20 text-green-400",
      newsletter: "bg-blue-500/20 text-blue-400",
      promotional: "bg-purple-500/20 text-purple-400",
      transactional: "bg-orange-500/20 text-orange-400",
    };
    return <Badge className={colors[category] || colors.general}>{category}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input 
                    id="name" 
                    {...register("name", { required: true })} 
                    placeholder="Welcome Email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => register("category").onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Default Subject Line *</Label>
                <Input 
                  id="subject" 
                  {...register("subject", { required: true })} 
                  placeholder="Welcome to AlgarveOfficial, {{name}}!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="html_content">HTML Content *</Label>
                <Textarea 
                  id="html_content" 
                  {...register("html_content", { required: true })} 
                  placeholder="<html><body><h1>Hello {{name}}</h1><p>Welcome to AlgarveOfficial!</p></body></html>"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{name}}"}, {"{{email}}"} for dynamic content
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text_content">Plain Text Version</Label>
                <Textarea 
                  id="text_content" 
                  {...register("text_content")} 
                  placeholder="Hello {{name}},&#10;&#10;Welcome to AlgarveOfficial!"
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplate.isPending}>
                  {createTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <Select
            value={categoryFilter === undefined ? "all" : categoryFilter}
            onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates && templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                    <TableCell>{getCategoryBadge(template.category)}</TableCell>
                    <TableCell>
                      {template.is_active ? (
                        <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(template.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTemplate.mutate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first email template to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Create Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplates;
