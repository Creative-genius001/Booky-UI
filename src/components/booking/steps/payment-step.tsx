"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Pencil } from "lucide-react";
import { useBookingStore } from "@/stores/booking-store";
import { useInitiateBooking } from "@/hooks/use-bookings";
import { useInitPayment } from "@/hooks/use-payment";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingSummary } from "@/components/booking/booking-summary";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import { formatKobo } from "@/lib/utils";

export function PaymentStep({
  shopId,
  slug,
  onEditDetails,
}: {
  shopId: string;
  slug: string;
  onEditDetails: () => void;
}) {
  const store = useBookingStore();
  const { service, date, startTime, customer, notes } = store;
  const initiate = useInitiateBooking();
  const initPayment = useInitPayment();
  const [redirecting, setRedirecting] = useState(false);

  const busy = initiate.isPending || initPayment.isPending || redirecting;

  async function pay() {
    if (!service || !date || !startTime) return;
    try {
      const { booking, payment } = await initiate.mutateAsync({
        shopId,
        serviceId: service.id,
        date,
        startTime,
        customer,
        notes: notes || undefined,
      });

      const callbackUrl = `${config.appUrl}/book/${slug}/success?code=${encodeURIComponent(
        booking.code,
      )}`;

      // Some backends return the Paystack URL straight from /bookings/initiate.
      let authorizationUrl = payment?.authorizationUrl;
      if (!authorizationUrl) {
        const init = await initPayment.mutateAsync({
          bookingCode: booking.code,
          bookingId: booking.id,
          email: customer.email,
          callbackUrl,
        });
        authorizationUrl = init.authorizationUrl;
      }

      if (authorizationUrl) {
        setRedirecting(true);
        window.location.assign(authorizationUrl);
      }
    } catch {
      // errors surfaced via toast in the hooks
    }
  }

  if (!service) return null;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-6">
          <BookingSummary />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Your details</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-primary"
              onClick={onEditDetails}
              disabled={busy}
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          </div>
          <Separator />
          <dl className="grid gap-1.5 text-sm">
            <Detail label="Name" value={customer.name} />
            <Detail label="Email" value={customer.email} />
            <Detail label="Phone" value={customer.phone} />
            {notes && <Detail label="Notes" value={notes} />}
          </dl>
        </CardContent>
      </Card>

      <Alert variant="info" hideIcon>
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 shrink-0 text-success" />
          <p className="text-sm text-muted-foreground">
            Payment is processed securely by{" "}
            <span className="font-medium text-foreground">Paystack</span>. Your
            slot is held while you pay and confirmed the moment payment succeeds.
          </p>
        </div>
      </Alert>

      <Button
        size="xl"
        className="w-full"
        onClick={pay}
        loading={busy}
        disabled={busy}
      >
        <Lock className="size-4" />
        {redirecting
          ? "Redirecting to Paystack…"
          : `Pay ${formatKobo(service.priceKobo)}`}
      </Button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
