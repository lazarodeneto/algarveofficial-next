import { useState } from "react";
import { Plus, Calendar, Clock, DollarSign, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTripPlanner } from "@/hooks/useTripPlanner";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { LoginModal } from "@/components/ui/login-modal";
import { toast } from "sonner";
import { format, eachDayOfInterval, parseISO } from "date-fns";

interface AddToTripButtonProps {
  listingId: string;
  listingName: string;
  estimatedCost?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToTripButton({
  listingId,
  listingName,
  estimatedCost = 0,
  variant = "outline",
  size = "sm",
  className,
}: AddToTripButtonProps) {
  const [open, setOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [cost, setCost] = useState<string>(estimatedCost.toString());
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripStart, setNewTripStart] = useState("");
  const [newTripEnd, setNewTripEnd] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { isAuthenticated } = useAuth();
  const l = useLocalizedHref();
  const { trips, createTrip, addEventToTrip, getTripById } = useTripPlanner();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedTripId("");
    setSelectedDate("");
    setTimeSlot("");
    setNotes("");
    setCost(estimatedCost.toString());
    setIsCreatingTrip(false);
    setNewTripTitle("");
    setNewTripStart("");
    setNewTripEnd("");
  };

  const selectedTrip = selectedTripId ? getTripById(selectedTripId) : null;
  
  const availableDates = selectedTrip
    ? eachDayOfInterval({
        start: parseISO(selectedTrip.start_date),
        end: parseISO(selectedTrip.end_date),
      })
    : [];

  const handleCreateTrip = () => {
    if (!newTripTitle || !newTripStart || !newTripEnd) {
      toast.error("Please fill in all trip details");
      return;
    }

    const newTrip = createTrip({
      title: newTripTitle,
      start_date: newTripStart,
      end_date: newTripEnd,
    });

    setSelectedTripId(newTrip.id);
    setIsCreatingTrip(false);
    toast.success("Trip created!");
  };

  const handleAddToTrip = async () => {
    if (!selectedTripId || !selectedDate) {
      toast.error("Please select a trip and date");
      return;
    }

    setIsAdding(true);
    
    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    addEventToTrip(selectedTripId, {
      listing_id: listingId,
      date: selectedDate,
      time_slot: timeSlot || undefined,
      notes: notes || undefined,
      estimated_cost: parseFloat(cost) || 0,
    });

    setIsAdding(false);
    setOpen(false);
    resetForm();
    
    toast.success(`Added "${listingName}" to your trip!`, {
      action: {
        label: "View Trip",
        onClick: () => window.location.href = l("/dashboard/trips"),
      },
    });
  };

  return (
    <>
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal} 
      />
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Plus className="h-4 w-4 mr-1" />
            Add to Trip
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Trip</DialogTitle>
            <DialogDescription>
              Add &quot;{listingName}&quot; to your itinerary
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Trip Selection or Creation */}
            {!isCreatingTrip ? (
              <div className="space-y-2">
                <Label>Select Trip</Label>
                {trips.length > 0 ? (
                  <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a trip" />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id}>
                          <div className="flex flex-col">
                            <span>{trip.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(trip.start_date), "MMM d")} - {format(parseISO(trip.end_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">No trips yet. Create one below.</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingTrip(true)}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Trip
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Label>New Trip Details</Label>
                <Input
                  placeholder="Trip title (e.g., Algarve Summer 2024)"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={newTripStart}
                      onChange={(e) => setNewTripStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={newTripEnd}
                      onChange={(e) => setNewTripEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateTrip}>
                    Create Trip
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingTrip(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Date Selection */}
            {selectedTripId && availableDates.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </Label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date.toISOString()} value={format(date, "yyyy-MM-dd")}>
                        {format(date, "EEEE, MMMM d")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Time Slot */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time (optional)
                </Label>
                <Input
                  type="time"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                />
              </div>
            )}

            {/* Estimated Cost */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Estimated Cost (€)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>
            )}

            {/* Notes */}
            {selectedDate && (
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Any notes for this activity..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToTrip}
              disabled={!selectedTripId || !selectedDate || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add to Trip
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
