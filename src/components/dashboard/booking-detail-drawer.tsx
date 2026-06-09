"use client";

import { useState } from "react";
import { CalendarDays, CalendarClock, Clock, Mail, Scissors, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RescheduleDialog } from "@/components/booking/reschedule-dialog";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/status-badge";
import { useCancelBooking } from "@/hooks/use-bookings";
import { formatKobo, formatTimeLabel } from "@/lib/utils";
import { longDate, isoClock, isoDatePart } from "@/lib/dates";
import type { BookingListItem, PaymentStatus } from "@/types";

/** A booking can be changed up to 1 hour before it starts. */
export function isModifiable(booking: BookingListItem): boolean {
  const leadOk = new Date(booking.starts_at).getTime() > Date.now() + 3600_000;
  return leadOk && (booking.status === "confirmed" || booking.status === "pending_payment");
}

export function BookingDetailDrawer({
  booking,
  shopSlug,
  open,
  onOpenChange,
}: {
  booking: BookingListItem | null;
  shopSlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cancel = useCancelBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!booking) return null;

  const canModify = isModifiable(booking);
  const canReschedule = canModify && booking.status === "confirmed" && !!shopSlug;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle>Booking details</SheetTitle>
              <BookingStatusBadge status={booking.status} />
            </div>
            <SheetDescription className="font-mono text-xs">
              {booking.code}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
            <section className="space-y-3 rounded-xl border border-border p-4">
              <Row
                icon={<Scissors className="size-4" />}
                label={booking.service_name || "Service"}
                value=""
              />
              <Row
                icon={<CalendarDays className="size-4" />}
                label="Date"
                value={longDate(isoDatePart(booking.starts_at))}
              />
              <Row
                icon={<Clock className="size-4" />}
                label="Time"
                value={formatTimeLabel(isoClock(booking.starts_at))}
              />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Customer</h3>
              <div className="space-y-2 rounded-xl border border-border p-4 text-sm">
                <p className="font-medium">{booking.customer_name}</p>
                <a
                  href={`mailto:${booking.customer_email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-4" /> {booking.customer_email}
                </a>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Payment</h3>
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <PaymentStatusBadge
                  status={(booking.payment_status || "pending") as PaymentStatus}
                />
                <span className="text-lg font-bold">
                  {formatKobo(booking.amount_kobo)}
                </span>
              </div>
            </section>

            {!canModify && (
              <>
                <Separator />
                <p className="px-1 text-xs text-muted-foreground">
                  This booking can no longer be changed (it's already settled or
                  starts within the hour).
                </p>
              </>
            )}
          </div>

          {canModify && (
            <SheetFooter>
              {canReschedule && (
                <Button
                  variant="outline"
                  onClick={() => setRescheduleOpen(true)}
                >
                  <CalendarClock className="size-4" /> Reschedule
                </Button>
              )}
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmOpen(true)}
              >
                <X className="size-4" /> Cancel booking
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this booking?"
        description={
          booking.payment_status === "success"
            ? "The customer will be refunded and notified. This can't be undone."
            : "The customer will be notified. This can't be undone."
        }
        confirmLabel="Cancel booking"
        destructive
        loading={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(booking.code, {
            onSuccess: () => {
              setConfirmOpen(false);
              onOpenChange(false);
            },
          })
        }
      />

      {shopSlug && (
        <RescheduleDialog
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          shopSlug={shopSlug}
          code={booking.code}
          currentStart={booking.starts_at}
          onRescheduled={() => onOpenChange(false)}
        />
      )}
    </>
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
