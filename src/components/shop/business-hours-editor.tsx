"use client";

import { useMemo, useState } from "react";
import type { BusinessDay } from "@/types";
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

export interface DayChange {
  id: string;
  is_active: boolean;
  open_time: string;
  close_time: string;
}

/**
 * Dashboard per-day hours editor. Each day is a real BusinessDay row (with an
 * id) so edits are saved via PATCH /shops/:id/business-days/:dayId. onSave
 * receives only the rows that actually changed.
 */
export function BusinessHoursEditor({
  days: initial,
  saving,
  onSave,
}: {
  days: BusinessDay[];
  saving?: boolean;
  onSave: (changed: DayChange[]) => void;
}) {
  const ordered = useMemo(() => {
    const map = new Map(initial.map((d) => [d.weekday, d]));
    return ORDER.map((w) => map.get(w)).filter(Boolean) as BusinessDay[];
  }, [initial]);

  const [rows, setRows] = useState<BusinessDay[]>(ordered);

  function patch(id: string, change: Partial<BusinessDay>) {
    setRows((prev) => prev.map((d) => (d.id === id ? { ...d, ...change } : d)));
  }

  const invalid = rows.some((d) => d.is_active && d.open_time >= d.close_time);

  function save() {
    const byId = new Map(initial.map((d) => [d.id, d]));
    const changed: DayChange[] = rows
      .filter((r) => {
        const o = byId.get(r.id);
        return (
          o &&
          (o.is_active !== r.is_active ||
            o.open_time.slice(0, 5) !== r.open_time.slice(0, 5) ||
            o.close_time.slice(0, 5) !== r.close_time.slice(0, 5))
        );
      })
      .map((r) => ({
        id: r.id,
        is_active: r.is_active,
        open_time: r.open_time.slice(0, 5),
        close_time: r.close_time.slice(0, 5),
      }));
    onSave(changed);
  }

  return (
    <div className="space-y-3">
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {rows.map((d) => {
          const badTimes = d.is_active && d.open_time >= d.close_time;
          return (
            <div
              key={d.id}
              className={cn(
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
                !d.is_active && "bg-muted/30",
              )}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={d.is_active}
                  onCheckedChange={(v) => patch(d.id, { is_active: v })}
                  aria-label={`${NAMES[d.weekday]} open`}
                />
                <span className="w-24 font-medium">{NAMES[d.weekday]}</span>
              </div>
              {d.is_active ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={d.open_time.slice(0, 5)}
                    invalid={badTimes}
                    onChange={(e) => patch(d.id, { open_time: e.target.value })}
                    className="w-32"
                    aria-label={`${NAMES[d.weekday]} opening time`}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    value={d.close_time.slice(0, 5)}
                    invalid={badTimes}
                    onChange={(e) => patch(d.id, { close_time: e.target.value })}
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

      <div className="flex justify-end">
        <Button onClick={save} loading={saving} disabled={invalid}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
