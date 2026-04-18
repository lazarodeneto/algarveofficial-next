import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  MapPin,
  Image as ImageIcon,
  Settings,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/admin/listings/TagInput';
import { useEvent, useCreateEvent, useUpdateEvent, generateEventSlug } from '@/hooks/useEvents';
import { useCities } from '@/hooks/useReferenceData';
import { 
  eventCategoryLabels,
  eventStatusLabels,
  type EventCategory, 
  type EventStatus,
  type EventFormData 
} from '@/types/events';
import { toast } from '@/hooks/use-toast';
import { extractIdParam } from "@/lib/routeParams";
import { ImageUrlUploadField } from "@/components/admin/ImageUrlUploadField";

export default function AdminEventForm() {
  const router = useRouter();
  const params = useParams<Record<string, string | string[] | undefined>>();
  const id = extractIdParam(params);
  const isEditing = !!id;

  const { data: event, isLoading: isLoadingEvent } = useEvent(id);
  const { data: cities = [] } = useCities();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    image: '',
    category: 'festival',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    location: '',
    venue: '',
    city_id: '',
    ticket_url: '',
    price_range: '',
    is_featured: false,
    is_recurring: false,
    recurrence_pattern: '',
    tags: [],
    status: 'draft',
    meta_title: '',
    meta_description: '',
  });

  // Load event data when editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        slug: event.slug,
        description: event.description || '',
        short_description: event.short_description || '',
        image: event.image || '',
        category: event.category,
        start_date: event.start_date,
        end_date: event.end_date,
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        venue: event.venue || '',
        city_id: event.city_id,
        ticket_url: event.ticket_url || '',
        price_range: event.price_range || '',
        is_featured: event.is_featured,
        is_recurring: event.is_recurring,
        recurrence_pattern: event.recurrence_pattern || '',
        tags: event.tags || [],
        status: event.status,
        meta_title: event.meta_title || '',
        meta_description: event.meta_description || '',
      });
    }
  }, [event]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: generateEventSlug(formData.title || ''),
      }));
    }
  }, [formData.title, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.start_date || !formData.end_date || !formData.city_id) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id, data: formData });
        toast({ title: 'Event updated successfully' });
      } else {
        await createEvent.mutateAsync(formData);
        toast({ title: 'Event created successfully' });
      }
      router.push('/admin/content/events');
    } catch (error: any) {
      toast({ 
        title: isEditing ? 'Failed to update event' : 'Failed to create event', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const categories = Object.entries(eventCategoryLabels) as [EventCategory, string][];
  const statuses = Object.entries(eventStatusLabels) as [EventStatus, string][];

  if (isEditing && isLoadingEvent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/content/events')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold">
            {isEditing ? 'Edit Event' : 'Create Event'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update event details' : 'Add a new event to the calendar'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="event-slug"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v as EventCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...categories].sort((a, b) => a[1].localeCompare(b[1])).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief summary for cards"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed event description (supports markdown)"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_recurring">Recurring Event</Label>
                    <p className="text-sm text-muted-foreground">This event repeats on a schedule</p>
                  </div>
                  <Switch
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(v) => setFormData({ ...formData, is_recurring: v })}
                  />
                </div>
                {formData.is_recurring && (
                  <div className="space-y-2">
                    <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                    <Select
                      value={formData.recurrence_pattern}
                      onValueChange={(v) => setFormData({ ...formData, recurrence_pattern: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city_id">City *</Label>
                  <Select
                    value={formData.city_id}
                    onValueChange={(v) => setFormData({ ...formData, city_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...cities].sort((a, b) => a.name.localeCompare(b.name)).map((city) => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Venue name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Address / Location Details</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Full address or location description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Featured Image URL</Label>
                  <ImageUrlUploadField
                    id="image"
                    value={formData.image}
                    onChange={(value) => setFormData({ ...formData, image: value })}
                    placeholder="https://..."
                    bucket="listing-images"
                    folder="events"
                    assetLabel="Event image"
                    buttonSize="sm"
                    disabled={createEvent.isPending || updateEvent.isPending}
                  />
                </div>
                {formData.image && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price_range">Price Range</Label>
                    <Input
                      id="price_range"
                      value={formData.price_range}
                      onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                      placeholder="e.g., Free, €20-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket_url">Ticket URL</Label>
                    <Input
                      id="ticket_url"
                      value={formData.ticket_url}
                      onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagInput
                    value={formData.tags ?? []}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    placeholder="Add tags..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO title (max 60 chars)"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="SEO description (max 160 chars)"
                    maxLength={160}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as EventStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_featured">Featured</Label>
                    <p className="text-sm text-muted-foreground">Show in featured section</p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createEvent.isPending || updateEvent.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createEvent.isPending || updateEvent.isPending 
                    ? 'Saving...' 
                    : isEditing ? 'Update Event' : 'Create Event'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
