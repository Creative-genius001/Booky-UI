"use client";

import { useState } from "react";
import type { BusinessDayInput } from "@/lib/api/shops";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Display order Monday → Sunday (weekday key: 0=Sun … 6=Sat).
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const NAMES: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "18:00";

export function defaultBusinessDays(): BusinessDayInput[] {
  return ORDER.map((weekday) => ({
    weekday,
    isOpen: weekday !== 0,
    openTime: DEFAULT_OPEN,
    closeTime: DEFAULT_CLOSE,
  }));
}

/** Normalise/merge server days into the Mon→Sun ordered editor shape. */
export function toEditorDays(
  days?: { weekday: number; isOpen: boolean; openTime: string; closeTime: string }[],
): BusinessDayInput[] {
  const map = new Map(days?.map((d) => [d.weekday, d]));
  return ORDER.map((weekday) => {
    const d = map.get(weekday);
    return {
      weekday,
      isOpen: d?.isOpen ?? weekday !== 0,
      openTime: d?.openTime?.slice(0, 5) ?? DEFAULT_OPEN,
      closeTime: d?.closeTime?.slice(0, 5) ?? DEFAULT_CLOSE,
    };
  });
}

interface Props {
  initial?: BusinessDayInput[];
  saving?: boolean;
  saveLabel?: string;
  onSave: (days: BusinessDayInput[]) => void;
  footer?: React.ReactNode;
}

export function BusinessHoursEditor({
  initial,
  saving,
  saveLabel = "Save changes",
  onSave,
  footer,
}: Props) {
  const [days, setDays] = useState<BusinessDayInput[]>(
    initial ?? defaultBusinessDays(),
  );

  function patch(weekday: number, change: Partial<BusinessDayInput>) {
    setDays((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, ...change } : d)),
    );
  }

  const invalid = days.some(
    (d) => d.isOpen && d.openTime >= d.closeTime,
  );

  return (
    <div className="space-y-3">
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {days.map((d) => {
          const badTimes = d.isOpen && d.openTime >= d.closeTime;
          return (
            <div
              key={d.weekday}
              className={cn(
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
                !d.isOpen && "bg-muted/30",
              )}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={d.isOpen}
                  onCheckedChange={(v) => patch(d.weekday, { isOpen: v })}
                  aria-label={`${NAMES[d.weekday]} open`}
                />
                <span className="w-24 font-medium">{NAMES[d.weekday]}</span>
              </div>
              {d.isOpen ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={d.openTime}
                    invalid={badTimes}
                    onChange={(e) => patch(d.weekday, { openTime: e.target.value })}
                    className="w-32"
                    aria-label={`${NAMES[d.weekday]} opening time`}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={d.closeTime}
                    invalid={badTimes}
                    onChange={(e) => patch(d.weekday, { closeTime: e.target.value })}
                    className="w-32"
                    aria-label={`${NAMES[d.weekday]} closing time`}
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground sm:pr-2">Closed</span>
              )}
            </div>
          );
        })}
      </div>

      {invalid && (
        <p className="text-xs font-medium text-destructive">
          Closing time must be after opening time on every open day.
        </p>
      )}

      <div className="flex items-center gap-3">
        {footer}
        <Button
          onClick={() => onSave(days)}
          loading={saving}
          disabled={invalid}
          className="ml-auto"
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
