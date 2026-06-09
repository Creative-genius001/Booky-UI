"use client";

import { useEffect, useState } from "react";
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
import { formatKobo, formatTimeLabel } from "@/lib/utils";
import { friendlyDate, isoClock } from "@/lib/dates";

const PENDING_KEY = "bookly.pendingBooking";

interface Pending {
  code: string;
  slug: string;
}

export function PaymentCallbackView() {
  const reset = useBookingStore((s) => s.reset);
  const [pending, setPending] = useState<Pending | null>(null);
  const [loaded, setLoaded] = useState(false);

  // The booking code is stashed client-side before the Paystack redirect
  // (Paystack only returns its own reference on the callback).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (raw) setPending(JSON.parse(raw) as Pending);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const { data: booking, isLoading } = useBookingByCode(pending?.code, true);

  const settled =
    booking?.payment_status === "success" ||
    booking?.status === "confirmed";
  const failed =
    booking?.payment_status === "failed" ||
    booking?.status === "cancelled" ||
    booking?.status === "expired";

  useEffect(() => {
    if (settled && pending) {
      reset(pending.slug);
      sessionStorage.removeItem(PENDING_KEY);
    }
  }, [settled, pending, reset]);

  const slug = pending?.slug;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <div className="container flex h-14 items-center">
          <Logo size="sm" />
        </div>
      </header>

      <div className="container flex max-w-lg flex-col items-center py-10 sm:py-16">
        {!loaded || (pending && !settled && !failed && isLoading) ? (
          <Pending />
        ) : settled ? (
          <Result ok />
        ) : failed ? (
          <Result ok={false} />
        ) : (
          <Pending />
        )}

        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
          {settled
            ? "You're booked!"
            : failed
              ? "Payment didn't go through"
              : "Confirming your payment…"}
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          {settled
            ? "Your slot is confirmed and we've emailed your receipt. Show your booking code at the shop."
            : failed
              ? "You haven't been charged. You can try booking again."
              : "This only takes a few seconds — please keep this page open."}
        </p>

        {booking?.code && (
          <button
            onClick={() => {
              navigator.clipboard?.writeText(booking.code);
              toast.success("Booking code copied");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-sm font-semibold tracking-wider shadow-soft transition-colors hover:bg-muted"
          >
            {booking.code}
            <Copy className="size-3.5 text-muted-foreground" />
          </button>
        )}

        {booking && settled && (
          <Card className="mt-6 w-full">
            <CardContent className="space-y-3 pt-6">
              <Row
                icon={<Scissors className="size-4" />}
                label={booking.service_name || "Service"}
                value=""
              />
              <Row
                icon={<CalendarDays className="size-4" />}
                label="Date"
                value={friendlyDate(booking.starts_at.slice(0, 10))}
              />
              <Row
                icon={<Clock className="size-4" />}
                label="Time"
                value={formatTimeLabel(isoClock(booking.starts_at))}
              />
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Amount paid
                </span>
                <span className="text-lg font-bold">
                  {formatKobo(booking.amount_kobo)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex w-full flex-col gap-2">
          <Button asChild size="lg" className="w-full">
            <Link href={slug ? `/book/${slug}` : "/"}>
              {settled ? "Book another appointment" : failed ? "Try again" : "Back"}
            </Link>
          </Button>
          {settled && booking?.code && slug && (
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={`/book/${slug}/manage?code=${encodeURIComponent(booking.code)}`}>
                Manage this booking
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pending() {
  return (
    <div className="flex size-20 items-center justify-center rounded-full bg-accent/20">
      <Loader2 className="size-9 animate-spin text-accent-foreground" />
    </div>
  );
}

function Result({ ok }: { ok: boolean }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      className={`flex size-20 items-center justify-center rounded-full ${
        ok ? "bg-success/15" : "bg-destructive/15"
      }`}
    >
      <Icon className={`size-11 ${ok ? "text-success" : "text-destructive"}`} />
    </motion.div>
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
