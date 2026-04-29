import { useState } from "react";
import { m } from "framer-motion";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PanelLeft,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Save,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";
import { MENU_ICON_OPTIONS, getMenuIcon } from "@/lib/menu-icons";
import {
  useAdminLeftMenu,
  useLeftMenuMutations,
  LeftMenuItem,
} from "@/hooks/useLeftMenu";

function SortableMenuItem({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  item: LeftMenuItem;
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
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = getMenuIcon(item.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        isDragging && "opacity-50 shadow-lg",
        "border-border bg-card/50 hover:border-primary/50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <LinkIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-primary" />
          <span className="font-medium">{item.name}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.href}</p>
      </div>
      <Badge variant={item.is_active ? "default" : "secondary"} className="text-xs">
        {item.is_active ? "Visible" : "Hidden"}
      </Badge>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleActive}>
          {item.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
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

export default function AdminLeftMenu() {
  const { data: items = [], isLoading } = useAdminLeftMenu();
  const { createItem, updateItem, deleteItem, reorderItems } = useLeftMenuMutations();

  const [editingItem, setEditingItem] = useState<LeftMenuItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<LeftMenuItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formHref, setFormHref] = useState("");
  const [formIcon, setFormIcon] = useState("Link");
  const [formTranslationKey, setFormTranslationKey] = useState("");
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      reorderItems.mutate(newOrder.map((item) => item.id));
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormHref("");
    setFormIcon("Link");
    setFormTranslationKey("");
    setFormOpenInNewTab(false);
  };

  const handleAddItem = () => {
    if (!formName || !formHref) return;
    createItem.mutate(
      {
        name: formName,
        href: formHref,
        icon: formIcon,
        translation_key: formTranslationKey || undefined,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          resetForm();
        },
      },
    );
  };

  const handleEditItem = () => {
    if (!editingItem || !formName || !formHref) return;
    updateItem.mutate(
      {
        id: editingItem.id,
        name: formName,
        href: formHref,
        icon: formIcon,
        translation_key: formTranslationKey || null,
        open_in_new_tab: formOpenInNewTab,
      },
      {
        onSuccess: () => {
          setEditingItem(null);
          resetForm();
        },
      },
    );
  };

  const openEditDialog = (item: LeftMenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormHref(item.href);
    setFormIcon(item.icon);
    setFormTranslationKey(item.translation_key || "");
    setFormOpenInNewTab(item.open_in_new_tab);
  };

  const handleToggleActive = (item: LeftMenuItem) => {
    updateItem.mutate({ id: item.id, is_active: !item.is_active });
  };

  const handleDeleteItem = () => {
    if (deleteConfirmItem) {
      deleteItem.mutate(deleteConfirmItem.id, {
        onSuccess: () => setDeleteConfirmItem(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3">
          <PanelLeft className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-serif font-normal">Left Menu</h1>
            <p className="text-muted-foreground">Manage left sidebar navigation menu items</p>
          </div>
        </div>
      </m.div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Drag to reorder, click to edit</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PanelLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No menu items yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      onEdit={() => openEditDialog(item)}
                      onDelete={() => setDeleteConfirmItem(item)}
                      onToggleActive={() => handleToggleActive(item)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Left Menu Item</DialogTitle>
            <DialogDescription>Add a new item to the left navigation menu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., Destinations" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">URL / Path</Label>
              <Input id="href" value={formHref} onChange={(e) => setFormHref(e.target.value)} placeholder="e.g., /destinations or https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={formIcon} onValueChange={setFormIcon}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="translationKey">Translation Key (optional)</Label>
              <Input
                id="translationKey"
                value={formTranslationKey}
                onChange={(e) => setFormTranslationKey(e.target.value)}
                placeholder="e.g., nav.destinations"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!formName || !formHref || createItem.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createItem.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) { setEditingItem(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Left Menu Item</DialogTitle>
            <DialogDescription>Update the menu item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-href">URL / Path</Label>
              <Input id="edit-href" value={formHref} onChange={(e) => setFormHref(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select value={formIcon} onValueChange={setFormIcon}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="edit-translationKey">Translation Key (optional)</Label>
              <Input
                id="edit-translationKey"
                value={formTranslationKey}
                onChange={(e) => setFormTranslationKey(e.target.value)}
                placeholder="e.g., nav.destinations"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-newTab">Open in new tab</Label>
              <Switch id="edit-newTab" checked={formOpenInNewTab} onCheckedChange={setFormOpenInNewTab} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingItem(null); resetForm(); }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleEditItem} disabled={!formName || !formHref || updateItem.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateItem.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirmItem}
        onOpenChange={(open) => !open && setDeleteConfirmItem(null)}
        title="Delete Left Menu Item"
        description={`Are you sure you want to delete "${deleteConfirmItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteItem}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
