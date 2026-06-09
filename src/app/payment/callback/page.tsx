import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentCallbackView } from "@/components/booking/payment-callback-view";
import { FullPageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Payment confirmation",
  robots: { index: false },
};

// Paystack redirects here (PAYSTACK_CALLBACK_URL) after checkout.
export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading…" />}>
      <PaymentCallbackView />
    </Suspense>
  );
}
