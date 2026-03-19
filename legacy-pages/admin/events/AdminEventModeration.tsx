import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { 
  ClipboardCheck, 
  Calendar, 
  MapPin, 
  Check, 
  X,
  Eye,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminEvents, useApproveEvent, useRejectEvent } from '@/hooks/useEvents';
import { eventCategoryLabels, eventCategoryColors, type CalendarEvent } from '@/types/events';
import { toast } from '@/hooks/use-toast';

export default function AdminEventModeration() {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: events = [], isLoading } = useAdminEvents({
    status: 'pending_review',
  }) as { data: CalendarEvent[]; isLoading: boolean };
  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();

  const handleApprove = async (id: string) => {
    try {
      await approveEvent.mutateAsync(id);
      toast({ title: 'Event approved and published' });
    } catch (error) {
      toast({ title: 'Failed to approve event', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) {
      toast({ title: 'Please provide a rejection reason', variant: 'destructive' });
      return;
    }

    try {
      await rejectEvent.mutateAsync({ id: rejectingId, reason: rejectionReason });
      toast({ title: 'Event rejected' });
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) {
      toast({ title: 'Failed to reject event', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold">Event Moderation</h1>
          <p className="text-muted-foreground">Review and approve submitted events</p>
        </div>
        {events.length > 0 && (
          <Badge className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {events.length} Pending
          </Badge>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              There are no events pending review at the moment.
            </p>
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
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <Badge className={`absolute top-3 left-3 ${eventCategoryColors[event.category]}`}>
                    {eventCategoryLabels[event.category]}
                  </Badge>
                </div>
              )}

              <CardContent className="p-5 space-y-4">
                {/* Title & Submitter */}
                <div>
                  <h3 className="font-serif font-semibold text-lg line-clamp-2">{event.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <User className="h-3.5 w-3.5" />
                    <span>Submitted by {event.submitter?.full_name || 'Unknown'}</span>
                  </div>
                </div>

                {/* Short Description */}
                {event.short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.short_description}
                  </p>
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
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/admin/content/events/${event.id}/edit`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(event.id)}
                    disabled={approveEvent.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => setRejectingId(event.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this event. The submitter will be able to see this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this event is being rejected..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectEvent.isPending || !rejectionReason.trim()}
            >
              {rejectEvent.isPending ? 'Rejecting...' : 'Reject Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
