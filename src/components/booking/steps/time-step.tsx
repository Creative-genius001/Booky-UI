"use client";

import { CalendarOff, Clock } from "lucide-react";
import { useAvailability } from "@/hooks/use-availability";
import { useBookingStore } from "@/stores/booking-store";
import { formatTimeLabel, cn } from "@/lib/utils";
import { friendlyDate, isoClock } from "@/lib/dates";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function TimeStep({
  shopSlug,
  onNext,
}: {
  shopSlug: string;
  onNext: () => void;
}) {
  const { date, startTime, selectTime } = useBookingStore();
  const { data, isLoading, isError, refetch, isPlaceholderData } =
    useAvailability({ shopSlug, date: date ?? undefined });

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

  const slots = data ?? [];

  if (slots.length === 0) {
    return (
      <EmptyState
        icon={<CalendarOff />}
        title="No times left on this day"
        description={`${friendlyDate(date)} has no available slots. Try another date.`}
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
          const isSelected = startTime === slot.start;
          const label = formatTimeLabel(isoClock(slot.start));
          return (
            <button
              key={slot.start}
              type="button"
              onClick={() => {
                selectTime(slot.start);
                setTimeout(onNext, 160);
              }}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center justify-center rounded-lg border py-2.5 text-sm font-semibold transition-all",
                "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 opacity-70" />
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
