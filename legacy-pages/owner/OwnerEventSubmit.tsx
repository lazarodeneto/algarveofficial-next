import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Send, 
  Calendar,
  MapPin,
  Image as ImageIcon,
  FileText,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  type EventCategory, 
  type EventFormData 
} from '@/types/events';
import { toast } from '@/hooks/use-toast';
import { extractIdParam } from "@/lib/routeParams";
import { ImageUrlUploadField } from "@/components/admin/ImageUrlUploadField";

export default function OwnerEventSubmit() {
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
    is_recurring: false,
    recurrence_pattern: '',
    tags: [],
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
        is_recurring: event.is_recurring,
        recurrence_pattern: event.recurrence_pattern || '',
        tags: event.tags || [],
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

  const handleSubmit = async (saveAsDraft = false) => {
    if (!formData.title || !formData.category || !formData.start_date || !formData.end_date || !formData.city_id) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const submitData = {
      ...formData,
      status: saveAsDraft ? 'draft' as const : 'pending_review' as const,
    };

    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id, data: submitData });
        toast({ 
          title: saveAsDraft 
            ? 'Event saved as draft' 
            : 'Event submitted for review'
        });
      } else {
        await createEvent.mutateAsync(submitData);
        toast({ 
          title: saveAsDraft 
            ? 'Event saved as draft' 
            : 'Event submitted for review',
          description: saveAsDraft 
            ? 'You can continue editing later.' 
            : 'Our team will review your event and publish it soon.'
        });
      }
      router.push('/owner/events');
    } catch (error: any) {
      toast({ 
        title: 'Failed to save event', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  const categories = Object.entries(eventCategoryLabels) as [EventCategory, string][];

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
        <Button variant="ghost" size="icon" onClick={() => router.push('/owner/events')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-semibold">
            {isEditing ? 'Edit Event' : 'Submit New Event'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update your event details' : 'Promote your event on the Algarve calendar'}
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="bg-primary/10 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          Your event will be reviewed by our team before being published. This typically takes 1-2 business days.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
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
                  placeholder="Brief summary (shown on cards)"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your event"
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
                  <p className="text-sm text-muted-foreground">This event repeats regularly</p>
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
                <Label htmlFor="venue">Venue Name</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Praia da Rocha Beach Club"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Address / Directions</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Full address or how to find the venue"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Details */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Media & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Event Image URL</Label>
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
                  <Label htmlFor="ticket_url">Ticket/Booking URL</Label>
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
                  placeholder="Add tags to help people find your event..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Submit Actions */}
          <Card className="bg-card border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Submit Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once submitted, your event will be reviewed by our team. You'll be notified when it's published.
              </p>
              <Button 
                className="w-full"
                onClick={() => handleSubmit(false)}
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {createEvent.isPending || updateEvent.isPending 
                  ? 'Submitting...' 
                  : 'Submit for Review'}
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleSubmit(true)}
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                Save as Draft
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
