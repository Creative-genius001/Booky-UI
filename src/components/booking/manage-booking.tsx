"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  Clock,
  Scissors,
  X,
} from "lucide-react";
import { useBookingByCode, useCancelBooking } from "@/hooks/use-bookings";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RescheduleDialog } from "@/components/booking/reschedule-dialog";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/dashboard/status-badge";
import { formatKobo, formatTimeLabel } from "@/lib/utils";
import { longDate, isoClock, isoDatePart } from "@/lib/dates";
import type { BookingListItem, PaymentStatus } from "@/types";

function isModifiable(b: BookingListItem): boolean {
  const leadOk = new Date(b.starts_at).getTime() > Date.now() + 3600_000;
  return leadOk && (b.status === "confirmed" || b.status === "pending_payment");
}

export function ManageBooking({ slug, code }: { slug: string; code?: string }) {
  const { data: booking, isLoading } = useBookingByCode(code);
  const cancel = useCancelBooking();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <div className="container flex h-14 items-center">
          <Link href={`/book/${slug}`}>
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <div className="container max-w-lg py-8">
        {!code ? (
          <EmptyState
            title="Missing booking code"
            description="Open this page from your booking confirmation link."
          />
        ) : isLoading ? (
          <Spinner className="mx-auto" />
        ) : !booking ? (
          <EmptyState
            title="Booking not found"
            description="Check the link from your confirmation email."
          />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Your booking</h1>
              <BookingStatusBadge status={booking.status} />
            </div>

            <Card>
              <CardContent className="space-y-3 pt-6">
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
                <Separator />
                <div className="flex items-center justify-between">
                  <PaymentStatusBadge
                    status={(booking.payment_status || "pending") as PaymentStatus}
                  />
                  <span className="text-lg font-bold">
                    {formatKobo(booking.amount_kobo)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
              {booking.code}
            </p>

            {isModifiable(booking) ? (
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {booking.status === "confirmed" && (
                  <Button variant="outline" onClick={() => setRescheduleOpen(true)}>
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
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {booking.status === "cancelled"
                  ? "This booking has been cancelled."
                  : "This booking can no longer be changed."}
              </p>
            )}

            <div className="mt-8 text-center">
              <Button asChild variant="ghost">
                <Link href={`/book/${slug}`}>Book another appointment</Link>
              </Button>
            </div>

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Cancel this booking?"
              description={
                booking.payment_status === "success"
                  ? "You'll be refunded to your original payment method. This can't be undone."
                  : "This can't be undone."
              }
              confirmLabel="Cancel booking"
              destructive
              loading={cancel.isPending}
              onConfirm={() =>
                cancel.mutate(booking.code, {
                  onSuccess: () => setConfirmOpen(false),
                })
              }
            />

            <RescheduleDialog
              open={rescheduleOpen}
              onOpenChange={setRescheduleOpen}
              shopSlug={slug}
              code={booking.code}
              currentStart={booking.starts_at}
            />
          </>
        )}
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
