import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Edit, 
  Trash2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useOwnerEvents, useDeleteEvent } from '@/hooks/useEvents';
import { 
  eventCategoryLabels, 
  eventCategoryColors,
  eventStatusLabels,
  eventStatusColors,
  type CalendarEvent,
} from '@/types/events';
import { toast } from '@/hooks/use-toast';

export default function OwnerEvents() {
  if (typeof window === "undefined") {
    return null;
  }
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: events = [], isLoading } = useOwnerEvents() as {
    data: CalendarEvent[];
    isLoading: boolean;
  };
  const deleteEvent = useDeleteEvent();

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteEvent.mutateAsync(deleteId);
      toast({ title: t('owner.events.deleteSuccess') });
      setDeleteId(null);
    } catch (error) {
      toast({ title: t('owner.events.deleteFailed'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold">{t('owner.events.title')}</h1>
          <p className="text-muted-foreground">{t('owner.events.subtitle')}</p>
        </div>
        <Button asChild>
          <Link to="/owner/events/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('owner.events.submitNewEvent')}
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">{t('owner.events.noEventsYet')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('owner.events.noEventsDescription')}
            </p>
            <Button asChild>
              <Link to="/owner/events/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('owner.events.submitNewEvent')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="bg-card border-border overflow-hidden">
              {/* Image */}
              {event.image ? (
                <div className="aspect-video relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className={`absolute top-3 left-3 ${eventCategoryColors[event.category]}`}>
                    {eventCategoryLabels[event.category]}
                  </Badge>
                  <Badge className={`absolute top-3 right-3 ${eventStatusColors[event.status]}`}>
                    {eventStatusLabels[event.status]}
                  </Badge>
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <Badge className={`absolute top-3 left-3 ${eventCategoryColors[event.category]}`}>
                    {eventCategoryLabels[event.category]}
                  </Badge>
                  <Badge className={`absolute top-3 right-3 ${eventStatusColors[event.status]}`}>
                    {eventStatusLabels[event.status]}
                  </Badge>
                </div>
              )}

              <CardContent className="p-5 space-y-4">
                {/* Title */}
                <h3 className="font-serif font-semibold text-lg line-clamp-2">{event.title}</h3>

                {/* Rejection Reason */}
                {event.status === 'rejected' && event.rejection_reason && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {event.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(parseISO(event.start_date), 'MMM d, yyyy')}
                      {event.start_date !== event.end_date && ` - ${format(parseISO(event.end_date), 'MMM d, yyyy')}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue || event.location || event.city?.name || 'N/A'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {event.status === 'published' && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/events/${event.slug}`} target="_blank">
                        <Eye className="h-4 w-4 mr-1" />
                        {t('owner.events.view')}
                      </Link>
                    </Button>
                  )}
                  {(event.status === 'draft' || event.status === 'rejected') && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/owner/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        {t('common.edit')}
                      </Link>
                    </Button>
                  )}
                  {event.status === 'draft' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteId(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('owner.events.deleteEvent')}
        description={t('owner.events.deleteEventDescription')}
        confirmLabel={t('common.delete')}
        variant="destructive"
      />
    </div>
  );
}
