import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search, 
  Compass, 
  Edit, 
  MoreVertical,
  Eye,
  GripVertical,
  Loader2,
  Settings,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type Region = Tables<"regions">;

interface SortableRegionItemProps {
  region: Region;
  onToggle: (region: Region, checked: boolean) => void;
}

function SortableRegionItem({ region, onToggle }: SortableRegionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: region.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border bg-card/50 transition-colors",
        !region.is_visible_destinations && "opacity-60",
        isDragging && "z-50 shadow-lg shadow-primary/20 opacity-90"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          
          {/* Thumbnail */}
          <ImageWithFallback
            src={region.image_url ?? undefined}
            alt={region.name}
            containerClassName="w-24 h-16 rounded-lg flex-shrink-0"
            fallbackIconSize={24}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-foreground">{region.name}</h3>
              <Badge 
                variant={region.is_visible_destinations ? 'default' : 'secondary'}
                className="text-xs"
              >
                {region.is_visible_destinations ? 'Visible' : 'Hidden'}
              </Badge>
              {region.is_featured && (
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {region.short_description || region.description || 'No description'}
            </p>
            <span className="text-xs text-muted-foreground">
              /{region.slug}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch 
              checked={region.is_visible_destinations}
              onCheckedChange={(checked) => onToggle(region, checked)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/admin/content/regions">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit in Regions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/destinations/${region.slug}`, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCmsDestinations() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const invalidateRegionCaches = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-destinations-regions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-regions'] });
    queryClient.invalidateQueries({ queryKey: ['regions'] });
    queryClient.invalidateQueries({ queryKey: ['regions', 'featured'] });
  };

  // Fetch regions from Supabase
  const { data: regions = [], isLoading } = useQuery({
    queryKey: ['admin-destinations-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Region[];
    },
  });

  // Update region mutation
  const updateMutation = useMutation({
    mutationFn: async (region: Partial<Region> & { id: string }) => {
      const { id, ...updatePayload } = region;
      const { error } = await supabase
        .from('regions')
        .update(updatePayload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRegionCaches();
    },
  });

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRegions = [...filteredRegions].sort((a, b) => a.display_order - b.display_order);

  const toggleRegionEnabled = (region: Region, checked: boolean) => {
    updateMutation.mutate({ id: region.id, is_visible_destinations: checked }, {
      onSuccess: () => {
        toast.success(`Region ${checked ? 'visible on' : 'hidden from'} Destinations`);
      },
      onError: (error) => {
        toast.error("Failed to update region: " + error.message);
      },
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedRegions.findIndex((item) => item.id === active.id);
      const newIndex = sortedRegions.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(sortedRegions, oldIndex, newIndex);
      
      // Update display_order for all affected items
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].display_order !== i + 1) {
          await supabase
            .from('regions')
            .update({ display_order: i + 1 })
            .eq('id', newItems[i].id);
        }
      }
      
      invalidateRegionCaches();
      toast.success("Region order updated");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-medium text-foreground mt-2">Destinations</h1>
          <p className="text-muted-foreground">Manage which premium regions appear on the Destinations page</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/content/regions">
            <Settings className="h-4 w-4 mr-2" />
            Manage Regions
            <ExternalLink className="h-3 w-3 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Regions List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedRegions.map(r => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sortedRegions.map((region) => (
              <SortableRegionItem
                key={region.id}
                region={region}
                onToggle={toggleRegionEnabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredRegions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Compass className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No regions available</h3>
          <p className="text-muted-foreground mb-4">Create regions in the Regions management page</p>
          <Button asChild>
            <Link to="/admin/content/regions">
              <Settings className="h-4 w-4 mr-2" />
              Go to Regions
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
