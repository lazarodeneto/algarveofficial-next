"use client";

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Trip } from '@/types/tripPlanner';

interface CreateTripDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description?: string; start_date: string; end_date: string }) => void;
  editTrip?: Trip;
}

interface CreateTripDialogFormProps {
  onClose: () => void;
  onSave: (data: { title: string; description?: string; start_date: string; end_date: string }) => void;
  editTrip?: Trip;
  t: ReturnType<typeof useTranslation>["t"];
}

function CreateTripDialogForm({ onClose, onSave, editTrip, t }: CreateTripDialogFormProps) {
  const [title, setTitle] = useState(() => editTrip?.title ?? '');
  const [description, setDescription] = useState(() => editTrip?.description ?? '');
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    editTrip ? new Date(editTrip.start_date) : addDays(new Date(), 7),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    editTrip ? new Date(editTrip.end_date) : addDays(new Date(), 14),
  );

  const handleSave = () => {
    if (!title.trim() || !startDate || !endDate) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
    });
    onClose();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-serif text-xl">
          {editTrip ? t('dashboard.tripPlanner.editTrip') : t('dashboard.tripPlanner.createNewTrip')}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('dashboard.tripPlanner.tripTitle')}</Label>
          <Input
            id="title"
            placeholder={t('dashboard.tripPlanner.tripTitlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('dashboard.tripPlanner.descriptionOptional')}</Label>
          <Textarea
            id="description"
            placeholder={t('dashboard.tripPlanner.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('dashboard.tripPlanner.startDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM d, yyyy") : t('dashboard.tripPlanner.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date && endDate && date > endDate) {
                      setEndDate(addDays(date, 7));
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>{t('dashboard.tripPlanner.endDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM d, yyyy") : t('dashboard.tripPlanner.pickDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < (startDate || new Date())}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || !startDate || !endDate}>
          {editTrip ? t('dashboard.tripPlanner.saveChanges') : t('dashboard.tripPlanner.createTrip')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function CreateTripDialog({ open, onClose, onSave, editTrip }: CreateTripDialogProps) {
  const { t } = useTranslation();
  const formKey = editTrip ? `edit-${editTrip.id}` : "new";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {open ? (
        <CreateTripDialogForm
          key={formKey}
          onClose={onClose}
          onSave={onSave}
          editTrip={editTrip}
          t={t}
        />
      ) : null}
    </Dialog>
  );
}
