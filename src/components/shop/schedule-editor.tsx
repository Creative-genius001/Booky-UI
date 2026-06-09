"use client";

import { useState } from "react";
import type { SchedulePayload } from "@/lib/api/shops";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

// Display order Monday → Sunday (weekday key: 0=Sun … 6=Sat).
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const SHORT: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/**
 * Onboarding schedule editor. The backend applies one open/close time across
 * the selected active days (POST /shops/:id/business-days), so this collects a
 * single uniform schedule plus the set of open days.
 */
export function ScheduleEditor({
  saving,
  saveLabel = "Save",
  onSave,
  footer,
}: {
  saving?: boolean;
  saveLabel?: string;
  onSave: (payload: SchedulePayload) => void;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState("09:00");
  const [close, setClose] = useState("18:00");
  const [active, setActive] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6]),
  );

  const badTimes = close <= open;
  const noDays = active.size === 0;

  function toggle(day: number) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Opening time" htmlFor="open">
          <Input
            id="open"
            type="time"
            value={open}
            invalid={badTimes}
            onChange={(e) => setOpen(e.target.value)}
          />
        </FormField>
        <FormField label="Closing time" htmlFor="close">
          <Input
            id="close"
            type="time"
            value={close}
            invalid={badTimes}
            onChange={(e) => setClose(e.target.value)}
          />
        </FormField>
      </div>
      {badTimes && (
        <p className="text-xs font-medium text-destructive">
          Closing time must be after opening time.
        </p>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Open days</p>
        <div className="flex flex-wrap gap-2">
          {ORDER.map((day) => {
            const on = active.has(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggle(day)}
                aria-pressed={on}
                className={cn(
                  "flex h-11 w-14 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {SHORT[day]}
              </button>
            );
          })}
        </div>
        {noDays && (
          <p className="mt-2 text-xs font-medium text-destructive">
            Select at least one open day.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {footer}
        <Button
          className="ml-auto"
          loading={saving}
          disabled={badTimes || noDays}
          onClick={() =>
            onSave({
              open_time: open,
              close_time: close,
              all_days: active.size === 7,
              active_days: Array.from(active).sort((a, b) => a - b),
            })
          }
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
