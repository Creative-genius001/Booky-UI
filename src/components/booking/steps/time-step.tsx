"use client";

import { CalendarOff, Clock } from "lucide-react";
import { useAvailability } from "@/hooks/use-availability";
import { useBookingStore } from "@/stores/booking-store";
import { formatTimeLabel, cn } from "@/lib/utils";
import { friendlyDate } from "@/lib/dates";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function TimeStep({
  shopId,
  onNext,
}: {
  shopId: string;
  onNext: () => void;
}) {
  const { service, date, startTime, selectTime } = useBookingStore();
  const { data, isLoading, isError, refetch, isPlaceholderData } =
    useAvailability({ shopId, date: date ?? undefined, serviceId: service?.id });

  if (!date) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" title="Couldn't load available times">
        <button onClick={() => refetch()} className="font-medium underline">
          Try again
        </button>
      </Alert>
    );
  }

  const slots = (data?.slots ?? []).filter((s) => s.available > 0);

  if (slots.length === 0) {
    return (
      <EmptyState
        icon={<CalendarOff />}
        title="No times left on this day"
        description={`${friendlyDate(date)} is fully booked. Try another date.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Available times for{" "}
          <span className="font-medium text-foreground">{friendlyDate(date)}</span>
        </p>
        {isPlaceholderData && <Badge variant="muted">Updating…</Badge>}
      </div>
      <div
        className={cn(
          "grid grid-cols-3 gap-2.5 sm:grid-cols-4",
          isPlaceholderData && "opacity-60",
        )}
      >
        {slots.map((slot) => {
          const isSelected = startTime === slot.startTime;
          const low = slot.available <= 2;
          return (
            <button
              key={slot.startTime}
              type="button"
              onClick={() => {
                selectTime(slot.startTime);
                setTimeout(onNext, 160);
              }}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border py-2.5 text-sm font-semibold transition-all",
                "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 opacity-70" />
                {formatTimeLabel(slot.startTime)}
              </span>
              {low && !isSelected && (
                <span className="mt-0.5 text-[10px] font-medium text-warning-foreground">
                  {slot.available} left
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
