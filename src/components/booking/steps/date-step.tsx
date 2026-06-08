"use client";

import { addDays, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useBookingStore } from "@/stores/booking-store";

export function DateStep({ onNext }: { onNext: () => void }) {
  const shop = useBookingStore((s) => s.shop);
  const date = useBookingStore((s) => s.date);
  const selectDate = useBookingStore((s) => s.selectDate);

  const windowDays = shop?.bookingWindowDays ?? 14;
  const maxDate = addDays(startOfDay(new Date()), windowDays);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a day in the next {windowDays} days that works for you.
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
