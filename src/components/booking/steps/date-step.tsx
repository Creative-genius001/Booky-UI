"use client";

import { addDays, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useBookingStore } from "@/stores/booking-store";

// The backend enforces a rolling 14-day booking window.
const BOOKING_WINDOW_DAYS = 14;

export function DateStep({ onNext }: { onNext: () => void }) {
  const date = useBookingStore((s) => s.date);
  const selectDate = useBookingStore((s) => s.selectDate);

  const maxDate = addDays(startOfDay(new Date()), BOOKING_WINDOW_DAYS);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a day in the next {BOOKING_WINDOW_DAYS} days that works for you.
      </p>
      <Calendar
        value={date}
        maxDate={maxDate}
        onSelect={(iso) => {
          selectDate(iso);
          setTimeout(onNext, 160);
        }}
      />
    </div>
  );
}
