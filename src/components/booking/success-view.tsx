"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Scissors,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useBookingByCode } from "@/hooks/use-bookings";
import { useBookingStore } from "@/stores/booking-store";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  formatKobo,
  formatDuration,
  formatTimeLabel,
} from "@/lib/utils";
import { longDate } from "@/lib/dates";

export function SuccessView({ slug, code }: { slug: string; code?: string }) {
  const reset = useBookingStore((s) => s.reset);
  // Poll until the webhook flips payment status to a terminal state.
  const { data: booking, isLoading } = useBookingByCode(code, true);

  const paid = booking?.paymentStatus === "paid";
  const failed = booking?.paymentStatus === "failed";

  useEffect(() => {
    if (paid) reset(slug);
  }, [paid, reset, slug]);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <div className="container flex h-14 items-center">
          <Logo size="sm" />
        </div>
      </header>

      <div className="container flex max-w-lg flex-col items-center py-10 sm:py-16">
        {!code ? (
          <ResultIcon state="failed" />
        ) : isLoading || (!paid && !failed) ? (
          <PendingState />
        ) : paid ? (
          <ResultIcon state="success" />
        ) : (
          <ResultIcon state="failed" />
        )}

        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
          {!code
            ? "Missing booking reference"
            : paid
              ? "You're booked!"
              : failed
                ? "Payment didn't go through"
                : "Confirming your payment…"}
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          {!code
            ? "We couldn't find your booking reference. If you were charged, contact the shop with your payment receipt."
            : paid
              ? "Your slot is confirmed and we've emailed your receipt. Show your booking code at the shop."
              : failed
                ? "No worries — you haven't been charged. You can try booking again."
                : "This only takes a few seconds. Please keep this page open."}
        </p>

        {code && (
          <BookingCodeChip code={booking?.code ?? code} />
        )}

        {booking && paid && (
          <Card className="mt-6 w-full">
            <CardContent className="space-y-3 pt-6">
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
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Amount paid
                </span>
                <span className="text-lg font-bold">
                  {formatKobo(booking.amountKobo)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex w-full flex-col gap-2">
          {failed && (
            <Button asChild size="lg" className="w-full">
              <Link href={`/book/${slug}`}>Try again</Link>
            </Button>
          )}
          <Button
            asChild
            variant={failed ? "outline" : "default"}
            size="lg"
            className="w-full"
          >
            <Link href={`/book/${slug}`}>
              {paid ? "Book another appointment" : "Back to booking"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-accent/20">
        <Loader2 className="size-9 animate-spin text-accent-foreground" />
      </div>
    </div>
  );
}

function ResultIcon({ state }: { state: "success" | "failed" }) {
  const Icon = state === "success" ? CheckCircle2 : XCircle;
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className={`flex size-20 items-center justify-center rounded-full ${
        state === "success" ? "bg-success/15" : "bg-destructive/15"
      }`}
    >
      <Icon
        className={`size-11 ${
          state === "success" ? "text-success" : "text-destructive"
        }`}
      />
    </motion.div>
  );
}

function BookingCodeChip({ code }: { code: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(code);
        toast.success("Booking code copied");
      }}
      className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-sm font-semibold tracking-wider shadow-soft transition-colors hover:bg-muted"
    >
      {code}
      <Copy className="size-3.5 text-muted-foreground" />
    </button>
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
