"use client";

import { useState } from "react";
import { addDays, startOfDay } from "date-fns";
import { CalendarOff, Clock } from "lucide-react";
import { useAvailability } from "@/hooks/use-availability";
import { useRescheduleBooking } from "@/hooks/use-bookings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatTimeLabel } from "@/lib/utils";
import { isoClock, isoDatePart, friendlyDate } from "@/lib/dates";

const BOOKING_WINDOW_DAYS = 14;

export function RescheduleDialog({
  open,
  onOpenChange,
  shopSlug,
  code,
  currentStart,
  onRescheduled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopSlug: string;
  code: string;
  currentStart: string;
  onRescheduled?: () => void;
}) {
  const [date, setDate] = useState<string>(isoDatePart(currentStart));
  const [start, setStart] = useState<string | null>(null);
  const reschedule = useRescheduleBooking();

  const { data: slots, isLoading } = useAvailability({
    shopSlug,
    date,
    enabled: open,
  });

  const maxDate = addDays(startOfDay(new Date()), BOOKING_WINDOW_DAYS);
  const available = (slots ?? []).filter((s) => s.start !== currentStart);

  function confirm() {
    if (!start) return;
    reschedule.mutate(
      { code, start },
      {
        onSuccess: () => {
          onOpenChange(false);
          setStart(null);
          onRescheduled?.();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reschedule booking</DialogTitle>
          <DialogDescription>
            Pick a new date and time. The current slot is{" "}
            {friendlyDate(isoDatePart(currentStart))} at{" "}
            {formatTimeLabel(isoClock(currentStart))}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Calendar
            value={date}
            maxDate={maxDate}
            onSelect={(iso) => {
              setDate(iso);
              setStart(null);
            }}
          />

          {isLoading ? (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-lg" />
              ))}
            </div>
          ) : available.length === 0 ? (
            <EmptyState
              icon={<CalendarOff />}
              title="No times available"
              description="Try another date."
              className="py-6"
            />
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {available.map((slot) => {
                const selected = start === slot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setStart(slot.start)}
                    className={cn(
                      "flex items-center justify-center gap-1 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary",
                    )}
                  >
                    <Clock className="size-3.5 opacity-70" />
                    {formatTimeLabel(isoClock(slot.start))}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            loading={reschedule.isPending}
            disabled={!start}
          >
            Confirm new time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
