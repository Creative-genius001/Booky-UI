"use client";

import { useState } from "react";
import { CalendarX2, Plus, Trash2 } from "lucide-react";
import { useActiveShop } from "@/hooks/use-active-shop";
import {
  useBlockedDates,
  useAddBlockedDate,
  useDeleteBlockedDate,
} from "@/hooks/use-shop-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { longDate, todayISO, isPastDate, isoDatePart } from "@/lib/dates";

export default function BlockedDatesPage() {
  const { shopId } = useActiveShop();
  const { data, isLoading } = useBlockedDates(shopId ?? undefined);
  const add = useAddBlockedDate(shopId ?? "");
  const remove = useDeleteBlockedDate(shopId ?? "");

  const [date, setDate] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  // Backend returns each blocked date as a timestamp; compare on the date part.
  const blockedSet = new Set(data?.map((d) => isoDatePart(d.date)));

  function submit() {
    if (!date) return;
    add.mutate(
      { date, reason: reason || undefined },
      {
        onSuccess: () => {
          setDate(null);
          setReason("");
        },
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Blocked Dates"
        description="Close specific days for holidays, maintenance or time off."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add a blocked date */}
        <Card>
          <CardHeader>
            <CardTitle>Block a date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              value={date}
              minDate={new Date(todayISO())}
              onSelect={(iso) => setDate(iso)}
              isAvailable={(iso) => !blockedSet.has(iso)}
            />
            <FormField label="Reason (optional)" htmlFor="reason">
              <Input
                id="reason"
                placeholder="e.g. Public holiday"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FormField>
            <Button
              className="w-full"
              disabled={!date}
              loading={add.isPending}
              onClick={submit}
            >
              <Plus className="size-4" />
              {date ? `Block ${longDate(date)}` : "Select a date to block"}
            </Button>
          </CardContent>
        </Card>

        {/* Current blocked dates */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Blocked dates
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((d) => (
                  <Card key={d.id}>
                    <CardContent className="flex items-center justify-between gap-3 py-4">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {longDate(d.date)}
                          {isPastDate(d.date) && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (past)
                            </span>
                          )}
                        </p>
                        {d.reason && (
                          <p className="text-sm text-muted-foreground">
                            {d.reason}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-destructive hover:bg-destructive/10"
                        onClick={() => remove.mutate(d.id)}
                        aria-label="Unblock date"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarX2 />}
              title="No blocked dates"
              description="Your shop is open on all working days. Block a date to close it."
            />
          )}
        </div>
      </div>
    </div>
  );
}
