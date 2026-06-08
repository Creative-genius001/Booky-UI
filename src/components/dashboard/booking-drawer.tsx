"use client";

import {
  CalendarDays,
  Check,
  Clock,
  Mail,
  Phone,
  Scissors,
  UserX,
  X,
} from "lucide-react";
import { useUpdateBookingStatus } from "@/hooks/use-bookings";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/status-badge";
import { formatKobo, formatTimeLabel, formatDuration } from "@/lib/utils";
import { longDate } from "@/lib/dates";
import type { Booking } from "@/types";

export function BookingDrawer({
  booking,
  shopId,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  shopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateBookingStatus(shopId);

  if (!booking) return null;

  const isActionable =
    booking.status === "confirmed" || booking.status === "pending";

  function setStatus(status: Booking["status"]) {
    if (!booking) return;
    update.mutate(
      { id: booking.id, status },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
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
          {/* Appointment */}
          <section className="space-y-3 rounded-xl border border-border p-4">
            <Row
              icon={<Scissors className="size-4" />}
              label={booking.service?.name ?? "Service"}
              value={
                booking.service
                  ? formatDuration(booking.service.durationMinutes)
                  : ""
              }
            />
            <Row
              icon={<CalendarDays className="size-4" />}
              label="Date"
              value={longDate(booking.date)}
            />
            <Row
              icon={<Clock className="size-4" />}
              label="Time"
              value={formatTimeLabel(booking.startTime)}
            />
          </section>

          {/* Customer */}
          <section>
            <h3 className="mb-2 text-sm font-semibold">Customer</h3>
            <div className="space-y-2 rounded-xl border border-border p-4 text-sm">
              <p className="font-medium">{booking.customer.name}</p>
              <a
                href={`mailto:${booking.customer.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-4" /> {booking.customer.email}
              </a>
              <a
                href={`tel:${booking.customer.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-4" /> {booking.customer.phone}
              </a>
            </div>
          </section>

          {/* Notes */}
          {booking.notes && (
            <section>
              <h3 className="mb-2 text-sm font-semibold">Notes</h3>
              <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                {booking.notes}
              </p>
            </section>
          )}

          {/* Payment */}
          <section>
            <h3 className="mb-2 text-sm font-semibold">Payment</h3>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <PaymentStatusBadge status={booking.paymentStatus} />
              <span className="text-lg font-bold">
                {formatKobo(booking.amountKobo)}
              </span>
            </div>
          </section>
        </div>

        {isActionable && (
          <SheetFooter>
            <Button
              onClick={() => setStatus("completed")}
              loading={update.isPending}
            >
              <Check className="size-4" /> Mark completed
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setStatus("no_show")}
                disabled={update.isPending}
              >
                <UserX className="size-4" /> No show
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setStatus("cancelled")}
                disabled={update.isPending}
              >
                <X className="size-4" /> Cancel
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
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
