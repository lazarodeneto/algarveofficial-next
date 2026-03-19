import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Footprints,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  FolderOpen,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";
import { MENU_ICON_OPTIONS, getMenuIcon } from "@/lib/menu-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminFooterSections,
  useAdminFooterLinks,
  useFooterSectionMutations,
  useFooterLinkMutations,
  FooterSection,
  FooterLink,
} from "@/hooks/useFooterMenu";

// Sortable Section Item
function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  section: FooterSection;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
        isDragging && "opacity-50 shadow-lg",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-card/50 hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <FolderOpen className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
      <span className="flex-1 font-medium">{section.title}</span>
      <Badge variant={section.is_active ? "default" : "secondary"} className="text-xs">
        {section.is_active ? "Active" : "Hidden"}
      </Badge>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive();
          }}
        >
          {section.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Link Item
function SortableLinkItem({
  link,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  link: FooterLink;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const IconComponent = getMenuIcon(link.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border bg-card/30 transition-all",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <IconComponent className="h-4 w-4 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{link.name}</p>
        <p className="text-xs text-muted-foreground truncate">{link.href}</p>
      </div>
      {link.open_in_new_tab && (
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <Badge variant={link.is_active ? "outline" : "secondary"} className="text-xs">
        {link.is_active ? "Visible" : "Hidden"}
      </Badge>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggleActive}
        >
          {link.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminFooterMenu() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionDialog, setSectionDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    section?: FooterSection;
  }>({ open: false, mode: "create" });
  const [linkDialog, setLinkDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    link?: FooterLink;
  }>({ open: false, mode: "create" });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "section" | "link";
    id: string;
    name: string;
  } | null>(null);

  // Form state
  const [sectionForm, setSectionForm] = useState({ title: "", slug: "" });
  const [linkForm, setLinkForm] = useState({ name: "", href: "", icon: "Link", open_in_new_tab: false });

  // Queries
  const { data: sections = [], isLoading: sectionsLoading } = useAdminFooterSections();
  const { data: links = [], isLoading: linksLoading } = useAdminFooterLinks(selectedSectionId);

  // Mutations
  const { createSection, updateSection, deleteSection, reorderSections } = useFooterSectionMutations();
  const { createLink, updateLink, deleteLink, reorderLinks } = useFooterLinkMutations();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-select first section
  if (sections.length > 0 && !selectedSectionId && !sectionsLoading) {
    setSelectedSectionId(sections[0].id);
  }

  // Section handlers
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      reorderSections.mutate(newOrder.map((s) => s.id));
    }
  };

  const openSectionDialog = (mode: "create" | "edit", section?: FooterSection) => {
    if (mode === "edit" && section) {
      setSectionForm({ title: section.title, slug: section.slug });
    } else {
      setSectionForm({ title: "", slug: "" });
    }
    setSectionDialog({ open: true, mode, section });
  };

  const handleSaveSection = () => {
    if (sectionDialog.mode === "create") {
      createSection.mutate(sectionForm, {
        onSuccess: () => setSectionDialog({ open: false, mode: "create" }),
      });
    } else if (sectionDialog.section) {
      updateSection.mutate({ id: sectionDialog.section.id, ...sectionForm }, {
        onSuccess: () => setSectionDialog({ open: false, mode: "create" }),
      });
    }
  };

  const handleDeleteSection = () => {
    if (deleteDialog?.type === "section") {
      deleteSection.mutate(deleteDialog.id, {
        onSuccess: () => {
          setDeleteDialog(null);
          if (selectedSectionId === deleteDialog.id) {
            setSelectedSectionId(sections.find((s) => s.id !== deleteDialog.id)?.id ?? null);
          }
        },
      });
    }
  };

  // Link handlers
  const handleLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(links, oldIndex, newIndex);
      reorderLinks.mutate(newOrder.map((l) => l.id));
    }
  };

  const openLinkDialog = (mode: "create" | "edit", link?: FooterLink) => {
    if (mode === "edit" && link) {
      setLinkForm({ name: link.name, href: link.href, icon: link.icon || "Link", open_in_new_tab: link.open_in_new_tab });
    } else {
      setLinkForm({ name: "", href: "", icon: "Link", open_in_new_tab: false });
    }
    setLinkDialog({ open: true, mode, link });
  };

  const handleSaveLink = () => {
    if (linkDialog.mode === "create" && selectedSectionId) {
      createLink.mutate({ section_id: selectedSectionId, ...linkForm }, {
        onSuccess: () => setLinkDialog({ open: false, mode: "create" }),
      });
    } else if (linkDialog.link) {
      updateLink.mutate({ id: linkDialog.link.id, ...linkForm }, {
        onSuccess: () => setLinkDialog({ open: false, mode: "create" }),
      });
    }
  };

  const handleDeleteLink = () => {
    if (deleteDialog?.type === "link") {
      deleteLink.mutate(deleteDialog.id, {
        onSuccess: () => setDeleteDialog(null),
      });
    }
  };

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-serif font-medium text-foreground flex items-center gap-3">
            <Footprints className="h-8 w-8 text-primary" />
            Footer Menu
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage footer sections and navigation links
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sections Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Sections</CardTitle>
                <CardDescription>Footer column groups</CardDescription>
              </div>
              <Button size="sm" onClick={() => openSectionDialog("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {sectionsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : sections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sections yet</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSectionDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sections.map((section) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        isSelected={selectedSectionId === section.id}
                        onSelect={() => setSelectedSectionId(section.id)}
                        onEdit={() => openSectionDialog("edit", section)}
                        onDelete={() =>
                          setDeleteDialog({
                            open: true,
                            type: "section",
                            id: section.id,
                            name: section.title,
                          })
                        }
                        onToggleActive={() =>
                          updateSection.mutate({ id: section.id, is_active: !section.is_active })
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Links Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">
                  {selectedSection ? `${selectedSection.title} Links` : "Links"}
                </CardTitle>
                <CardDescription>
                  {selectedSection
                    ? "Drag to reorder, click to edit"
                    : "Select a section to manage links"}
                </CardDescription>
              </div>
              {selectedSection && (
                <Button size="sm" onClick={() => openLinkDialog("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {!selectedSection ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select a section from the left to manage its links
                </p>
              ) : linksLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : links.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No links in this section yet
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleLinkDragEnd}
                >
                  <SortableContext
                    items={links.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {links.map((link) => (
                      <SortableLinkItem
                        key={link.id}
                        link={link}
                        onEdit={() => openLinkDialog("edit", link)}
                        onDelete={() =>
                          setDeleteDialog({
                            open: true,
                            type: "link",
                            id: link.id,
                            name: link.name,
                          })
                        }
                        onToggleActive={() =>
                          updateLink.mutate({ id: link.id, is_active: !link.is_active })
                        }
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Section Dialog */}
      <Dialog open={sectionDialog.open} onOpenChange={(open) => setSectionDialog({ ...sectionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sectionDialog.mode === "create" ? "Create Section" : "Edit Section"}
            </DialogTitle>
            <DialogDescription>
              {sectionDialog.mode === "create"
                ? "Add a new footer section"
                : "Update section details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Title</Label>
              <Input
                id="section-title"
                value={sectionForm.title}
                onChange={(e) => {
                  setSectionForm({
                    ...sectionForm,
                    title: e.target.value,
                    slug: sectionDialog.mode === "create" 
                      ? e.target.value.toLowerCase().replace(/\s+/g, "-")
                      : sectionForm.slug,
                  });
                }}
                placeholder="e.g., Resources"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-slug">Slug</Label>
              <Input
                id="section-slug"
                value={sectionForm.slug}
                onChange={(e) => setSectionForm({ ...sectionForm, slug: e.target.value })}
                placeholder="e.g., resources"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialog({ open: false, mode: "create" })}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSection}
              disabled={!sectionForm.title || !sectionForm.slug || createSection.isPending || updateSection.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createSection.isPending || updateSection.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialog.open} onOpenChange={(open) => setLinkDialog({ ...linkDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {linkDialog.mode === "create" ? "Add Link" : "Edit Link"}
            </DialogTitle>
            <DialogDescription>
              {linkDialog.mode === "create"
                ? `Add a new link to ${selectedSection?.title}`
                : "Update link details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-name">Name</Label>
              <Input
                id="link-name"
                value={linkForm.name}
                onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                placeholder="e.g., About Us"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-href">URL</Label>
              <Input
                id="link-href"
                value={linkForm.href}
                onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                placeholder="e.g., /about-us or https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-icon">Icon</Label>
              <Select
                value={linkForm.icon}
                onValueChange={(value) => setLinkForm({ ...linkForm, icon: value })}
              >
                <SelectTrigger id="link-icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_ICON_OPTIONS.map(({ name, icon: Icon }) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="link-external">Open in new tab</Label>
              <Switch
                id="link-external"
                checked={linkForm.open_in_new_tab}
                onCheckedChange={(checked) => setLinkForm({ ...linkForm, open_in_new_tab: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog({ open: false, mode: "create" })}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLink}
              disabled={!linkForm.name || !linkForm.href || createLink.isPending || updateLink.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createLink.isPending || updateLink.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog?.open ?? false}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title={`Delete ${deleteDialog?.type === "section" ? "Section" : "Link"}`}
        description={`Are you sure you want to delete "${deleteDialog?.name}"? ${
          deleteDialog?.type === "section" ? "This will also delete all links in this section." : ""
        }`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={deleteDialog?.type === "section" ? handleDeleteSection : handleDeleteLink}
      />
    </div>
  );
}
