"use client";

import { useState, useMemo } from 'react';
import { Search, Star, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TripEvent } from '@/types/tripPlanner';
import { usePublishedListings } from '@/hooks/useListings';
import { useCities, useCategories } from '@/hooks/useReferenceData';
import { useFavoriteListings } from '@/hooks/useFavoriteListings';
import ListingImage from '@/components/ListingImage';
import { useTranslation } from "react-i18next";

interface TripEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<TripEvent, 'id' | 'trip_id'>) => void;
  initialDate?: string;
  editEvent?: TripEvent;
}

interface TripEventDialogFormProps {
  onClose: () => void;
  onSave: (event: Omit<TripEvent, 'id' | 'trip_id'>) => void;
  initialDate?: string;
  editEvent?: TripEvent;
}

const TIME_SLOTS = [
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '21:00', label: '09:00 PM' },
];

export function TripEventDialog({ open, onClose, onSave, initialDate, editEvent }: TripEventDialogProps) {
  const formKey = editEvent ? `edit-${editEvent.id}` : `new-${initialDate ?? ''}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {open ? (
        <TripEventDialogForm
          key={formKey}
          onClose={onClose}
          onSave={onSave}
          initialDate={initialDate}
          editEvent={editEvent}
        />
      ) : null}
    </Dialog>
  );
}

function TripEventDialogForm({ onClose, onSave, initialDate, editEvent }: TripEventDialogFormProps) {
  const { t } = useTranslation();
  const [selectedListing, setSelectedListing] = useState<string>(() => editEvent?.listing_id ?? '');
  const [date, setDate] = useState(() => editEvent?.date ?? initialDate ?? '');
  const [timeSlot, setTimeSlot] = useState<string>(() => editEvent?.time_slot || '');
  const [notes, setNotes] = useState(() => editEvent?.notes || '');
  const [estimatedCost, setEstimatedCost] = useState<string>(
    () => editEvent?.estimated_cost?.toString() || '',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'favorites' | 'all'>('favorites');

  const { data: listings = [] } = usePublishedListings();
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();
  const { favoriteListingIds } = useFavoriteListings();

  // Filter listings based on search
  const filteredListings = useMemo(() => {
    const source = activeTab === 'favorites' 
      ? listings.filter(l => favoriteListingIds.includes(l.id))
      : listings;

    if (!searchQuery.trim()) return source;

    const query = searchQuery.toLowerCase();
    return source.filter(l => 
      l.name?.toLowerCase().includes(query) ||
      l.description?.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery, listings, favoriteListingIds]);

  // Helpers
  const getCityName = (id: string) => cities.find(c => c.id === id)?.name || '';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '';
  const getCategorySlug = (id: string) => categories.find(c => c.id === id)?.slug || '';

  const handleSave = () => {
    if (!selectedListing || !date) return;

    onSave({
      listing_id: selectedListing,
      date,
      time_slot: timeSlot ?? undefined,
      notes: notes ?? undefined,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
    });
    onClose();
  };

  const selectedListingInfo = listings.find(l => l.id === selectedListing);

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="font-serif text-xl">
          {editEvent ? t("user.tripPlanner.eventDialog.editActivity") : t("user.tripPlanner.eventDialog.addActivity")}
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden space-y-4">
        {/* Selected Listing Preview */}
        {selectedListingInfo && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex items-center gap-3">
              {selectedListingInfo.featured_image_url && (
                <ListingImage
                  src={selectedListingInfo.featured_image_url} 
                  category={getCategorySlug(selectedListingInfo.category_id ?? '')}
                  categoryImageUrl={selectedListingInfo.category?.image_url}
                  listingId={selectedListingInfo.id}
                  alt={selectedListingInfo.name ?? ''}
                  fill
                  className="h-12 w-16 rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{selectedListingInfo.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getCityName(selectedListingInfo.city_id || '')} • {getCategoryName(selectedListingInfo.category_id || '')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedListing('')}>
                {t("user.tripPlanner.eventDialog.change")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Listing Selection */}
        {!selectedListingInfo && (
          <div className="space-y-3">
            <Label>{t("user.tripPlanner.eventDialog.selectListing")}</Label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("user.tripPlanner.eventDialog.searchListings")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'favorites' | 'all')}>
              <TabsList className="w-full">
                <TabsTrigger value="favorites" className="flex-1">
                  <Star className="h-4 w-4 mr-2" />
                  {t("user.tripPlanner.eventDialog.myFavorites")}
                </TabsTrigger>
                <TabsTrigger value="all" className="flex-1">
                  {t("user.tripPlanner.eventDialog.allListings")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-3">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {filteredListings.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {activeTab === 'favorites' 
                          ? t("user.tripPlanner.eventDialog.noFavorites")
                          : t("user.tripPlanner.eventDialog.noListingsFound")}
                      </p>
                    ) : (
                      filteredListings.map((listing) => (
                        <Card
                          key={listing.id}
                          className={cn(
                            "cursor-pointer hover:border-primary/40 transition-colors",
                            selectedListing === listing.id && "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedListing(listing.id)}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            {listing.featured_image_url && (
                              <ListingImage
                                src={listing.featured_image_url} 
                                category={getCategorySlug(listing.category_id ?? '')}
                                categoryImageUrl={listing.category?.image_url}
                                listingId={listing.id}
                                alt={listing.name ?? ''}
                                fill
                                className="h-10 w-12 rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1">{listing.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {getCityName(listing.city_id || '')}
                              </div>
                            </div>
                            {favoriteListingIds.includes(listing.id) && (
                              <Star className="h-4 w-4 text-primary fill-primary" />
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t("user.tripPlanner.eventDialog.date")}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">{t("user.tripPlanner.eventDialog.timeSlot")}</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder={t("user.tripPlanner.eventDialog.selectTime")} />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(slot => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">{t("user.tripPlanner.eventDialog.estimatedCostEuro")}</Label>
          <Input
            id="cost"
            type="number"
            min="0"
            placeholder="0"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">{t("user.tripPlanner.eventDialog.notes")}</Label>
          <Textarea
            id="notes"
            placeholder={t("user.tripPlanner.eventDialog.notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={!selectedListing || !date}>
          {editEvent ? t("user.tripPlanner.saveChanges") : t("user.tripPlanner.eventDialog.addActivity")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
