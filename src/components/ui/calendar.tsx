"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface CalendarProps {
  /** Selected ISO date "YYYY-MM-DD". */
  value?: string | null;
  onSelect: (iso: string) => void;
  /** Predicate: is this ISO date selectable? */
  isAvailable?: (iso: string) => boolean;
  /** Earliest selectable date (defaults to today). */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
}

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function Calendar({
  value,
  onSelect,
  isAvailable,
  minDate,
  maxDate,
}: CalendarProps) {
  const today = startOfDay(new Date());
  const min = minDate ?? today;
  const initial = value ? startOfMonth(new Date(value)) : startOfMonth(today);
  const [cursor, setCursor] = React.useState<Date>(initial);

  const days = React.useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const canGoPrev = startOfMonth(cursor) > startOfMonth(min);
  const canGoNext = maxDate
    ? startOfMonth(cursor) < startOfMonth(maxDate)
    : true;

  function disabled(d: Date): boolean {
    const day = startOfDay(d);
    if (day < startOfDay(min)) return true;
    if (maxDate && day > startOfDay(maxDate)) return true;
    if (isAvailable && !isAvailable(toISODate(day))) return true;
    return false;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={!canGoPrev}
          onClick={() => setCursor((c) => subMonths(c, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </Button>
        <p className="text-sm font-semibold">{format(cursor, "MMMM yyyy")}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={!canGoNext}
          onClick={() => setCursor((c) => addMonths(c, 1))}
          aria-label="Next month"
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEK_LABELS.map((l, i) => (
          <div
            key={i}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toISODate(d);
          const inMonth = isSameMonth(d, cursor);
          const isSelected = value ? isSameDay(d, new Date(value)) : false;
          const isToday = isSameDay(d, today);
          const isDisabled = disabled(d);
          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(iso)}
              className={cn(
                "relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !inMonth && "text-muted-foreground/40",
                isDisabled &&
                  "cursor-not-allowed text-muted-foreground/30 line-through",
                !isDisabled &&
                  !isSelected &&
                  "hover:bg-muted text-foreground",
                isSelected &&
                  "bg-primary text-primary-foreground shadow-soft hover:bg-primary",
              )}
              aria-pressed={isSelected}
              aria-label={format(d, "EEEE, d MMMM yyyy")}
            >
              {format(d, "d")}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
