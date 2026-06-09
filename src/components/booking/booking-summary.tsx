"use client";

import { CalendarDays, Clock, Scissors } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import { formatNaira, formatDuration, formatTimeLabel } from "@/lib/utils";
import { friendlyDate, isoClock } from "@/lib/dates";
import { Separator } from "@/components/ui/separator";

export function BookingSummary({ compact = false }: { compact?: boolean }) {
  const { service, date, startTime } = useBookingStore();

  if (!service) return null;

  return (
    <div className="space-y-3">
      <Row
        icon={<Scissors className="size-4" />}
        label={service.name}
        value={formatDuration(service.duration_in_minutes)}
      />
      {date && (
        <Row
          icon={<CalendarDays className="size-4" />}
          label="Date"
          value={friendlyDate(date)}
        />
      )}
      {startTime && (
        <Row
          icon={<Clock className="size-4" />}
          label="Time"
          value={formatTimeLabel(isoClock(startTime))}
        />
      )}
      {!compact && <Separator />}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Total</span>
        <span className="text-lg font-bold text-foreground">
          {formatNaira(service.price)}
        </span>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-primary">{icon}</span>
        <span className="line-clamp-1">{label}</span>
      </span>
      <span className="shrink-0 text-sm font-medium text-muted-foreground">
        {value}
      </span>
    </div>
  );
}
